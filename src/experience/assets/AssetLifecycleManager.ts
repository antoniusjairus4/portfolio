import { selectProductionAssetVariant } from '@/experience/assets/manifest';
import type {
  ProductionAssetDefinition,
  ProductionAssetDriver,
  ProductionAssetEnvironment,
  ProductionAssetLease,
  ProductionAssetOperation,
  ProductionAssetOwner,
  ProductionAssetSnapshot,
  ProductionAssetState,
  ProductionAssetVariant,
} from '@/experience/assets/types';
import type { ProjectSceneKey } from '@/experience/ProjectExperienceProvider';

interface AssetRecord {
  definition: ProductionAssetDefinition;
  state: ProductionAssetState;
  operation: ProductionAssetOperation;
  variant: ProductionAssetVariant | null;
  generation: number;
  abortController: AbortController | null;
  bytes: ArrayBuffer | null;
  prepared: unknown;
  resident: unknown;
  leases: Map<symbol, ProjectSceneKey>;
  requestPromise: Promise<void> | null;
  preparePromise: Promise<void> | null;
  residentPromise: Promise<void> | null;
  retryCount: number;
  error: string | null;
  disposeRequested: boolean;
}

type SnapshotListener = (snapshot: readonly ProductionAssetSnapshot[]) => void;
type ByteFetcher = (url: string, signal: AbortSignal) => Promise<ArrayBuffer>;

class BoundedTaskQueue {
  private active = 0;
  private readonly pending: Array<() => void> = [];

  constructor(private readonly limit: number) {}

  run<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const start = () => {
        this.active += 1;
        task().then(resolve, reject).finally(() => {
          this.active -= 1;
          this.pending.shift()?.();
        });
      };
      if (this.active < this.limit) start();
      else this.pending.push(start);
    });
  }
}

const defaultByteFetcher: ByteFetcher = async (url, signal) => {
  const response = await fetch(url, { signal, credentials: 'same-origin' });
  if (!response.ok) throw new Error(`Asset request failed (${response.status})`);
  return response.arrayBuffer();
};

export class AssetLifecycleManager {
  private readonly records = new Map<string, AssetRecord>();
  private readonly drivers = new Map<string, ProductionAssetDriver>();
  private readonly listeners = new Set<SnapshotListener>();
  private readonly requestQueue: BoundedTaskQueue;
  private readonly prepareQueue: BoundedTaskQueue;

  constructor(
    private readonly environment: ProductionAssetEnvironment,
    definitions: readonly ProductionAssetDefinition[] = [],
    private readonly fetchBytes: ByteFetcher = defaultByteFetcher,
    limits: { requests?: number; preparations?: number } = {},
  ) {
    this.requestQueue = new BoundedTaskQueue(limits.requests ?? 2);
    this.prepareQueue = new BoundedTaskQueue(limits.preparations ?? 1);
    definitions.forEach((definition) => {
      this.register(definition);
    });
  }

  register(definition: ProductionAssetDefinition) {
    if (this.records.has(definition.id)) throw new Error(`Duplicate asset ID: ${definition.id}`);
    this.records.set(definition.id, {
      definition,
      state: 'not-requested',
      operation: 'idle',
      variant: null,
      generation: 0,
      abortController: null,
      bytes: null,
      prepared: null,
      resident: null,
      leases: new Map(),
      requestPromise: null,
      preparePromise: null,
      residentPromise: null,
      retryCount: 0,
      error: null,
      disposeRequested: false,
    });
    this.emit();
  }

  registerDriver<TPrepared, TResident, TContext>(
    resourceType: string,
    driver: ProductionAssetDriver<TPrepared, TResident, TContext>,
  ) {
    this.drivers.set(resourceType, driver as unknown as ProductionAssetDriver);
  }

  subscribe(listener: SnapshotListener) {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => this.listeners.delete(listener);
  }

  getSnapshot(): readonly ProductionAssetSnapshot[] {
    return [...this.records.values()].map((record) => ({
      id: record.definition.id,
      owner: record.definition.owner,
      state: record.state,
      operation: record.operation,
      variant: record.variant?.id ?? null,
      bytesRequested: record.state !== 'not-requested' && record.state !== 'disposed',
      downloaded: record.bytes !== null,
      prepared: record.prepared !== null,
      resident: record.resident !== null,
      active: record.leases.size > 0,
      leaseCount: record.leases.size,
      retryCount: record.retryCount,
      error: record.error,
    }));
  }

  definitionsForOwner(owner: ProductionAssetOwner) {
    return [...this.records.values()]
      .filter((record) => record.definition.owner === owner)
      .map((record) => record.definition);
  }

  async requestOwner(owner: ProductionAssetOwner) {
    await Promise.all(this.definitionsForOwner(owner).map((definition) => this.request(definition.id)));
  }

  async prepareOwner(owner: ProductionAssetOwner) {
    await Promise.all(this.definitionsForOwner(owner).map((definition) => this.prepare(definition.id)));
  }

  async request(assetId: string, options: { retry?: boolean } = {}): Promise<void> {
    const record = this.requireRecord(assetId);
    if (record.bytes) return;
    if (record.requestPromise) return record.requestPromise;
    if (record.state === 'failed') {
      if (!options.retry || record.retryCount >= 1) return;
      record.retryCount += 1;
    }

    const variant = record.variant ?? selectProductionAssetVariant(record.definition, this.environment);
    if (!variant) return;
    record.variant = variant;
    record.error = null;
    const generation = ++record.generation;
    const abortController = new AbortController();
    record.abortController = abortController;
    this.setState(record, 'downloading', 'requesting');

    record.requestPromise = this.requestQueue
      .run(async () => {
        if (record.generation !== generation) return;
        const bytes = await this.fetchBytes(variant.url, abortController.signal);
        if (record.generation !== generation) return;
        record.bytes = bytes;
        this.setState(record, 'downloaded');
      })
      .catch((error: unknown) => {
        if (record.generation !== generation) return;
        if (abortController.signal.aborted) {
          this.setState(record, 'not-requested');
          return;
        }
        record.error = error instanceof Error ? error.message : 'Unknown asset request failure';
        this.setState(record, 'failed');
      })
      .finally(() => {
        if (record.generation === generation) {
          record.abortController = null;
          record.requestPromise = null;
          record.operation = 'idle';
          this.emit();
        }
      });
    return record.requestPromise;
  }

  async prepare(assetId: string): Promise<void> {
    const record = this.requireRecord(assetId);
    if (record.prepared !== null) return;
    if (record.preparePromise) return record.preparePromise;
    if (record.state === 'failed') return;
    await Promise.all((record.definition.dependencies ?? []).map((id) => this.prepare(id)));
    await this.request(assetId);
    if (!record.bytes) return;

    const driver = this.requireDriver(record);
    const generation = record.generation;
    record.operation = 'preparing';
    this.emit();
    record.preparePromise = this.prepareQueue
      .run(async () => {
        const prepared = await driver.prepare(
          record.bytes as ArrayBuffer,
          record.definition,
          record.variant as ProductionAssetVariant,
        );
        if (record.generation !== generation) {
          driver.disposePrepared?.(prepared);
          return;
        }
        record.prepared = prepared;
        this.setState(record, 'prepared');
      })
      .catch((error: unknown) => this.fail(record, generation, error))
      .finally(() => {
        if (record.generation === generation) {
          record.preparePromise = null;
          record.operation = 'idle';
          this.emit();
        }
      });
    return record.preparePromise;
  }

  async activate<T = unknown>(
    assetId: string,
    consumer: ProjectSceneKey,
    residencyContext: unknown,
  ): Promise<ProductionAssetLease<T> | null> {
    const record = this.requireRecord(assetId);
    this.assertConsumer(record.definition, consumer);
    await this.prepare(assetId);
    if (record.prepared === null) return null;
    const driver = this.requireDriver(record);

    if (record.resident === null) {
      if (!record.residentPromise) {
        const generation = record.generation;
        record.operation = 'uploading';
        this.emit();
        record.residentPromise = Promise.resolve(
          driver.makeResident(
            record.prepared,
            residencyContext,
            record.definition,
            record.variant as ProductionAssetVariant,
          ),
        )
          .then((resident) => {
            if (record.generation !== generation) {
              driver.disposeResident(resident);
              return;
            }
            record.resident = resident;
            this.setState(record, 'gpu-resident');
          })
          .catch((error: unknown) => this.fail(record, generation, error))
          .finally(() => {
            if (record.generation === generation) {
              record.residentPromise = null;
              record.operation = 'idle';
              this.emit();
            }
          });
      }
      await record.residentPromise;
    }
    if (record.resident === null || record.state === 'failed') return null;

    const token = Symbol(`${assetId}:${consumer}`);
    record.disposeRequested = false;
    record.leases.set(token, consumer);
    this.setState(record, 'active');
    let released = false;
    return {
      assetId,
      value: record.resident as T,
      release: (retain = true) => {
        if (released) return;
        released = true;
        record.leases.delete(token);
        if (record.leases.size > 0) {
          this.emit();
          return;
        }
        if (record.disposeRequested) {
          this.dispose(assetId);
        } else if (retain && record.definition.disposal !== 'immediate-on-release') {
          this.setState(record, 'inactive-retained');
        } else {
          this.dispose(assetId);
        }
      },
    };
  }

  cancel(assetId: string) {
    const record = this.requireRecord(assetId);
    record.generation += 1;
    record.abortController?.abort();
    record.abortController = null;
    record.requestPromise = null;
    record.preparePromise = null;
    record.residentPromise = null;
    record.operation = 'idle';
    if (!record.bytes && record.prepared === null && record.resident === null) {
      record.state = 'not-requested';
    }
    this.emit();
  }

  async retry(assetId: string) {
    const record = this.requireRecord(assetId);
    if (record.state !== 'failed' || record.retryCount >= 1) return false;
    record.retryCount += 1;
    record.error = null;
    record.state = record.bytes ? 'downloaded' : 'not-requested';
    this.emit();
    if (!record.bytes) await this.request(assetId);
    return record.error === null;
  }

  disposeOwner(owner: ProductionAssetOwner) {
    for (const definition of this.definitionsForOwner(owner)) this.dispose(definition.id);
  }

  dispose(assetId: string) {
    const record = this.requireRecord(assetId);
    if (record.leases.size > 0) {
      record.disposeRequested = true;
      this.emit();
      return false;
    }
    record.generation += 1;
    record.abortController?.abort();
    const driver = this.drivers.get(record.definition.resourceType);
    if (record.resident !== null) driver?.disposeResident(record.resident);
    else if (record.prepared !== null && !record.residentPromise) {
      driver?.disposePrepared?.(record.prepared);
    }
    record.abortController = null;
    record.requestPromise = null;
    record.preparePromise = null;
    record.residentPromise = null;
    record.bytes = null;
    record.prepared = null;
    record.resident = null;
    record.operation = 'idle';
    record.error = null;
    record.disposeRequested = false;
    record.state = 'disposed';
    this.emit();
    return true;
  }

  disposeAll() {
    for (const assetId of this.records.keys()) this.dispose(assetId);
  }

  private requireRecord(assetId: string) {
    const record = this.records.get(assetId);
    if (!record) throw new Error(`Unknown asset ID: ${assetId}`);
    return record;
  }

  private requireDriver(record: AssetRecord) {
    const driver = this.drivers.get(record.definition.resourceType);
    if (!driver) throw new Error(`No asset driver registered for ${record.definition.resourceType}`);
    return driver;
  }

  private assertConsumer(definition: ProductionAssetDefinition, consumer: ProjectSceneKey) {
    if (definition.owner !== 'shared' && definition.owner !== consumer) {
      throw new Error(`${consumer} cannot lease ${definition.id}, owned by ${definition.owner}`);
    }
    if (definition.allowedConsumers && !definition.allowedConsumers.includes(consumer)) {
      throw new Error(`${consumer} is not an allowed consumer of ${definition.id}`);
    }
  }

  private fail(record: AssetRecord, generation: number, error: unknown) {
    if (record.generation !== generation) return;
    record.error = error instanceof Error ? error.message : 'Unknown asset lifecycle failure';
    this.setState(record, 'failed');
  }

  private setState(
    record: AssetRecord,
    state: ProductionAssetState,
    operation: ProductionAssetOperation = 'idle',
  ) {
    record.state = state;
    record.operation = operation;
    this.emit();
  }

  private emit() {
    if (this.listeners.size === 0) return;
    const snapshot = this.getSnapshot();
    for (const listener of this.listeners) listener(snapshot);
  }
}

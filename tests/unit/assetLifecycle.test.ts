import { describe, expect, it, vi } from 'vitest';
import { AssetLifecycleManager } from '@/experience/assets/AssetLifecycleManager';
import { coordinateProductionAssets } from '@/experience/assets/coordinator';
import { selectProductionAssetVariant } from '@/experience/assets/manifest';
import type { ProductionAssetDefinition, ProductionAssetDriver } from '@/experience/assets/types';

const definition = (
  id = 'KF_TEST',
  owner: ProductionAssetDefinition['owner'] = 'kaiforge',
): ProductionAssetDefinition => ({
  id,
  owner,
  resourceType: 'fixture',
  priority: 'critical-next',
  variants: [
    { id: 'desktop', url: `/fixtures/${id}-desktop`, profile: 'desktop', quality: ['high'] },
    {
      id: 'mobile',
      url: `/fixtures/${id}-mobile`,
      profile: 'mobile',
      quality: ['high', 'reduced'],
    },
  ],
  preload: 'after-critical-ready',
  disposal: owner === 'shared' ? 'last-shared-lease' : 'chapter-established',
  allowedConsumers: owner === 'shared' ? ['kaiforge', 'palindrome'] : undefined,
});

function setup(definitions = [definition()]) {
  const events: string[] = [];
  const fetchBytes = vi.fn(async () => new TextEncoder().encode('fixture').buffer);
  const driver: ProductionAssetDriver = {
    prepare: (bytes) => {
      events.push('prepare');
      return { byteLength: bytes.byteLength };
    },
    makeResident: (prepared) => {
      events.push('resident');
      return { prepared };
    },
    disposePrepared: () => events.push('dispose-prepared'),
    disposeResident: () => events.push('dispose-resident'),
  };
  const manager = new AssetLifecycleManager(
    { quality: 'high', portrait: false },
    definitions,
    fetchBytes,
  );
  manager.registerDriver('fixture', driver);
  return { manager, events, fetchBytes };
}

describe('production asset lifecycle', () => {
  it('separates download, preparation, residency, activity, retention and disposal', async () => {
    const { manager, events } = setup();
    const states: string[] = [];
    manager.subscribe((snapshot) => states.push(snapshot[0]?.state ?? 'missing'));

    await manager.request('KF_TEST');
    expect(manager.getSnapshot()[0]).toMatchObject({
      state: 'downloaded',
      downloaded: true,
      prepared: false,
      resident: false,
    });
    await manager.prepare('KF_TEST');
    expect(manager.getSnapshot()[0].state).toBe('prepared');
    const lease = await manager.activate('KF_TEST', 'kaiforge', { renderer: 'shared-r3f' });
    expect(manager.getSnapshot()[0]).toMatchObject({ state: 'active', leaseCount: 1 });
    lease?.release();
    expect(manager.getSnapshot()[0].state).toBe('inactive-retained');
    expect(manager.dispose('KF_TEST')).toBe(true);
    expect(manager.getSnapshot()[0]).toMatchObject({
      state: 'disposed',
      downloaded: false,
      prepared: false,
      resident: false,
    });
    expect(states).toEqual(
      expect.arrayContaining([
        'not-requested',
        'downloading',
        'downloaded',
        'prepared',
        'gpu-resident',
        'active',
        'inactive-retained',
        'disposed',
      ]),
    );
    expect(events).toContain('dispose-resident');
  });

  it('reacquires a disposed asset with the same selected variant', async () => {
    const { manager, fetchBytes } = setup();
    const first = await manager.activate('KF_TEST', 'kaiforge', {});
    first?.release(false);
    expect(manager.getSnapshot()[0].state).toBe('disposed');
    const second = await manager.activate('KF_TEST', 'kaiforge', {});
    expect(second?.value).toBeTruthy();
    expect(fetchBytes).toHaveBeenCalledTimes(2);
    expect(manager.getSnapshot()[0].variant).toBe('desktop');
  });

  it('keeps shared resources alive until the final lease releases', async () => {
    const { manager } = setup([definition('SH_TEST', 'shared')]);
    const first = await manager.activate('SH_TEST', 'kaiforge', {});
    const second = await manager.activate('SH_TEST', 'palindrome', {});
    expect(manager.getSnapshot()[0].leaseCount).toBe(2);
    first?.release(false);
    expect(manager.getSnapshot()[0]).toMatchObject({ state: 'active', leaseCount: 1 });
    expect(manager.dispose('SH_TEST')).toBe(false);
    second?.release(false);
    expect(manager.getSnapshot()[0].state).toBe('disposed');
  });

  it('records failure without looping and supports one explicit retry', async () => {
    let calls = 0;
    const manager = new AssetLifecycleManager(
      { quality: 'high', portrait: false },
      [definition()],
      async () => {
        calls += 1;
        if (calls === 1) throw new Error('fixture failure');
        return new ArrayBuffer(2);
      },
    );
    await manager.request('KF_TEST');
    await manager.request('KF_TEST');
    expect(calls).toBe(1);
    expect(manager.getSnapshot()[0]).toMatchObject({ state: 'failed', error: 'fixture failure' });
    await manager.request('KF_TEST', { retry: true });
    expect(calls).toBe(2);
    expect(manager.getSnapshot()[0].state).toBe('downloaded');
  });

  it('does not repeatedly retry a failed preparation without an explicit reset', async () => {
    const { manager } = setup();
    let prepareCalls = 0;
    manager.registerDriver('fixture', {
      prepare: () => {
        prepareCalls += 1;
        throw new Error('decode failed');
      },
      makeResident: () => ({}),
      disposeResident: () => {},
    });
    await manager.prepare('KF_TEST');
    await manager.prepare('KF_TEST');
    expect(prepareCalls).toBe(1);
    expect(manager.getSnapshot()[0].state).toBe('failed');
    expect(await manager.retry('KF_TEST')).toBe(true);
    await manager.prepare('KF_TEST');
    expect(prepareCalls).toBe(2);
  });

  it('cancels an in-flight request without committing its late result', async () => {
    let resolveFetch: ((value: ArrayBuffer) => void) | undefined;
    const manager = new AssetLifecycleManager(
      { quality: 'high', portrait: false },
      [definition()],
      () => new Promise<ArrayBuffer>((resolve) => (resolveFetch = resolve)),
    );
    const request = manager.request('KF_TEST');
    manager.cancel('KF_TEST');
    resolveFetch?.(new ArrayBuffer(4));
    await request;
    expect(manager.getSnapshot()[0]).toMatchObject({
      state: 'not-requested',
      downloaded: false,
    });
  });

  it('selects one stable desktop/mobile variant and fails closed for no WebGL', () => {
    const asset = definition();
    expect(selectProductionAssetVariant(asset, { quality: 'high', portrait: false })?.id).toBe(
      'desktop',
    );
    expect(selectProductionAssetVariant(asset, { quality: 'high', portrait: true })?.id).toBe(
      'mobile',
    );
    expect(selectProductionAssetVariant(asset, { quality: 'reduced', portrait: false })?.id).toBe(
      'mobile',
    );
    expect(selectProductionAssetVariant(asset, { quality: 'fallback', portrait: false })).toBeNull();
  });

  it('does no work when reduced-motion/no-WebGL eligibility is false', async () => {
    const { manager, fetchBytes } = setup();
    coordinateProductionAssets(manager, {
      eligible: false,
      criticalReady: true,
      viewportHeight: 900,
      chapters: { kaiforge: { progress: 0.5, top: 0, bottom: 4000 } },
    });
    await Promise.resolve();
    expect(fetchBytes).not.toHaveBeenCalled();
    expect(manager.getSnapshot()[0].state).toBe('not-requested');
  });
});

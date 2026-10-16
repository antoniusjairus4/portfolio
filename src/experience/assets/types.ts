import type { QualityTier } from '@/experience/ExperienceEnvironment';
import type { ProjectSceneKey } from '@/experience/ProjectExperienceProvider';

export type ProductionAssetOwner = ProjectSceneKey | 'shared';

export type ProductionAssetState =
  | 'not-requested'
  | 'downloading'
  | 'downloaded'
  | 'prepared'
  | 'gpu-resident'
  | 'active'
  | 'inactive-retained'
  | 'disposed'
  | 'failed';

export type ProductionAssetOperation = 'idle' | 'requesting' | 'preparing' | 'uploading';

export interface ProductionAssetVariant {
  id: string;
  url: string;
  profile: 'desktop' | 'mobile' | 'universal';
  quality: readonly Exclude<QualityTier, 'fallback'>[];
  estimatedBytes?: number;
}

export interface ProductionAssetDefinition {
  id: string;
  owner: ProductionAssetOwner;
  resourceType: string;
  priority: 'critical-next' | 'normal' | 'optional';
  variants: readonly ProductionAssetVariant[];
  dependencies?: readonly string[];
  preload: 'after-critical-ready' | 'previous-chapter' | 'near-chapter' | 'on-demand';
  disposal: 'chapter-established' | 'immediate-on-release' | 'last-shared-lease';
  allowedConsumers?: readonly ProjectSceneKey[];
}

export interface ProductionAssetEnvironment {
  quality: QualityTier;
  portrait: boolean;
}

export interface ProductionAssetDriver<TPrepared = unknown, TResident = unknown, TContext = unknown> {
  prepare: (
    bytes: ArrayBuffer,
    definition: ProductionAssetDefinition,
    variant: ProductionAssetVariant,
  ) => TPrepared | Promise<TPrepared>;
  makeResident: (
    prepared: TPrepared,
    context: TContext,
    definition: ProductionAssetDefinition,
    variant: ProductionAssetVariant,
  ) => TResident | Promise<TResident>;
  disposePrepared?: (prepared: TPrepared) => void;
  disposeResident: (resident: TResident) => void;
}

export interface ProductionAssetSnapshot {
  id: string;
  owner: ProductionAssetOwner;
  state: ProductionAssetState;
  operation: ProductionAssetOperation;
  variant: string | null;
  bytesRequested: boolean;
  downloaded: boolean;
  prepared: boolean;
  resident: boolean;
  active: boolean;
  leaseCount: number;
  retryCount: number;
  error: string | null;
}

export interface ProductionAssetLease<T = unknown> {
  assetId: string;
  value: T;
  release: (retain?: boolean) => void;
}

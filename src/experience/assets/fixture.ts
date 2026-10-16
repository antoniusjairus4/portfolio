import type { ProductionAssetDefinition, ProductionAssetDriver } from './types';

export const lifecycleTestFixture: ProductionAssetDefinition = {
  id: 'TEST_LIFECYCLE_FIXTURE',
  owner: 'kaiforge',
  resourceType: 'test-fixture',
  priority: 'critical-next',
  variants: [
    {
      id: 'fixture-desktop',
      url: '/test-fixtures/asset-lifecycle.txt',
      profile: 'desktop',
      quality: ['high'],
      estimatedBytes: 64,
    },
    {
      id: 'fixture-mobile',
      url: '/test-fixtures/asset-lifecycle.txt?variant=mobile',
      profile: 'mobile',
      quality: ['high', 'reduced'],
      estimatedBytes: 64,
    },
  ],
  preload: 'after-critical-ready',
  disposal: 'chapter-established',
};

export const lifecycleTestFixtureDriver: ProductionAssetDriver<Uint8Array, Uint8Array> = {
  prepare: (bytes) => new Uint8Array(bytes),
  makeResident: (prepared) => prepared,
  disposeResident: () => {},
};

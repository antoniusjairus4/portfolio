import type {
  ProductionAssetDefinition,
  ProductionAssetEnvironment,
  ProductionAssetVariant,
} from '@/experience/assets/types';

export const KAI_FORGE_ATHLETE = 'KF_ATHLETE_ASSEMBLY';
export const productionAssetManifest: readonly ProductionAssetDefinition[] = [
  {
    id: KAI_FORGE_ATHLETE,
    owner: 'kaiforge',
    resourceType: 'kaiforge-glb',
    priority: 'critical-next',
    preload: 'after-critical-ready',
    disposal: 'chapter-established',
    variants: [
      {
        id: 'assembly-high-247ce0e9',
        url: '/models/kaiforge/athlete-assembly-247ce0e9.glb',
        profile: 'desktop',
        quality: ['high', 'reduced'],
        estimatedBytes: 811992,
      },
    ],
    // Pass 1 uses the desktop asset on portrait. Add a real mobile variant after its export gate.
  },
];

export function selectProductionAssetVariant(
  definition: ProductionAssetDefinition,
  environment: ProductionAssetEnvironment,
): ProductionAssetVariant | null {
  if (environment.quality === 'fallback') return null;
  const quality = environment.quality;

  const eligible = definition.variants.filter((variant) => variant.quality.includes(quality));
  if (eligible.length === 0) return null;

  const preferredProfile =
    environment.portrait || environment.quality === 'reduced' ? 'mobile' : 'desktop';
  return (
    eligible.find((variant) => variant.profile === preferredProfile) ??
    eligible.find((variant) => variant.profile === 'universal') ??
    eligible[0]
  );
}

import type {
  ProductionAssetDefinition,
  ProductionAssetEnvironment,
  ProductionAssetVariant,
} from '@/experience/assets/types';

export const KAI_FORGE_ATHLETE = 'KF_ATHLETE_ASSEMBLY';
// Retained for a future direction decision; the procedural robot never requests this asset.
export const archivedKaiForgeAthlete: ProductionAssetDefinition = {
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
};
export const NEURO_IMAGE_IDS = [
  'NS_RESEARCH_IMAGE_01',
  'NS_RESEARCH_IMAGE_02',
  'NS_RESEARCH_IMAGE_03',
  'NS_RESEARCH_IMAGE_04',
] as const;
export const NEURO_IMAGE_URLS = NEURO_IMAGE_IDS.map(
  (_, index) => `/research/neuroshield/image-0${index + 1}.png`,
);

export const productionAssetManifest: readonly ProductionAssetDefinition[] = NEURO_IMAGE_IDS.map(
  (id, index) => ({
    id,
    owner: 'neuroshield',
    allowedConsumers: ['neuroshield', 'palindrome-neuroshield-bridge'],
    resourceType: 'neuro-image',
    priority: index === 0 ? 'critical-next' : 'normal',
    preload: 'previous-chapter',
    disposal: 'chapter-established',
    variants: [
      {
        id: `research-image-${index + 1}`,
        url: NEURO_IMAGE_URLS[index],
        profile: 'universal',
        quality: ['high', 'reduced'],
      },
    ],
  }),
);

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

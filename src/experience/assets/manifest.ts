import type {
  ProductionAssetDefinition,
  ProductionAssetEnvironment,
  ProductionAssetVariant,
} from '@/experience/assets/types';

// Production paths are intentionally empty until an asset passes the Blender/export gate.
export const productionAssetManifest: readonly ProductionAssetDefinition[] = [];

export function selectProductionAssetVariant(
  definition: ProductionAssetDefinition,
  environment: ProductionAssetEnvironment,
): ProductionAssetVariant | null {
  if (environment.quality === 'fallback') return null;
  const quality = environment.quality;

  const eligible = definition.variants.filter((variant) =>
    variant.quality.includes(quality),
  );
  if (eligible.length === 0) return null;

  const preferredProfile =
    environment.portrait || environment.quality === 'reduced' ? 'mobile' : 'desktop';
  return (
    eligible.find((variant) => variant.profile === preferredProfile) ??
    eligible.find((variant) => variant.profile === 'universal') ??
    eligible[0]
  );
}

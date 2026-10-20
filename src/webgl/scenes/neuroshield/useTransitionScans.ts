import { useThree } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import { SRGBColorSpace, Texture, TextureLoader } from 'three';
import { NEURO_IMAGE_IDS, NEURO_IMAGE_URLS } from '@/experience/assets/manifest';
import type { ProductionAssetLease } from '@/experience/assets/types';
import { useProductionAssetManager } from '@/experience/ProjectExperienceProvider';

// One residency lease per source, shared across every slice instance.
export function useTransitionScans() {
  const manager = useProductionAssetManager();
  const { gl, invalidate } = useThree();
  const [sources, setSources] = useState<(Texture | null)[]>([null, null, null]);
  useEffect(() => {
    let cancelled = false;
    const leases: ProductionAssetLease<Texture>[] = [];
    const owned: Texture[] = [];
    const loader = new TextureLoader();
    for (const index of [0, 1, 2]) {
      void (async () => {
        let lease: ProductionAssetLease<Texture> | null = null;
        let texture: Texture | null = null;
        try {
          if (manager) {
            lease = await manager.activate<Texture>(
              NEURO_IMAGE_IDS[index],
              'palindrome-neuroshield-bridge',
              { gl },
            );
            texture = lease?.value ?? null;
          } else {
            texture = await loader.loadAsync(NEURO_IMAGE_URLS[index]);
            texture.colorSpace = SRGBColorSpace;
          }
          if (!texture) return;
          if (cancelled) {
            if (lease) lease.release();
            else texture.dispose();
            return;
          }
          if (lease) leases.push(lease);
          else owned.push(texture);
          setSources((current) => {
            const next = [...current];
            next[index] = texture;
            return next;
          });
          invalidate();
        } catch {
          // Missing images leave explicitly abstract registration contours.
          lease?.release();
        }
      })();
    }
    return () => {
      cancelled = true;
      leases.forEach((lease) => lease.release());
      owned.forEach((texture) => texture.dispose());
    };
  }, [manager, gl, invalidate]);
  return sources;
}

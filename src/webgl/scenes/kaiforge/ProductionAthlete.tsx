import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useState, type MutableRefObject } from 'react';
import { useProductionAssetManager } from '@/experience/ProjectExperienceProvider';
import type { AssetLifecycleManager } from '@/experience/assets/AssetLifecycleManager';
import type { ProductionAssetLease } from '@/experience/assets/types';
import type { KaiForgeGLTF } from '@/experience/assets/kaiforgeGLTF';
import { KAI_FORGE_ATHLETE } from '@/experience/assets/manifest';
import { ROOT } from './staging';

const retirement = new WeakMap<AssetLifecycleManager, ReturnType<typeof setTimeout>>();
export function ProductionAthlete({
  progress,
  portrait,
}: {
  progress: MutableRefObject<number>;
  portrait: boolean;
}) {
  const manager = useProductionAssetManager();
  const { gl, scene, camera, invalidate } = useThree();
  const [resource, setResource] = useState<KaiForgeGLTF | null>(null);
  useEffect(() => {
    if (!manager) return;
    clearTimeout(retirement.get(manager));
    retirement.delete(manager);
    let cancelled = false;
    let lease: ProductionAssetLease<KaiForgeGLTF> | null = null;
    const acquire = async () => {
      const snapshot = manager.getSnapshot().find((item) => item.id === KAI_FORGE_ATHLETE);
      if (snapshot?.state === 'failed') await manager.retry(KAI_FORGE_ATHLETE);
      if (cancelled) return;
      const next = await manager.activate<KaiForgeGLTF>(KAI_FORGE_ATHLETE, 'kaiforge', {
        gl,
        scene,
        camera,
      });
      if (cancelled) {
        next?.release(false);
        return;
      }
      lease = next;
      if (next) {
        next.value.animation.sample(progress.current);
        setResource(next.value);
        invalidate();
      }
    };
    void acquire();
    return () => {
      cancelled = true;
      setResource(null);
      lease?.release(!portrait);
      if (lease && !portrait)
        retirement.set(
          manager,
          setTimeout(() => {
            manager.dispose(KAI_FORGE_ATHLETE);
            retirement.delete(manager);
          }, 2000),
        );
    };
  }, [manager, gl, scene, camera, invalidate, progress, portrait]);
  useFrame(() => {
    resource?.animation.sample(progress.current);
  });
  if (!resource) return null;
  return (
    <group name="KF_ProductionAthlete" position={ROOT} rotation={[0, 0.04, 0]} dispose={null}>
      <primitive object={resource.scene} dispose={null} />
    </group>
  );
}

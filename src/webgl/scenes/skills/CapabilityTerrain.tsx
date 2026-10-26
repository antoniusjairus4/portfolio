'use client';

import { useEffect, useMemo } from 'react';
import { PlaneGeometry } from 'three';
import type { ChapterProgressController } from '@/experience/chapterProgress';
import { CapabilityFluxFloor } from './CapabilityFluxFloor';

function terrainHeight(x: number, z: number) {
  return (
    Math.sin(x * 0.23 + z * 0.038) * 0.12 +
    Math.cos(x * 0.43 - z * 0.024) * 0.075 +
    Math.sin(z * 0.15) * 0.035
  );
}

export function CapabilityTerrain({
  portrait,
  controller,
  placements,
}: {
  portrait: boolean;
  controller: ChapterProgressController;
  placements: readonly { x: number; z: number }[];
}) {
  const geometry = useMemo(() => {
    const plane = new PlaneGeometry(portrait ? 30 : 66, 172, portrait ? 16 : 32, 86);
    const positions = plane.getAttribute('position');
    for (let index = 0; index < positions.count; index += 1) {
      const x = positions.getX(index);
      const worldZ = -62 - positions.getY(index);
      positions.setZ(index, terrainHeight(x, worldZ));
    }
    positions.needsUpdate = true;
    plane.computeVertexNormals();
    return plane;
  }, [portrait]);
  useEffect(
    () => () => {
      geometry.dispose();
    },
    [geometry],
  );

  return (
    <group name="capability-terrain">
      <CapabilityFluxFloor
        controller={controller}
        portrait={portrait}
        geometry={geometry}
        placements={placements}
      />
    </group>
  );
}

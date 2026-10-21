'use client';

import { useThree } from '@react-three/fiber';
import { useLayoutEffect } from 'react';
import { type Mesh, type MeshStandardMaterial, PMREMGenerator } from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// One small, procedurally baked reflection field. It is not visible scenery and
// performs no per-frame capture. Owned/restored with this chapter on the shared renderer.
export function SkillsEnvironment({ portrait }: { portrait: boolean }) {
  const { scene, gl, invalidate } = useThree();
  useLayoutEffect(() => {
    const previous = scene.environment;
    const previousIntensity = scene.environmentIntensity;
    const environment = new RoomEnvironment();
    environment.traverse((node) => {
      const mesh = node as Mesh;
      if (!mesh.isMesh) return;
      const material = mesh.material as MeshStandardMaterial;
      if (material.emissiveIntensity > 1)
        material.emissive.set(mesh.position.x > 0 ? '#577183' : '#d8aa70');
      else material.color.set('#303942');
    });
    const generator = new PMREMGenerator(gl);
    const reflection = generator.fromScene(environment, 0.06, 0.1, 100, {
      size: portrait ? 64 : 128,
    });
    scene.environment = reflection.texture;
    scene.environmentIntensity = 0.11;
    environment.dispose();
    generator.dispose();
    invalidate();
    return () => {
      scene.environment = previous;
      scene.environmentIntensity = previousIntensity;
      reflection.dispose();
    };
  }, [scene, gl, portrait, invalidate]);
  return null;
}

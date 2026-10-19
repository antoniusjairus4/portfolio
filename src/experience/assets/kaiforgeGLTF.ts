import {
  type Camera,
  Mesh,
  type MeshStandardMaterial,
  type Scene,
  SkinnedMesh,
  Texture,
  type WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createAthleteAnimation } from '@/webgl/scenes/kaiforge/athleteAnimation';
import { createSculpturalAthleteMaterials } from '@/webgl/scenes/kaiforge/athleteMaterials';
import type { ProductionAssetDriver } from './types';

export interface KaiForgeGLTFContext {
  gl: WebGLRenderer;
  camera: Camera;
  scene: Scene;
}
export type KaiForgeGLTF = Awaited<ReturnType<typeof prepare>>;

async function prepare(bytes: ArrayBuffer) {
  const gltf = await new GLTFLoader().parseAsync(bytes, '');
  const materials = createSculpturalAthleteMaterials();
  const oldMaterials = new Set<MeshStandardMaterial>();
  gltf.scene.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const original = object.material as MeshStandardMaterial;
    oldMaterials.add(original);
    materials.apply(object, original.name);
    // Animated bounds are evaluated explicitly by validation; never cull using bind-pose bounds.
    if (object instanceof SkinnedMesh) object.frustumCulled = false;
  });
  for (const material of oldMaterials) material.dispose();
  const animation = createAthleteAnimation(gltf.scene, gltf.animations);
  animation.sample(0);
  let disposed = false;
  return {
    scene: gltf.scene,
    animation,
    dispose() {
      if (disposed) return;
      disposed = true;
      animation.dispose();
      const geometries = new Set(),
        skeletons = new Set(),
        textures = new Set<Texture>();
      gltf.scene.traverse((object) => {
        if (!(object instanceof Mesh)) return;
        if (!geometries.has(object.geometry)) {
          geometries.add(object.geometry);
          object.geometry.dispose();
        }
        if (object instanceof SkinnedMesh && !skeletons.has(object.skeleton)) {
          skeletons.add(object.skeleton);
          object.skeleton.dispose();
        }
        for (const value of Object.values(object.material))
          if (value instanceof Texture) textures.add(value);
      });
      for (const texture of textures) {
        const image = texture.source.data;
        if (typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap) image.close();
        texture.dispose();
      }
      materials.dispose();
      gltf.scene.removeFromParent();
    },
  };
}
export const kaiForgeGLTFDriver: ProductionAssetDriver<
  KaiForgeGLTF,
  KaiForgeGLTF,
  KaiForgeGLTFContext
> = {
  prepare,
  async makeResident(prepared, context) {
    try {
      await context.gl.compileAsync(prepared.scene, context.camera, context.scene);
      return prepared;
    } catch (error) {
      prepared.dispose();
      throw error;
    }
  },
  disposePrepared: (resource) => resource.dispose(),
  disposeResident: (resource) => resource.dispose(),
};

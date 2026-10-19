import {
  Mesh,
  MeshStandardMaterial,
  SkinnedMesh,
  Texture,
  type Camera,
  type Scene,
  type WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { ProductionAssetDriver } from './types';
import { createAthleteAnimation } from '@/webgl/scenes/kaiforge/athleteAnimation';

export interface KaiForgeGLTFContext {
  gl: WebGLRenderer;
  camera: Camera;
  scene: Scene;
}
export type KaiForgeGLTF = Awaited<ReturnType<typeof prepare>>;

async function prepare(bytes: ArrayBuffer) {
  const gltf = await new GLTFLoader().parseAsync(bytes, '');
  const materials = {
    KF_Skin: new MeshStandardMaterial({ name: 'KF_Skin', color: '#b89175', roughness: 0.76 }),
    KF_Cloth: new MeshStandardMaterial({ name: 'KF_Cloth', color: '#202522', roughness: 0.94 }),
    KF_HairShoes: new MeshStandardMaterial({
      name: 'KF_HairShoes',
      color: '#171b19',
      roughness: 0.97,
    }),
    KF_Rubber: new MeshStandardMaterial({ name: 'KF_Rubber', color: '#222724', roughness: 0.92 }),
    KF_Wood: new MeshStandardMaterial({ name: 'KF_Wood', color: '#87725b', roughness: 0.8 }),
  };
  const oldMaterials = new Set<MeshStandardMaterial>();
  gltf.scene.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const original = object.material as MeshStandardMaterial;
    oldMaterials.add(original);
    const replacement = materials[original.name as keyof typeof materials];
    if (!replacement) throw new Error(`Unmapped athlete material: ${original.name}`);
    object.material = replacement;
    object.castShadow = true;
    object.receiveShadow = true;
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
      for (const material of Object.values(materials)) material.dispose();
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

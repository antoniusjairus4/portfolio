import { MeshStandardMaterial, type Texture } from 'three';

export function createRobotMaterials(finish: Texture) {
  return {
    shell: new MeshStandardMaterial({
      name: 'KF_Robot_InkShell',
      color: '#2b2926',
      roughness: 0.82,
      metalness: 0.26,
      roughnessMap: finish,
      bumpMap: finish,
      bumpScale: 0.00045,
    }),
    recess: new MeshStandardMaterial({
      name: 'KF_Robot_Recess',
      color: '#111111',
      roughness: 0.96,
    }),
    bearing: new MeshStandardMaterial({
      name: 'KF_Robot_Bearing',
      color: '#82796b',
      roughness: 0.69,
      metalness: 0.38,
      roughnessMap: finish,
    }),
    separator: new MeshStandardMaterial({
      name: 'KF_Robot_Separator',
      color: '#c5b79d',
      roughness: 0.78,
      metalness: 0.24,
    }),
    rubber: new MeshStandardMaterial({
      name: 'KF_Robot_Rubber',
      color: '#282622',
      roughness: 0.88,
      roughnessMap: finish,
      bumpMap: finish,
      bumpScale: 0.0002,
    }),
  };
}
export type RobotMaterialKey = keyof ReturnType<typeof createRobotMaterials>;

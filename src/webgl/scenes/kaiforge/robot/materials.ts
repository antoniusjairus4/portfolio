import { MeshStandardMaterial } from 'three';

export function createRobotMaterials() {
  return {
    shell: new MeshStandardMaterial({
      name: 'KF_Robot_InkShell',
      color: '#414a43',
      roughness: 0.78,
      metalness: 0.15,
    }),
    recess: new MeshStandardMaterial({
      name: 'KF_Robot_Recess',
      color: '#181e1a',
      roughness: 0.94,
    }),
    bearing: new MeshStandardMaterial({
      name: 'KF_Robot_Bearing',
      color: '#73796e',
      roughness: 0.64,
      metalness: 0.28,
    }),
    separator: new MeshStandardMaterial({
      name: 'KF_Robot_Separator',
      color: '#b9ad94',
      roughness: 0.85,
      metalness: 0.08,
    }),
    rubber: new MeshStandardMaterial({
      name: 'KF_Robot_Rubber',
      color: '#232b24',
      roughness: 0.97,
    }),
  };
}
export type RobotMaterialKey = keyof ReturnType<typeof createRobotMaterials>;

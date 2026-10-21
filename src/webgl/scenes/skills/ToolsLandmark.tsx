'use client';

import { useMemo } from 'react';
import { type MeshStandardMaterial, Object3D, Vector3 } from 'three';
import { useSkillsMaterials } from './SkillsMaterials';

// Logo/text anchors stay fixed. Only their physical supports change. Every
// support sits behind the face or outside its reserved content rectangle.
export function ToolsLandmark({
  label,
  skill,
  portrait,
  materials,
}: {
  label: [number, number, number];
  skill: number;
  portrait: boolean;
  materials: {
    backing: MeshStandardMaterial;
    mounting: MeshStandardMaterial;
    light: MeshStandardMaterial;
  };
}) {
  const { geometry } = useSkillsMaterials();
  const pieces = useMemo(() => {
    type Part = {
      position: [number, number, number];
      size: [number, number, number];
      rotation?: [number, number, number];
      surface: 'backing' | 'mounting' | 'light';
    };
    const parts: Part[] = [];
    const add = (
      position: Part['position'],
      size: Part['size'],
      surface: Part['surface'],
      rotation?: Part['rotation'],
    ) => parts.push({ position, size, surface, rotation });
    const beam = (a: Part['position'], b: Part['position'], thickness: number) => {
      const delta = new Vector3(...b).sub(new Vector3(...a));
      const object = new Object3D();
      object.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), delta.clone().normalize());
      add(
        a.map((v, i) => (v + b[i]) / 2) as Part['position'],
        [thickness, delta.length(), thickness],
        'mounting',
        [object.rotation.x, object.rotation.y, object.rotation.z],
      );
    };
    const width = portrait ? 3.45 : 3.65;
    if (skill === 0) {
      // Git: a grounded fork supporting a tall, inset marker.
      add([0, 0.85, -0.45], [width, 4.15, 0.7], 'backing');
      beam([0, -2, -0.8], [-1.55, -1.15, -0.8], 0.32);
      beam([0, -2, -0.8], [1.55, -1.15, -0.8], 0.32);
      add([0, -2.25, -0.8], [0.5, 0.5, 0.6], 'mounting');
      add([-width / 2 - 0.08, 0.85, -0.34], [0.16, 4.35, 0.9], 'mounting');
      add([-width / 2 + 0.025, 0.85, -0.085], [0.025, 4.1, 0.03], 'light');
    } else if (skill === 1) {
      // GitHub: suspended from two connections; an open U frame under the face.
      add([0, 0.85, -0.36], [width, 3.95, 0.55], 'backing');
      for (const x of [-width / 2 - 0.1, width / 2 + 0.1]) {
        add([x, 3.35, -0.5], [0.1, 6.7, 0.16], 'mounting');
      }
      add([0, -1.2, -0.5], [width + 0.35, 0.18, 0.85], 'mounting');
      add([0, 2.88, -0.08], [width, 0.035, 0.035], 'light');
    } else if (skill === 2) {
      // Linux: a continuous root/foundation, not a rectangular sign on a pole.
      add([0, 0.2, -0.55], [width, 5.3, 0.95], 'backing');
      add([-width / 2 - 0.15, 0.3, -0.6], [0.3, 5.5, 1.25], 'mounting');
      add([0.3, -2.5, -0.8], [width + 0.8, 0.3, 2], 'mounting');
      add([-width / 2 + 0.02, 0.3, -0.06], [0.025, 5.2, 0.035], 'light');
    } else if (skill === 3) {
      // Kali: a recessed analysis aperture, bounded by staggered side blades.
      add([0, 0.85, -0.45], [width, 4.1, 0.7], 'backing');
      for (const side of [-1, 1])
        add([side * (width / 2 + 0.12), 0.85 + side * 0.18, -0.55], [0.22, 4.7, 1.05], 'mounting');
      add([0, -1.3, -0.55], [width + 0.3, 0.15, 1], 'mounting');
      add([0, 2.98, -0.085], [width - 0.2, 0.025, 0.035], 'light');
    } else {
      // Ollama: a local processor block, with an offset service plinth.
      add([0, 0.7, -0.7], [width, 4.5, 1.25], 'backing');
      add([0, -1.7, -1.1], [width + 0.5, 0.35, 2.2], 'mounting');
      add([0, -2.2, -1.1], [width - 0.5, 0.65, 1.7], 'backing');
      add([width / 2 + 0.08, 0.7, -0.8], [0.16, 4.8, 1.35], 'mounting');
      add([width / 2 - 0.02, 0.7, -0.06], [0.025, 4.35, 0.035], 'light');
    }
    return parts;
  }, [skill, portrait]);
  // Reuse the identity owner's fading materials so direct/reverse scroll has
  // the same visibility contract and no independent animation or state.
  return (
    <group position={label} name={`tools-landmark-${skill}`}>
      {pieces.map((part) => (
        <mesh
          key={part.position.join(':')}
          geometry={geometry}
          material={materials[part.surface]}
          position={part.position}
          scale={part.size}
          rotation={part.rotation}
          receiveShadow
          dispose={null}
        />
      ))}
    </group>
  );
}

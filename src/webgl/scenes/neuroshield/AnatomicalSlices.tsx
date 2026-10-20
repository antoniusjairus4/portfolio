import { useFrame } from '@react-three/fiber';
import { type MutableRefObject, useMemo, useRef } from 'react';
import { ExtrudeGeometry, type Group, type MeshStandardMaterial, Shape } from 'three';
import { rangeProgress, smoothstep } from '@/components/neuroshield/neuroShieldChoreography';

const SLICE_IDS = Array.from({ length: 10 }, (_, index) => `anatomical-section-${index + 1}`);

function makeSection() {
  const shape = new Shape();
  shape.moveTo(0, 1.02);
  shape.bezierCurveTo(-0.2, 1.2, -0.5, 1.25, -0.76, 1.11);
  shape.bezierCurveTo(-1.6, 1.13, -1.92, 0.55, -1.8, -0.2);
  shape.bezierCurveTo(-1.73, -1.01, -1.1, -1.31, -0.48, -1.2);
  shape.bezierCurveTo(-0.22, -1.14, -0.08, -1.02, 0, -1.05);
  shape.bezierCurveTo(0.08, -1.02, 0.22, -1.14, 0.48, -1.2);
  shape.bezierCurveTo(1.1, -1.31, 1.73, -1.01, 1.8, -0.2);
  shape.bezierCurveTo(1.92, 0.55, 1.6, 1.13, 0.76, 1.11);
  shape.bezierCurveTo(0.5, 1.25, 0.2, 1.2, 0, 1.02);
  const left = new Shape();
  left.moveTo(-0.17, 0.28);
  left.bezierCurveTo(-0.65, 0.6, -0.83, 0.3, -0.58, 0.03);
  left.bezierCurveTo(-0.42, -0.11, -0.24, 0.01, -0.17, 0.28);
  const right = new Shape();
  right.moveTo(0.17, 0.28);
  right.bezierCurveTo(0.24, 0.01, 0.42, -0.11, 0.58, 0.03);
  right.bezierCurveTo(0.83, 0.3, 0.65, 0.6, 0.17, 0.28);
  shape.holes.push(left, right);
  const geometry = new ExtrudeGeometry(shape, {
    depth: 0.045,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 1,
    curveSegments: 18,
    steps: 1,
  });
  geometry.center();
  return geometry;
}

export function AnatomicalSlices({
  progress,
  ending = false,
}: {
  progress: MutableRefObject<number>;
  ending?: boolean;
}) {
  const geometry = useMemo(makeSection, []);
  const groups = useRef<(Group | null)[]>([]);
  const materials = useRef<(MeshStandardMaterial | null)[]>([]);

  useFrame(() => {
    const p = progress.current;
    const open = ending
      ? smoothstep(rangeProgress(p, 0.79, 0.96))
      : smoothstep(rangeProgress(p, 0.2, 0.43));
    const retire = ending ? 0 : smoothstep(rangeProgress(p, 0.39, 0.56));
    groups.current.forEach((group, index) => {
      if (!group) return;
      const offset = index - 4.5;
      group.visible = open > 0.005 && retire < 0.998 && (!ending || ![2, 5, 8].includes(index));
      group.position.set(
        (ending ? 0 : 0.2) + offset * open * (ending ? 0.025 : 0.055),
        1.8 + Math.sin(index * 1.4) * open * 0.045,
        ending ? -29.55 - index * 0.14 : -2.2 - index * (0.09 + open * 0.43),
      );
      group.rotation.y = ending
        ? index % 2 === 0
          ? -0.12
          : 0.1
        : (1 - open) * 0.36 + open * (index % 2 === 0 ? -0.018 : 0.018);
      const focus = index === 2 ? smoothstep(rangeProgress(p, 0.34, 0.45)) : 0;
      group.scale.setScalar(0.89 + index * 0.019 + focus * 0.28);
      const material = materials.current[index];
      if (material)
        material.opacity =
          open * (1 - retire) * (ending ? 0.18 + index * 0.025 : 0.25 + index * 0.055);
    });
  });

  return (
    <>
      {SLICE_IDS.map((id, index) => (
        <group
          key={id}
          ref={(group) => {
            groups.current[index] = group;
          }}
        >
          <mesh geometry={geometry}>
            <meshStandardMaterial
              ref={(material) => {
                materials.current[index] = material;
              }}
              color={
                index % 4 === 0
                  ? '#D5E8E4'
                  : index % 4 === 1
                    ? '#93B5C3'
                    : index % 4 === 2
                      ? '#A8A2BD'
                      : '#D7D6C6'
              }
              roughness={0.86}
              metalness={0}
              transparent
              opacity={0}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </>
  );
}

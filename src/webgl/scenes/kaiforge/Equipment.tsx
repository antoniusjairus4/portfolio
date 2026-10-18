import { useKaiForgeMaterials } from './Materials';
import { useEffect, useMemo } from 'react';
import { BufferGeometry, Float32BufferAttribute } from 'three';
import { boxes, type Box } from './geometry';

export function Equipment() {
  const materials = useKaiForgeMaterials();
  const supports = useMemo(
    () =>
      boxes([
        ...[-0.96, 0.96].flatMap((x) =>
          [-0.53, 0.53].map(
            (z) =>
              [
                [x, 0.345, z],
                [0.045, 0.69, 0.045],
              ] as Box,
          ),
        ),
        ...[-0.96, 0.96].map(
          (x) =>
            [
              [x, 0.14, 0],
              [0.045, 0.045, 1.1],
            ] as Box,
        ),
        [
          [0, 0.56, 0],
          [2, 0.055, 0.055],
        ],
        ...[-0.7625, 0.7625].map(
          (z) =>
            [
              [0, 0.833, z],
              [0.022, 0.18, 0.022],
            ] as Box,
        ),
        ...[-0.78, 0.78].map(
          (z) =>
            [
              [0, 0.737, z],
              [0.08, 0.03, 0.08],
            ] as Box,
        ),
      ]),
    [],
  );
  const markings = useMemo(
    () =>
      boxes([
        ...[-1.36, 1.36].map(
          (x) =>
            [
              [x, 0.7605, 0],
              [0.02, 0.001, 1.525],
            ] as Box,
        ),
        ...[-0.7525, 0.7525].map(
          (z) =>
            [
              [0, 0.7605, z],
              [2.74, 0.001, 0.02],
            ] as Box,
        ),
        [
          [0, 0.7605, 0],
          [2.74, 0.001, 0.003],
        ],
        [
          [0, 0.9065, 0],
          [0.012, 0.012, 1.525],
        ],
      ]),
    [],
  );
  const weave = useMemo(() => {
    const vertices: number[] = [];
    for (let i = 0; i <= 76; i++) {
      const z = -0.7625 + (i * 1.525) / 76;
      vertices.push(0, 0.765, z, 0, 0.9, z);
    }
    for (let i = 0; i <= 7; i++) {
      const y = 0.765 + (i * 0.135) / 7;
      vertices.push(0, y, -0.7625, 0, y, 0.7625);
    }
    return new BufferGeometry().setAttribute('position', new Float32BufferAttribute(vertices, 3));
  }, []);
  useEffect(
    () => () => {
      supports.dispose();
      markings.dispose();
      weave.dispose();
    },
    [supports, markings, weave],
  );
  return (
    <group name="KF_RegulationTable">
      <mesh position={[0, 0.74, 0]} receiveShadow castShadow>
        <boxGeometry args={[2.74, 0.04, 1.525]} />
        <primitive attach="material" object={materials.table} />
      </mesh>
      <mesh geometry={supports} castShadow>
        <primitive attach="material" object={materials.ink} />
      </mesh>
      <mesh geometry={markings}>
        <primitive attach="material" object={materials.parchment} />
      </mesh>
      <lineSegments geometry={weave}>
        <primitive attach="material" object={materials.net} />
      </lineSegments>
    </group>
  );
}

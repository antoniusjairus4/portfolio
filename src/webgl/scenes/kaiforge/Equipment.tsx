import { useFrame } from '@react-three/fiber';
import { type MutableRefObject, useEffect, useMemo, useRef } from 'react';
import {
  BoxGeometry,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  type Group,
  type Mesh,
} from 'three';
import { ROOM_PALETTE } from '../palindrome/palette';
import { type Box, boxes } from './geometry';
import { useKaiForgeMaterials } from './Materials';

function ease(a: number, b: number, value: number) {
  const t = Math.min(1, Math.max(0, (value - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

export function Equipment({
  bridgeProgress,
  bridgePortrait = false,
}: {
  bridgeProgress?: MutableRefObject<number>;
  bridgePortrait?: boolean;
}) {
  const materials = useKaiForgeMaterials();
  const tabletopRef = useRef<Mesh>(null);
  const supportRef = useRef<Group>(null);
  const newSupportRef = useRef<Group>(null);
  const markingsRef = useRef<Group>(null);
  const morphMaterial = useMemo(() => materials.table.clone(), [materials.table]);
  const tableGreen = useMemo(() => new Color('#183d2b'), []);
  const deskWood = useMemo(() => new Color(ROOM_PALETTE.timber), []);
  const tabletop = useMemo(() => {
    const geometry = new BoxGeometry(2.74, 0.04, 1.525);
    const normals = geometry.getAttribute('normal');
    const colors: number[] = [];
    for (let i = 0; i < normals.count; i++) {
      // The same regulation slab: a dark edge finish, matte competition-green top.
      const value = normals.getY(i) > 0.5 ? 1 : 0.32;
      colors.push(value, value, value);
    }
    geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
    return geometry;
  }, []);
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
      tabletop.dispose();
      morphMaterial.dispose();
    },
    [supports, markings, weave, tabletop, morphMaterial],
  );
  useFrame(() => {
    if (!bridgeProgress) return;
    const p = bridgeProgress.current;
    // The table leads the handoff: its competition surface begins becoming the
    // Palindrome desk before the surrounding room changes architecture.
    const table = ease(0.04, 0.68, p);
    const support = ease(0.08, 0.66, p);
    if (tabletopRef.current) {
      tabletopRef.current.position.set(
        -1.02 * (bridgePortrait ? 0.76 : 1) * table,
        0.74 + 0.33 * table,
        -0.35 * table,
      );
      tabletopRef.current.scale.set(
        1 + ((3.8 * (bridgePortrait ? 0.76 : 1)) / 2.74 - 1) * table,
        1 + 2.5 * table,
        1 + (1.65 / 1.525 - 1) * table,
      );
    }
    morphMaterial.color.lerpColors(tableGreen, deskWood, table);
    if (supportRef.current) supportRef.current.scale.setScalar(Math.max(0.001, 1 - support));
    if (newSupportRef.current)
      newSupportRef.current.scale.set(
        Math.max(0.001, support) * (bridgePortrait ? 0.76 : 1),
        Math.max(0.001, support),
        Math.max(0.001, support),
      );
    if (markingsRef.current)
      markingsRef.current.scale.setScalar(Math.max(0.001, 1 - ease(0.04, 0.34, p)));
  });
  return (
    <group name="KF_RegulationTable">
      <mesh ref={tabletopRef} geometry={tabletop} position={[0, 0.74, 0]} receiveShadow castShadow>
        <primitive attach="material" object={bridgeProgress ? morphMaterial : materials.table} />
      </mesh>
      <group ref={supportRef}>
        <mesh geometry={supports} castShadow>
          <primitive attach="material" object={materials.ink} />
        </mesh>
      </group>
      {bridgeProgress && (
        <group
          ref={newSupportRef}
          position={[bridgePortrait ? -0.7752 : -1.02, 0, -0.35]}
          scale={0.001}
        >
          <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.45, 0.22, 1.36]} />
            <meshStandardMaterial color="#24201C" roughness={0.87} />
          </mesh>
          {[-1.62, 1.62].flatMap((x) =>
            [-0.63, 0.63].map((z) => (
              <mesh key={`${x}:${z}`} position={[x, 0.5, z]} castShadow receiveShadow>
                <boxGeometry args={[0.095, 1, 0.095]} />
                <meshStandardMaterial color={ROOM_PALETTE.charcoal} roughness={0.84} />
              </mesh>
            )),
          )}
        </group>
      )}
      <group ref={markingsRef}>
        <mesh geometry={markings}>
          <primitive attach="material" object={materials.markings} />
        </mesh>
        <lineSegments geometry={weave}>
          <primitive attach="material" object={materials.net} />
        </lineSegments>
      </group>
    </group>
  );
}

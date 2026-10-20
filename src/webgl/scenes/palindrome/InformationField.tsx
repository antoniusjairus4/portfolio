import { useFrame } from '@react-three/fiber';
import { useRef, type MutableRefObject } from 'react';
import { Color, MathUtils, Vector3, type Group, type Mesh, type MeshBasicMaterial } from 'three';
import {
  getControlProgress,
  getFragmentationProgress,
  getOrganizationProgress,
  getRelationshipProgress,
  rangeProgress,
  smoothstep,
} from '@/components/palindrome/palindromeChoreography';
import { ROOM_PALETTE } from './DomesticRoom';
import { SpatialType } from './SpatialType';
import { DOMESTIC_SOURCES, type DomesticSource } from './sources';

type Point = readonly [number, number, number];
type Fragment = {
  text: string;
  ordinary: string;
  source: DomesticSource;
  offset: Point;
  scattered: Point;
  flat?: boolean;
  lightPrint?: boolean;
  scale: number;
};

// Authored demo observations; these are never populated from banking/account data.
// Adjacent pairs are meaningful clauses that assemble into one editorial insight.
const FRAGMENTS: readonly Fragment[] = [
  {
    text: 'MILK COSTS 30% MORE',
    ordinary: 'MILK',
    source: 'milk',
    offset: [0, 0.3, 0.151],
    scattered: [-2.05, 3.08, 0.18],
    scale: 0.48,
  },
  {
    text: 'THAN LAST WEEK',
    ordinary: 'LAST WEEK',
    source: 'previousReceipt',
    offset: [0, 0.008, 0.08],
    scattered: [0.04, 2.93, 0.7],
    flat: true,
    scale: 0.5,
  },
  {
    text: 'GROCERY SPENDING',
    ordinary: 'GROCERIES',
    source: 'bag',
    offset: [0, 0.34, 0.224],
    scattered: [2.08, 2.55, 0.65],
    scale: 0.5,
  },
  {
    text: 'IS HIGHER THIS WEEK',
    ordinary: 'THIS SHOP',
    source: 'receipt',
    offset: [0, 0.008, 0.23],
    scattered: [-1.98, 1.9, 0.55],
    flat: true,
    scale: 0.55,
  },
  {
    text: 'COFFEE STOPS',
    ordinary: 'COFFEE',
    source: 'coffee',
    offset: [0, 0.17, 0.136],
    scattered: [-1.23, 3.5, -0.3],
    scale: 0.36,
  },
  {
    text: 'ADD UP THIS WEEK',
    ordinary: 'DAILY ROUTINE',
    source: 'receipt',
    offset: [0, 0.008, 0.08],
    scattered: [1.5, 3.27, -0.1],
    flat: true,
    scale: 0.48,
  },
  {
    text: '₹420 LEFT',
    ordinary: 'HOUSEHOLD',
    source: 'household',
    offset: [0, 0.26, 0.217],
    scattered: [1.5, 1.8, 0.88],
    scale: 0.65,
  },
  {
    text: 'IN YOUR WEEKLY BUDGET',
    ordinary: 'THIS WEEK',
    source: 'notebook',
    offset: [0, 0.061, 0],
    scattered: [-0.8, 2.25, 0.95],
    flat: true,
    lightPrint: true,
    scale: 0.48,
  },
];

// Four object tethers and four purchase/context relationships, staggered in scroll.
const RELATIONS = [
  { object: true, from: 0, to: 0, start: 0, change: false },
  { object: false, from: 0, to: 1, start: 0.12, change: true },
  { object: true, from: 2, to: 2, start: 0.23, change: false },
  { object: false, from: 2, to: 3, start: 0.34, change: false },
  { object: true, from: 4, to: 4, start: 0.45, change: false },
  { object: false, from: 4, to: 5, start: 0.56, change: false },
  { object: true, from: 6, to: 6, start: 0.67, change: false },
  { object: false, from: 6, to: 7, start: 0.78, change: false },
] as const;
const up = new Vector3(0, 1, 0);
const parchment = new Color(ROOM_PALETTE.parchment);
const crimson = new Color(ROOM_PALETTE.crimson);

export function InformationField({
  progress,
  portrait,
  exitProgress,
}: {
  progress: MutableRefObject<number>;
  portrait: boolean;
  exitProgress?: MutableRefObject<number>;
}) {
  const fragments = useRef<(Group | null)[]>([]);
  const materials = useRef<(MeshBasicMaterial | null)[]>([]);
  const sourceMaterials = useRef<(MeshBasicMaterial | null)[]>([]);
  const lines = useRef<(Mesh | null)[]>([]);
  const scratch = useRef({ a: new Vector3(), b: new Vector3(), direction: new Vector3() });

  useFrame(() => {
    const p = progress.current;
    const fragmented = getFragmentationProgress(p);
    const related = getRelationshipProgress(p);
    const organized = getOrganizationProgress(p);
    const control = getControlProgress(p);
    const sourceX = portrait ? 0.76 : 1;
    const alignment = related * 0.36 + organized * 0.64;
    const reading = smoothstep(rangeProgress(fragmented, 0.12, 0.65));
    const attention = (fragmented * 0.22 + related * 0.78) * (1 - control);
    const presence = exitProgress
      ? 1 - smoothstep(rangeProgress(exitProgress.current, 0, 0.16))
      : 1;

    FRAGMENTS.forEach((data, index) => {
      const fragment = fragments.current[index];
      const material = materials.current[index];
      const sourceMaterial = sourceMaterials.current[index];
      if (!fragment || !material || !sourceMaterial) return;
      const source = DOMESTIC_SOURCES[data.source];
      const pair = Math.floor(index / 2);
      const secondLine = index % 2;
      const groupX = portrait ? 0 : pair % 2 === 0 ? -1.35 : 1.35;
      const groupY = portrait
        ? 3.68 - pair * 0.56 - secondLine * 0.21
        : 3.03 - Math.floor(pair / 2) * 0.99 - secondLine * 0.24;
      const x = MathUtils.lerp(
        (source[0] + data.offset[0]) * sourceX,
        data.scattered[0] * (portrait ? 0.62 : 1),
        fragmented,
      );
      const y = MathUtils.lerp(source[1] + data.offset[1], data.scattered[1], fragmented);
      const z = MathUtils.lerp(source[2] + data.offset[2], data.scattered[2], fragmented);
      fragment.position.set(
        MathUtils.lerp(x, groupX, alignment),
        MathUtils.lerp(y, groupY, alignment),
        MathUtils.lerp(z, 0.2, alignment),
      );
      const keep = pair === 0 || pair === 3;
      if (keep) {
        scratch.current.a.set(0, (pair === 0 ? 2.9 : 2.12) - secondLine * 0.24, 0.08);
        fragment.position.lerp(scratch.current.a, control);
      }
      fragment.rotation.set(
        data.flat ? MathUtils.lerp(-Math.PI / 2, 0, fragmented) : 0,
        ((index % 3) - 1) * 0.22 * fragmented * (1 - alignment),
        ((index % 5) - 2) * 0.09 * fragmented * (1 - alignment),
      );
      fragment.scale.setScalar(MathUtils.lerp(data.scale, 1, fragmented));
      material.opacity = reading * (keep ? 1 : 1 - control) * presence;
      // Retain parchment luminance in the dark room; pure Crimson belongs to
      // the change connectors and physical marks. Control returns to parchment.
      material.color.lerpColors(
        parchment,
        crimson,
        index === 0 || index === 3 ? attention * 0.7 : 0,
      );
      sourceMaterial.opacity = (1 - reading) * presence;
      fragment.visible = material.map !== null && material.opacity + sourceMaterial.opacity > 0.001;
    });

    RELATIONS.forEach((relation, index) => {
      const line = lines.current[index];
      const from = fragments.current[relation.from];
      const to = fragments.current[relation.to];
      if (!line || !from || !to) return;
      const reveal = smoothstep(
        rangeProgress(related, relation.start, Math.min(1, relation.start + 0.2)),
      );
      const fade = (1 - organized * (relation.object ? 0.8 : 1)) * (1 - control);
      const { a, b, direction } = scratch.current;
      if (relation.object) {
        const data = FRAGMENTS[relation.from];
        const source = DOMESTIC_SOURCES[data.source];
        a.set(
          (source[0] + data.offset[0]) * sourceX,
          source[1] + data.offset[1],
          source[2] + data.offset[2],
        );
      } else {
        a.copy(from.position);
        a.y -= 0.15;
      }
      b.copy(to.position);
      b.y -= 0.15;
      b.lerpVectors(a, b, reveal);
      direction.subVectors(b, a);
      const length = direction.length();
      line.position.copy(a).add(b).multiplyScalar(0.5);
      line.scale.set(1, Math.max(0.001, length), 1);
      if (length > 0.0001) line.quaternion.setFromUnitVectors(up, direction.normalize());
      (line.material as MeshBasicMaterial).opacity =
        reveal * fade * presence * (relation.change ? 0.85 : relation.object ? 0.26 : 0.34);
      line.visible = reveal * fade > 0.001;
    });
  });

  return (
    <group>
      {FRAGMENTS.map((data, index) => (
        <group
          key={data.text}
          ref={(node) => {
            fragments.current[index] = node;
          }}
        >
          <SpatialType
            text={data.ordinary}
            color={data.lightPrint ? ROOM_PALETTE.parchment : ROOM_PALETTE.ink}
            materialRef={(node) => {
              sourceMaterials.current[index] = node;
            }}
          />
          <SpatialType
            text={data.text}
            color={ROOM_PALETTE.parchment}
            materialRef={(node) => {
              materials.current[index] = node;
            }}
          />
        </group>
      ))}
      {RELATIONS.map((relation, index) => (
        <mesh
          key={`${relation.object}:${relation.from}:${relation.to}`}
          ref={(node) => {
            lines.current[index] = node;
          }}
          visible={false}
        >
          <cylinderGeometry
            args={[relation.object ? 0.003 : 0.004, relation.object ? 0.003 : 0.004, 1, 6]}
          />
          <meshBasicMaterial
            color={relation.change ? ROOM_PALETTE.crimson : ROOM_PALETTE.parchment}
            transparent
            opacity={0}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

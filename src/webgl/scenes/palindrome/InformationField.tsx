import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, type MutableRefObject } from 'react';
import {
  CanvasTexture,
  Color,
  MathUtils,
  SRGBColorSpace,
  Vector3,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
} from 'three';
import {
  getControlProgress,
  getFragmentationProgress,
  getOrganizationProgress,
  getRelationshipProgress,
  rangeProgress,
  smoothstep,
} from '@/components/palindrome/palindromeChoreography';
import { ROOM_PALETTE } from './DomesticRoom';

type Point = readonly [number, number, number];
type Fragment = {
  text: string;
  source: Point;
  scattered: Point;
  grouped: Point;
  portrait: Point;
  keep?: boolean;
  insight?: boolean;
  change?: boolean;
};

// One illustrative shop: 62 + 48 = 110. The same milk previously cost 58.
// These are physical receipt lines, not a product interface or live account data.
const FRAGMENTS: readonly Fragment[] = [
  {
    text: 'MILK',
    source: [-1.48, 1.155, -0.15],
    scattered: [-2.65, 3.08, 0.18],
    grouped: [-2.05, 2.85, 0.15],
    portrait: [-0.95, 3.35, 0.2],
  },
  {
    text: '62.00',
    source: [-0.92, 1.155, -0.15],
    scattered: [0.04, 2.93, 0.7],
    grouped: [-0.9, 2.85, 0.15],
    portrait: [0.8, 3.35, 0.2],
    keep: true,
  },
  {
    text: 'BREAD',
    source: [-1.48, 1.155, 0],
    scattered: [-1.98, 1.9, 0.55],
    grouped: [-2.05, 2.37, 0.15],
    portrait: [-0.95, 2.94, 0.2],
  },
  {
    text: '48.00',
    source: [-0.92, 1.155, 0],
    scattered: [1.18, 3.27, -0.1],
    grouped: [-0.9, 2.37, 0.15],
    portrait: [0.8, 2.94, 0.2],
  },
  {
    text: 'GROCERIES',
    source: [-1.21, 1.155, 0.16],
    scattered: [2.38, 2.55, 0.65],
    grouped: [0.6, 2.62, 0.15],
    portrait: [-0.95, 2.53, 0.2],
    keep: true,
  },
  {
    text: 'TOTAL 110.00',
    source: [-1.21, 1.155, 0.31],
    scattered: [-0.8, 2.25, 0.95],
    grouped: [2.13, 2.62, 0.15],
    portrait: [0.8, 2.53, 0.2],
    keep: true,
  },
  {
    text: 'MILK / PREVIOUS',
    source: [-2.15, 1.155, 0.1],
    scattered: [-1.23, 3.5, -0.3],
    grouped: [-1.9, 1.83, 0.24],
    portrait: [-0.95, 2.12, 0.2],
  },
  {
    text: '58.00',
    source: [-2.15, 1.155, 0.27],
    scattered: [1.5, 1.8, 0.88],
    grouped: [-0.5, 1.83, 0.24],
    portrait: [0.8, 2.12, 0.2],
  },
  {
    text: '+4.00 / MILK',
    source: [0.7, 2.03, 0.3],
    scattered: [2.15, 2.04, 0.4],
    grouped: [1.25, 1.83, 0.24],
    portrait: [0.8, 1.71, 0.2],
    insight: true,
    change: true,
    keep: true,
  },
  {
    text: 'WEEKLY SHOP',
    source: [0.5, 3.2, -0.1],
    scattered: [0.5, 3.2, -0.1],
    grouped: [0.7, 3.18, 0.15],
    portrait: [-0.95, 1.71, 0.2],
    insight: true,
  },
];

// Actual semantic edges, revealed in reading order. Only the price-change edge is crimson.
const RELATIONS = [
  { from: 0, to: 1, start: 0.0, keep: false },
  { from: 2, to: 3, start: 0.14, keep: false },
  { from: 4, to: 5, start: 0.28, keep: true },
  { from: 7, to: 1, start: 0.42, keep: false },
  { from: 1, to: 8, start: 0.6, keep: true, change: true },
  { from: 0, to: 4, start: 0.72, keep: false },
] as const;

const ink = new Color(ROOM_PALETTE.ink);
const parchment = new Color(ROOM_PALETTE.parchment);
const crimson = new Color(ROOM_PALETTE.crimson);
const up = new Vector3(0, 1, 0);

function ReceiptType({
  text,
  materialRef,
}: {
  text: string;
  materialRef: (material: MeshBasicMaterial | null) => void;
}) {
  const material = useRef<MeshBasicMaterial>(null);
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 96;
    const context = canvas.getContext('2d');
    if (!context || !material.current) return;
    context.font = '500 60px monospace';
    const width = Math.ceil(context.measureText(text).width + 20);
    canvas.width = width;
    context.font = '500 60px monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#ffffff';
    context.fillText(text, width / 2, 48);
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    material.current.map = texture;
    material.current.needsUpdate = true;
    invalidate();
    return () => {
      texture.dispose();
    };
  }, [text, invalidate]);

  return (
    <mesh>
      <planeGeometry args={[text.length * 0.084 + 0.047, 0.224]} />
      <meshBasicMaterial
        ref={(node) => {
          material.current = node;
          materialRef(node);
        }}
        transparent
        opacity={0}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

export function InformationField({
  progress,
  portrait,
}: {
  progress: MutableRefObject<number>;
  portrait: boolean;
}) {
  const fragments = useRef<(Group | null)[]>([]);
  const materials = useRef<(MeshBasicMaterial | null)[]>([]);
  const lines = useRef<(Mesh | null)[]>([]);
  const scratch = useRef({ a: new Vector3(), b: new Vector3(), direction: new Vector3() });

  useFrame(() => {
    const p = progress.current;
    const fragmented = getFragmentationProgress(p);
    const related = getRelationshipProgress(p);
    const organized = getOrganizationProgress(p);
    const control = getControlProgress(p);

    FRAGMENTS.forEach((data, index) => {
      const fragment = fragments.current[index];
      const material = materials.current[index];
      if (!fragment || !material) return;
      const group = portrait ? data.portrait : data.grouped;
      const spreadX = portrait ? 0.62 : 1;
      const sourceX = portrait ? 0.76 : 1;
      const alignment = related * 0.36 + organized * 0.64;
      const x = MathUtils.lerp(data.source[0] * sourceX, data.scattered[0] * spreadX, fragmented);
      const y = MathUtils.lerp(data.source[1], data.scattered[1], fragmented);
      const z = MathUtils.lerp(data.source[2], data.scattered[2], fragmented);
      fragment.position.set(
        MathUtils.lerp(x, group[0], alignment),
        MathUtils.lerp(y, group[1], alignment),
        MathUtils.lerp(z, group[2], alignment),
      );
      // The four surviving lines become two compact, legible relationships.
      if (data.keep) {
        const final: Point =
          index === 4
            ? [-0.95, 2.76, 0.08]
            : index === 5
              ? [0.85, 2.76, 0.08]
              : index === 1
                ? [-0.95, 2.15, 0.08]
                : [0.85, 2.15, 0.08];
        fragment.position.lerp(scratch.current.a.set(final[0], final[1], final[2]), control);
      }
      fragment.rotation.set(
        data.insight ? 0 : MathUtils.lerp(-Math.PI / 2, 0, fragmented),
        ((index % 3) - 1) * 0.18 * fragmented * (1 - alignment),
        ((index % 5) - 2) * 0.105 * fragmented * (1 - alignment),
      );
      fragment.scale.setScalar(
        data.insight ? 1 : MathUtils.lerp(index === 6 ? 0.42 : 0.63, 1, fragmented),
      );
      const insightReveal = data.insight
        ? smoothstep(rangeProgress(related, index === 8 ? 0.65 : 0.8, 1))
        : 1;
      material.opacity = insightReveal * (data.keep ? 1 : 1 - control);
      material.color
        .copy(data.change ? crimson : ink)
        .lerp(data.change ? crimson : parchment, fragmented);
      fragment.visible = material.map !== null && material.opacity > 0.001;
    });

    RELATIONS.forEach((relation, index) => {
      const line = lines.current[index];
      const from = fragments.current[relation.from];
      const to = fragments.current[relation.to];
      if (!line || !from || !to) return;
      const reveal = smoothstep(
        rangeProgress(related, relation.start, Math.min(1, relation.start + 0.24)),
      );
      const opacity =
        reveal *
        (relation.keep ? 1 : 1 - control) *
        Math.min(
          materials.current[relation.from]?.opacity ?? 0,
          materials.current[relation.to]?.opacity ?? 0,
        );
      const { a, b, direction } = scratch.current;
      // Lines run below the printed baselines, never through the letterforms.
      a.copy(from.position);
      a.y -= 0.14;
      b.copy(to.position);
      b.y -= 0.14;
      b.lerpVectors(a, b, reveal);
      direction.subVectors(b, a);
      line.position.copy(a).add(b).multiplyScalar(0.5);
      line.scale.set(1, Math.max(0.001, direction.length()), 1);
      line.quaternion.setFromUnitVectors(up, direction.normalize());
      (line.material as MeshBasicMaterial).opacity = opacity * ('change' in relation ? 0.85 : 0.38);
      line.visible = opacity > 0.001;
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
          <ReceiptType
            text={data.text}
            materialRef={(node) => {
              materials.current[index] = node;
            }}
          />
        </group>
      ))}
      {RELATIONS.map((relation, index) => (
        <mesh
          key={`${relation.from}:${relation.to}`}
          ref={(node) => {
            lines.current[index] = node;
          }}
          visible={false}
        >
          <cylinderGeometry args={[0.004, 0.004, 1, 6]} />
          <meshBasicMaterial
            color={'change' in relation ? ROOM_PALETTE.crimson : ROOM_PALETTE.parchment}
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

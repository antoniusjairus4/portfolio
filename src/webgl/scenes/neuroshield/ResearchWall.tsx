import { useFrame } from '@react-three/fiber';
import { type MutableRefObject, useEffect, useMemo, useRef } from 'react';
import {
  BufferGeometry,
  DataTexture,
  DoubleSide,
  Float32BufferAttribute,
  type Group,
  LinearFilter,
  LineBasicMaterial,
  LineSegments,
  type MeshBasicMaterial,
  RGBAFormat,
  SRGBColorSpace,
} from 'three';
import {
  getEvidenceProgress,
  getExperimentProgress,
  getUncertaintyProgress,
  rangeProgress,
  smoothstep,
} from '@/components/neuroshield/neuroShieldChoreography';

const BLUE = '#416B82';
const CYAN = '#397D82';
const ICE = '#9CC6C5';
const PARCHMENT = '#F2E8D5';
const AMBER = '#B88946';
type Point = readonly [number, number, number];
type Pane = {
  id: string;
  kind: 'imaging' | 'graph' | 'evidence';
  loose: Point;
  ordered: Point;
  size: readonly [number, number];
  color: string;
  onset: number;
  selected?: boolean;
};

// Research plates are curated placements, not fabricated patient scans or findings.
const PANES: readonly Pane[] = [
  {
    id: 'A',
    kind: 'imaging',
    loose: [-6.2, 4.25, -3.35],
    ordered: [-5.3, 4.45, -2.95],
    size: [3.45, 2.85],
    color: BLUE,
    onset: 0,
  },
  {
    id: 'B',
    kind: 'graph',
    loose: [-2.35, 5.18, -5.1],
    ordered: [-2.95, 4.48, -3.75],
    size: [2.65, 1.85],
    color: CYAN,
    onset: 0,
  },
  {
    id: 'C',
    kind: 'imaging',
    loose: [2.25, 3.85, -4.4],
    ordered: [0.35, 4.47, -3.25],
    size: [3.3, 2.65],
    color: ICE,
    onset: 0.03,
  },
  {
    id: 'D',
    kind: 'evidence',
    loose: [6.85, 5.35, -6.1],
    ordered: [4.1, 4.5, -4.35],
    size: [3.15, 2.35],
    color: PARCHMENT,
    onset: 0.12,
    selected: true,
  },
  {
    id: 'E',
    kind: 'graph',
    loose: [-7.4, 0.95, -4.85],
    ordered: [-5.25, 1.45, -3.15],
    size: [3.4, 2.1],
    color: CYAN,
    onset: 0.05,
  },
  {
    id: 'F',
    kind: 'imaging',
    loose: [-2.25, 1.0, -6.55],
    ordered: [-2.2, 1.42, -4.15],
    size: [3.05, 2.4],
    color: BLUE,
    onset: 0.2,
  },
  {
    id: 'G',
    kind: 'graph',
    loose: [2.15, 0.9, -3.8],
    ordered: [1.1, 1.45, -3.15],
    size: [2.8, 2.2],
    color: ICE,
    onset: 0.26,
  },
  {
    id: 'H',
    kind: 'evidence',
    loose: [6.4, 1.2, -5.45],
    ordered: [4.12, 1.43, -3.15],
    size: [3.5, 2.65],
    color: PARCHMENT,
    onset: 0.37,
    selected: true,
  },
  {
    id: 'I',
    kind: 'imaging',
    loose: [-10.35, 6.8, -7.15],
    ordered: [-8.55, 6.4, -5.7],
    size: [2.8, 2.35],
    color: CYAN,
    onset: 0.18,
  },
  {
    id: 'J',
    kind: 'graph',
    loose: [9.95, 3.25, -7.4],
    ordered: [8.1, 3.55, -5.75],
    size: [3.25, 2],
    color: BLUE,
    onset: 0.34,
  },
  {
    id: 'K',
    kind: 'imaging',
    loose: [-8.8, -1.55, -7.2],
    ordered: [-7.9, -1.2, -6.25],
    size: [2.5, 2.1],
    color: ICE,
    onset: 0.56,
  },
  {
    id: 'L',
    kind: 'evidence',
    loose: [9.5, -1.3, -8],
    ordered: [7.9, -1.15, -5.85],
    size: [2.55, 2.2],
    color: PARCHMENT,
    onset: 0.67,
  },
];

function makeResearchFieldTexture() {
  const size = 128;
  const pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = (x + 0.5) / size;
      const v = (y + 0.5) / size;
      const drift = Math.sin(u * 15 + v * 8) * 0.045 + Math.sin(v * 27 - u * 12) * 0.025;
      const band = Math.exp(-(((v - 0.48 - Math.sin(u * 7) * 0.13 - drift) / 0.13) ** 2));
      const cluster = Math.exp(-(((u - 0.36) / 0.22) ** 2) - ((v - 0.58) / 0.29) ** 2);
      const fragment = Math.exp(-(((u - 0.75) / 0.13) ** 2) - ((v - 0.31) / 0.19) ** 2);
      const detail = Math.abs(Math.sin(u * 31 + Math.sin(v * 13) * 1.5)) * 0.15;
      const density = Math.min(
        0.87,
        (band * 0.42 + cluster * 0.36 + fragment * 0.28) * (0.78 + detail),
      );
      const i = (y * size + x) * 4;
      const shade = Math.round(
        190 + 58 * Math.min(1, band * 0.5 + cluster * 0.45 + fragment * 0.35),
      );
      pixels[i] = shade;
      pixels[i + 1] = shade;
      pixels[i + 2] = shade;
      pixels[i + 3] = Math.round(255 * density);
    }
  }
  const texture = new DataTexture(pixels, size, size, RGBAFormat);
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function ResearchGraph({ width, height, color }: { width: number; height: number; color: string }) {
  const geometry = useMemo(() => {
    const points: number[] = [];
    const segment = (x1: number, y1: number, x2: number, y2: number) => {
      points.push(x1, y1, 0, x2, y2, 0);
    };
    for (let row = 0; row < 3; row++) {
      const base = height * (0.26 - row * 0.24);
      let previousX = -width * 0.4;
      let previousY = base;
      for (let step = 1; step <= 11; step++) {
        const x = -width * 0.4 + (step / 11) * width * 0.8;
        const y =
          base +
          Math.sin(step * 1.73 + row * 1.41) * height * 0.055 +
          Math.sin(step * 0.56 + row) * height * 0.045;
        segment(previousX, previousY, x, y);
        previousX = x;
        previousY = y;
      }
    }
    for (let index = 0; index < 5; index++) {
      const x = -width * 0.4 + index * width * 0.2;
      segment(x, -height * 0.37, x, -height * 0.33);
    }
    return new BufferGeometry().setAttribute('position', new Float32BufferAttribute(points, 3));
  }, [width, height]);
  const material = useMemo(
    () => new LineBasicMaterial({ color, transparent: true, opacity: 0.66, depthWrite: false }),
    [color],
  );
  const line = useMemo(() => new LineSegments(geometry, material), [geometry, material]);
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );
  return <primitive object={line} position={[0, 0, 0.1]} />;
}

export function ResearchWall({
  progress,
  portrait,
}: {
  progress: MutableRefObject<number>;
  portrait: boolean;
}) {
  const texture = useMemo(makeResearchFieldTexture, []);
  useEffect(() => () => texture.dispose(), [texture]);
  const panes = useRef<(Group | null)[]>([]);
  const paneMaterials = useRef<(MeshBasicMaterial | null)[]>([]);
  const slabs = useRef<(Group | null)[]>([]);
  const experimentFrames = useRef<Group>(null);
  useFrame(() => {
    const p = progress.current;
    const experiment = getExperimentProgress(p);
    const evidence = getEvidenceProgress(p);
    const uncertainty = getUncertaintyProgress(p);
    const organize = smoothstep(rangeProgress(p, 0.39, 0.64));
    PANES.forEach((pane, index) => {
      const group = panes.current[index];
      const material = paneMaterials.current[index];
      if (!group || !material) return;
      const reveal =
        pane.onset === 0 ? 1 : smoothstep(rangeProgress(p, pane.onset, pane.onset + 0.13));
      group.visible = reveal > 0.01 && (!portrait || index < 8 || index === 9);
      const side = pane.loose[0] < 0 ? -1 : 1;
      group.position.set(
        pane.loose[0] +
          (pane.ordered[0] - pane.loose[0]) * organize +
          uncertainty * side * (index % 3 === 0 ? 0.72 : 0.24),
        pane.loose[1] +
          (pane.ordered[1] - pane.loose[1]) * organize +
          uncertainty * (index % 4 === 0 ? 0.42 : -0.1),
        pane.loose[2] +
          (pane.ordered[2] - pane.loose[2]) * organize +
          (pane.selected ? evidence * 0.3 : 0) -
          uncertainty * (index % 3 === 1 ? 0.8 : 0),
      );
      group.scale.setScalar(0.93 + reveal * 0.07);
      material.opacity =
        reveal *
        (pane.selected ? 0.62 + evidence * 0.31 - uncertainty * 0.1 : 0.52 + experiment * 0.13);
    });
    slabs.current.forEach((slab, index) => {
      if (slab) slab.position.x = [-7.7, 0, 7.7][index] + uncertainty * (index - 1) * 0.74;
    });
    if (experimentFrames.current) {
      experimentFrames.current.visible = experiment > 0.01;
      experimentFrames.current.position.z = -2.6 + experiment * 1.18 - uncertainty * 1.3;
      experimentFrames.current.scale.x = 0.77 + experiment * 0.23;
    }
  });

  return (
    <group name="NS_LivingResearchWall">
      <mesh position={[0, 2.35, -13.5]}>
        <planeGeometry args={[42, 23]} />
        <meshBasicMaterial color="#315768" />
      </mesh>
      {[-7.7, 0, 7.7].map((x, index) => (
        <group
          key={x}
          ref={(node) => {
            slabs.current[index] = node;
          }}
          position={[x, 2.45, -8.55]}
        >
          <mesh>
            <boxGeometry args={[7.05, 14.8, 0.42]} />
            <meshStandardMaterial
              color={index === 1 ? '#315C6B' : BLUE}
              roughness={0.87}
              metalness={0.1}
            />
          </mesh>
          <mesh position={[0, 0, 0.225]}>
            <planeGeometry args={[6.84, 14.55]} />
            <meshBasicMaterial color={index === 1 ? CYAN : '#4A7485'} transparent opacity={0.16} />
          </mesh>
        </group>
      ))}
      {[-9.7, -5.3, -0.9, 3.5, 7.9, 12.3].map((x) => (
        <mesh key={x} position={[x, 2.4, -6.96]}>
          <boxGeometry args={[0.08, 15.2, 0.36]} />
          <meshStandardMaterial color="#284C5C" roughness={0.72} metalness={0.18} />
        </mesh>
      ))}
      {[-2.35, 2.35, 7.05].map((y) => (
        <mesh key={y} position={[0, y, -7.05]}>
          <boxGeometry args={[24.8, 0.075, 0.31]} />
          <meshStandardMaterial color="#517C8A" roughness={0.7} metalness={0.12} />
        </mesh>
      ))}
      {PANES.map((pane, index) => (
        <group
          key={pane.id}
          ref={(node) => {
            panes.current[index] = node;
          }}
          position={[...pane.loose]}
          visible={pane.onset === 0}
        >
          <mesh position={[0, 0, -0.075]}>
            <boxGeometry args={[pane.size[0] + 0.12, pane.size[1] + 0.12, 0.13]} />
            <meshStandardMaterial
              color={pane.selected ? '#64727A' : '#254A58'}
              roughness={0.84}
              metalness={0.08}
            />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[pane.size[0], pane.size[1]]} />
            <meshBasicMaterial
              color={pane.color}
              transparent
              opacity={pane.selected ? 0.75 : 0.6}
              side={DoubleSide}
              depthWrite={false}
            />
          </mesh>
          {pane.kind === 'graph' ? (
            <ResearchGraph
              width={pane.size[0]}
              height={pane.size[1]}
              color={pane.color === CYAN ? ICE : PARCHMENT}
            />
          ) : (
            <mesh position={[0, 0, 0.085]} scale={[pane.size[0] * 0.85, pane.size[1] * 0.78, 1]}>
              <planeGeometry args={[1, 1]} />
              <meshBasicMaterial
                ref={(node) => {
                  paneMaterials.current[index] = node;
                }}
                map={texture}
                color={pane.kind === 'evidence' ? AMBER : ICE}
                transparent
                opacity={0}
                depthWrite={false}
                side={DoubleSide}
              />
            </mesh>
          )}
          {pane.kind === 'graph' && (
            <mesh position={[0, 0, 0.055]}>
              <planeGeometry args={[pane.size[0] * 0.88, pane.size[1] * 0.79]} />
              <meshBasicMaterial
                ref={(node) => {
                  paneMaterials.current[index] = node;
                }}
                color={ICE}
                transparent
                opacity={0}
                depthWrite={false}
              />
            </mesh>
          )}
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * pane.size[0] * 0.47, pane.size[1] * 0.44, 0.12]}>
              <boxGeometry args={[pane.size[0] * 0.09, 0.015, 0.015]} />
              <meshBasicMaterial color={pane.selected ? AMBER : ICE} />
            </mesh>
          ))}
        </group>
      ))}
      <group ref={experimentFrames} visible={false} position={[0, 2.3, -2.6]}>
        {[-2.1, 0, 2.1].map((z, index) => (
          <group key={z} position={[index * 0.55 - 0.55, 0, z]}>
            {[-2.25, 2.25].map((x) => (
              <mesh key={x} position={[x, 0, 0]}>
                <boxGeometry args={[0.035, 5.1, 0.035]} />
                <meshBasicMaterial
                  color={index === 1 ? PARCHMENT : ICE}
                  transparent
                  opacity={0.64}
                />
              </mesh>
            ))}
            {[-2.5, 2.5].map((y) => (
              <mesh key={y} position={[0, y, 0]}>
                <boxGeometry args={[4.55, 0.035, 0.035]} />
                <meshBasicMaterial
                  color={index === 1 ? PARCHMENT : ICE}
                  transparent
                  opacity={0.64}
                />
              </mesh>
            ))}
          </group>
        ))}
      </group>
    </group>
  );
}

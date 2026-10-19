import { useFrame } from '@react-three/fiber';
import { type MutableRefObject, useEffect, useMemo, useRef } from 'react';
import {
  BufferGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  DataTexture,
  DoubleSide,
  DynamicDrawUsage,
  type Group,
  InstancedMesh,
  Line,
  LinearFilter,
  LineBasicMaterial,
  MathUtils,
  type Mesh,
  MeshBasicMaterial,
  type MeshStandardMaterial,
  Object3D,
  RGBAFormat,
  SRGBColorSpace,
  Vector3,
} from 'three';
import {
  getEvidenceProgress,
  getExperimentProgress,
  getHypothesisProgress,
  getUncertaintyProgress,
  rangeProgress,
  smoothstep,
} from '@/components/neuroshield/neuroShieldChoreography';

const INK = '#111111';
const PARCHMENT = '#F2E8D5';
const CRIMSON = '#8B1E2D';
const DIM = '#8C867B';
const COOL = '#94A9B8';
const COOL_DEEP = '#536A79';
type Point = readonly [number, number, number];
type Sample = {
  id: string;
  loose: Point;
  ordered: Point;
  size: readonly [number, number];
  reveal: number;
  portrait: boolean;
  turn: number;
};

// Only selected observations are staged; these are abstract research specimens,
// not patient images or claims about the underlying data.
const SAMPLES: readonly Sample[] = [
  {
    id: 'A',
    loose: [-2.4, 2.46, 1.18],
    ordered: [-2.1, 2.72, 0.28],
    size: [1.02, 1.14],
    reveal: 0,
    portrait: true,
    turn: -0.19,
  },
  {
    id: 'B',
    loose: [0.15, 2.92, -1.15],
    ordered: [-0.84, 2.65, -1.15],
    size: [0.88, 1.03],
    reveal: 0,
    portrait: true,
    turn: 0.15,
  },
  {
    id: 'C',
    loose: [2.34, 1.97, -0.15],
    ordered: [0.75, 2.62, -2.65],
    size: [1.06, 1.18],
    reveal: 0.03,
    portrait: true,
    turn: -0.12,
  },
  {
    id: 'D',
    loose: [-0.85, 0.94, -2.6],
    ordered: [-2.1, 1.25, 0.2],
    size: [0.84, 0.96],
    reveal: 0.07,
    portrait: false,
    turn: 0.22,
  },
  {
    id: 'E',
    loose: [3.16, 3.25, -4.1],
    ordered: [-0.84, 1.25, -1.15],
    size: [0.92, 1.05],
    reveal: 0.19,
    portrait: true,
    turn: -0.22,
  },
  {
    id: 'F',
    loose: [-3.35, 3.32, -4.8],
    ordered: [0.75, 1.25, -2.65],
    size: [0.9, 1.02],
    reveal: 0.33,
    portrait: false,
    turn: 0.16,
  },
  {
    id: 'G',
    loose: [3.4, 0.55, -5.8],
    ordered: [2.35, 2.7, -4.15],
    size: [0.9, 1.01],
    reveal: 0.62,
    portrait: false,
    turn: 0.28,
  },
  {
    id: 'H',
    loose: [-3.55, 0.7, -6.5],
    ordered: [-2.75, 0.5, -5.7],
    size: [0.76, 0.89],
    reveal: 0.72,
    portrait: false,
    turn: -0.24,
  },
];

type Relation = {
  from: number;
  to: number;
  onset: number;
  kind: 'selected' | 'possible' | 'unresolved';
};
const RELATIONS: readonly Relation[] = [
  { from: 0, to: 1, onset: 0.17, kind: 'selected' },
  { from: 1, to: 2, onset: 0.22, kind: 'selected' },
  { from: 1, to: 3, onset: 0.26, kind: 'possible' },
  { from: 2, to: 4, onset: 0.38, kind: 'selected' },
  { from: 3, to: 5, onset: 0.44, kind: 'possible' },
  { from: 4, to: 6, onset: 0.68, kind: 'possible' },
  { from: 5, to: 7, onset: 0.77, kind: 'unresolved' },
];
const EVIDENCE_MARKERS: readonly Point[] = [
  [-1.9, 1.25, -2.98],
  [-0.85, 1.4, -3.08],
  [0.22, 1.5, -3.2],
  [1.15, 1.96, -3.27],
  [-1.8, 0.91, -3.76],
  [0.95, 1.23, -3.98],
];

function makeScanTexture() {
  const side = 128;
  const data = new Uint8Array(side * side * 4);
  for (let y = 0; y < side; y++) {
    for (let x = 0; x < side; x++) {
      const u = (x + 0.5 - side / 2) / (side / 2);
      const v = (y + 0.5 - side / 2) / (side / 2);
      const radius = Math.hypot(u / 0.85, v / 0.88);
      const boundary = MathUtils.clamp((1.02 - radius) * 13, 0, 1);
      const contour = Math.sin(radius * 33 + Math.sin(u * 11) * 0.6);
      const weave = Math.sin(u * 24 + v * 6) * Math.cos(v * 17 - u * 5);
      const pockets =
        Math.exp(-((u + 0.29) ** 2 * 28 + (v - 0.14) ** 2 * 43)) +
        Math.exp(-((u - 0.2) ** 2 * 32 + (v + 0.26) ** 2 * 38));
      const density = MathUtils.clamp(
        0.48 + contour * 0.16 + weave * 0.1 - pockets * 0.2,
        0.08,
        0.78,
      );
      const offset = (y * side + x) * 4;
      data[offset] = 248;
      data[offset + 1] = 247;
      data[offset + 2] = 245;
      data[offset + 3] = Math.round(255 * boundary * density);
    }
  }
  const texture = new DataTexture(data, side, side, RGBAFormat);
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function Trace({
  points,
  color,
  progress,
  start,
  end,
  fadeAtUncertainty = false,
  maxOpacity = 0.72,
}: {
  points: Point[];
  color: string;
  progress: MutableRefObject<number>;
  start: number;
  end: number;
  fadeAtUncertainty?: boolean;
  maxOpacity?: number;
}) {
  const geometry = useMemo(() => {
    const curve = new CatmullRomCurve3(points.map((point) => new Vector3(...point)));
    return new BufferGeometry().setFromPoints(curve.getPoints(55));
  }, [points]);
  const material = useMemo(
    () => new LineBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false }),
    [color],
  );
  const line = useMemo(() => new Line(geometry, material), [geometry, material]);
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );
  useFrame(() => {
    const reveal = smoothstep(rangeProgress(progress.current, start, end));
    geometry.setDrawRange(0, Math.max(0, Math.floor(reveal * 56)));
    material.opacity =
      reveal *
      (fadeAtUncertainty ? 1 - getUncertaintyProgress(progress.current) * 0.67 : 1) *
      maxOpacity;
    line.visible = reveal > 0.01;
  });
  return <primitive object={line} />;
}

function CrimsonResearchPath({
  progress,
  samples,
}: {
  progress: MutableRefObject<number>;
  samples: MutableRefObject<(Group | null)[]>;
}) {
  const count = 72;
  const geometry = useMemo(() => new CylinderGeometry(0.008, 0.008, 1, 5), []);
  const material = useMemo(
    () =>
      new MeshBasicMaterial({ color: CRIMSON, transparent: true, opacity: 0, depthWrite: false }),
    [],
  );
  const path = useMemo(() => {
    const instance = new InstancedMesh(geometry, material, count - 1);
    instance.instanceMatrix.setUsage(DynamicDrawUsage);
    instance.count = 0;
    instance.frustumCulled = false;
    return instance;
  }, [geometry, material]);
  const curve = useMemo(
    () =>
      new CatmullRomCurve3(
        Array.from({ length: 5 }, () => new Vector3()),
        false,
        'centripetal',
        0.25,
      ),
    [],
  );
  const point = useMemo(() => new Vector3(), []);
  const next = useMemo(() => new Vector3(), []);
  const direction = useMemo(() => new Vector3(), []);
  const up = useMemo(() => new Vector3(0, 1, 0), []);
  const segment = useMemo(() => new Object3D(), []);
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );
  useFrame(() => {
    const first = samples.current[0];
    const second = samples.current[1];
    const third = samples.current[2];
    if (!first || !second || !third) return;
    const p = progress.current;
    const reveal = smoothstep(rangeProgress(p, 0.16, 0.76));
    curve.points[0].copy(first.position);
    curve.points[1].copy(second.position);
    curve.points[2].copy(third.position);
    curve.points[3].set(1.18, 2.22, -3.02);
    curve.points[4].set(1.7, 2.05, -3.3);
    const visibleSegments = Math.floor(reveal * (count - 1));
    for (let index = 0; index < visibleSegments; index++) {
      curve.getPoint(index / (count - 1), point);
      curve.getPoint((index + 1) / (count - 1), next);
      direction.copy(next).sub(point);
      const length = direction.length();
      segment.position.copy(point).add(next).multiplyScalar(0.5);
      segment.quaternion.setFromUnitVectors(up, direction.normalize());
      segment.scale.set(1, length, 1);
      segment.updateMatrix();
      path.setMatrixAt(index, segment.matrix);
    }
    path.count = visibleSegments;
    path.instanceMatrix.needsUpdate = true;
    material.opacity = reveal * (0.92 - getUncertaintyProgress(p) * 0.58);
    path.visible = visibleSegments > 0;
  });
  return <primitive object={path} />;
}

function ExperimentApparatus({ progress }: { progress: MutableRefObject<number> }) {
  const structure = useRef<Group>(null);
  const selected = useRef<MeshBasicMaterial>(null);
  useFrame(() => {
    const experiment = getExperimentProgress(progress.current);
    if (structure.current) {
      structure.current.visible = experiment > 0.01;
      structure.current.scale.set(0.72 + 0.28 * experiment, experiment, 0.72 + 0.28 * experiment);
    }
    if (selected.current)
      selected.current.opacity =
        0.24 * experiment * (1 - getUncertaintyProgress(progress.current) * 0.7);
  });
  return (
    <group
      ref={structure}
      position={[-0.65, 1.95, -1.35]}
      scale={[0.72, 0.001, 0.72]}
      visible={false}
    >
      {[-3.25, -1.65, 0, 1.45, 3.05].map((z, index) => (
        <group key={z} position={[0, 0, z]}>
          {[-0.83, 0.83].map((x) => (
            <mesh key={x} position={[x, 0, 0]}>
              <boxGeometry args={[0.014, 2.28, 0.014]} />
              <meshBasicMaterial
                color={index === 2 ? PARCHMENT : COOL_DEEP}
                transparent
                opacity={index === 2 ? 0.52 : 0.21}
              />
            </mesh>
          ))}
          {[-1.14, 1.14].map((y) => (
            <mesh key={y} position={[0, y, 0]}>
              <boxGeometry args={[1.68, 0.014, 0.014]} />
              <meshBasicMaterial color={COOL_DEEP} transparent opacity={0.23} />
            </mesh>
          ))}
        </group>
      ))}
      {[-0.83, 0.83].map((x) => (
        <mesh key={x} position={[x, 1.14, -0.1]}>
          <boxGeometry args={[0.011, 0.011, 6.3]} />
          <meshBasicMaterial color={COOL_DEEP} transparent opacity={0.18} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.08]}>
        <boxGeometry args={[0.035, 1.6, 0.035]} />
        <meshBasicMaterial ref={selected} color={PARCHMENT} transparent opacity={0} />
      </mesh>
    </group>
  );
}

export function ResearchField({
  progress,
  portrait,
}: {
  progress: MutableRefObject<number>;
  portrait: boolean;
}) {
  const scanTexture = useMemo(makeScanTexture, []);
  useEffect(() => () => scanTexture.dispose(), [scanTexture]);
  const samples = useRef<(Group | null)[]>([]);
  const scanMaterials = useRef<(MeshStandardMaterial | null)[]>([]);
  const rearSlices = useRef<(Group | null)[]>([]);
  const frontSlices = useRef<(Group | null)[]>([]);
  const rearMaterials = useRef<(MeshStandardMaterial | null)[]>([]);
  const frontMaterials = useRef<(MeshStandardMaterial | null)[]>([]);
  const contourMaterials = useRef<(MeshBasicMaterial | null)[]>([]);
  const markers = useRef<(MeshBasicMaterial | null)[]>([]);
  const links = useRef<(Mesh | null)[]>([]);
  const linkMaterials = useRef<(MeshBasicMaterial | null)[]>([]);
  const selectedMarker = useRef<Mesh>(null);
  const resultMarkers = useRef<(Mesh | null)[]>([]);
  const up = useMemo(() => new Vector3(0, 1, 0), []);
  const a = useMemo(() => new Vector3(), []);
  const b = useMemo(() => new Vector3(), []);
  const midpoint = useMemo(() => new Vector3(), []);
  const direction = useMemo(() => new Vector3(), []);

  useFrame(() => {
    const p = progress.current;
    const hypothesis = getHypothesisProgress(p);
    const experiment = getExperimentProgress(p);
    const evidence = getEvidenceProgress(p);
    const uncertainty = getUncertaintyProgress(p);
    const ordering = smoothstep(rangeProgress(p, 0.32, 0.62));
    SAMPLES.forEach((sample, index) => {
      const group = samples.current[index];
      const material = scanMaterials.current[index];
      if (!group || !material) return;
      const reveal =
        sample.reveal === 0 ? 1 : smoothstep(rangeProgress(p, sample.reveal, sample.reveal + 0.13));
      const compact = portrait && !sample.portrait ? 0 : 1;
      const diverge =
        uncertainty * (index === 6 ? 0.9 : index === 7 ? -0.65 : index === 4 ? 0.38 : 0);
      group.position.set(
        MathUtils.lerp(sample.loose[0], sample.ordered[0], ordering) + diverge,
        MathUtils.lerp(sample.loose[1], sample.ordered[1], ordering) +
          uncertainty * (index === 7 ? 0.3 : 0),
        MathUtils.lerp(sample.loose[2], sample.ordered[2], ordering) -
          uncertainty * (index === 6 ? 1.1 : 0),
      );
      group.rotation.y = sample.turn * (1 - ordering * 0.78) + uncertainty * (index > 5 ? 0.16 : 0);
      group.rotation.z = (index % 2 ? 1 : -1) * 0.045 * (1 - ordering);
      group.scale.setScalar(0.82 + reveal * 0.18);
      group.visible = reveal * compact > 0.01;
      const focus =
        index <= 2
          ? 0.26 + hypothesis * (index === 1 ? 0.55 : 0.25)
          : index === 4
            ? experiment * 0.65 + evidence * 0.25
            : evidence * 0.22;
      const sliceSpread =
        0.08 + hypothesis * 0.11 + experiment * 0.18 + uncertainty * (index > 5 ? 0.22 : 0.06);
      const rearSlice = rearSlices.current[index];
      const frontSlice = frontSlices.current[index];
      if (rearSlice) rearSlice.position.z = -sliceSpread;
      if (frontSlice) frontSlice.position.z = sliceSpread;
      material.opacity = reveal * compact * (index > 5 ? 0.57 : 0.78 + focus * 0.13);
      material.emissiveIntensity = focus * 0.12;
      const rear = rearMaterials.current[index];
      const front = frontMaterials.current[index];
      const contour = contourMaterials.current[index];
      if (rear) rear.opacity = reveal * compact * (0.19 + experiment * 0.13);
      if (front) front.opacity = reveal * compact * (0.28 + focus * 0.2);
      if (contour) contour.opacity = reveal * compact * (0.18 + focus * 0.24);
      const marker = markers.current[index];
      if (marker) {
        marker.opacity =
          reveal * compact * (index === 1 ? hypothesis * 0.65 : 0.24 + hypothesis * 0.18);
      }
    });
    RELATIONS.forEach((relation, index) => {
      const link = links.current[index];
      const material = linkMaterials.current[index];
      const start = samples.current[relation.from];
      const end = samples.current[relation.to];
      if (!link || !material || !start || !end) return;
      const reveal = smoothstep(rangeProgress(p, relation.onset, relation.onset + 0.14));
      const portraitWeight =
        portrait && (!SAMPLES[relation.from].portrait || !SAMPLES[relation.to].portrait) ? 0.1 : 1;
      a.copy(start.position);
      b.copy(end.position);
      direction.copy(b).sub(a);
      const length = direction.length();
      midpoint.copy(a).add(b).multiplyScalar(0.5);
      link.position.copy(midpoint);
      link.quaternion.setFromUnitVectors(up, direction.normalize());
      link.scale.y = Math.max(0.001, length * reveal);
      const interrupted =
        relation.kind === 'unresolved' ? 0.42 : relation.kind === 'possible' ? 0.65 : 1;
      const uncertaintyFade = relation.kind === 'selected' ? 1 - uncertainty * 0.6 : 1;
      material.opacity =
        reveal *
        portraitWeight *
        interrupted *
        uncertaintyFade *
        (relation.kind === 'selected' ? 0.3 : 0.48);
      link.visible = material.opacity > 0.005;
    });
    if (selectedMarker.current) {
      selectedMarker.current.visible = evidence > 0.01;
      selectedMarker.current.position.set(1.55 + uncertainty * 0.2, 2.05, -3.25);
      selectedMarker.current.scale.setScalar(Math.max(0.001, evidence * (1 - uncertainty * 0.3)));
    }
    resultMarkers.current.forEach((marker, index) => {
      if (!marker) return;
      const reveal = smoothstep(rangeProgress(p, 0.62 + index * 0.022, 0.75 + index * 0.022));
      marker.visible = reveal > 0.01 && (!portrait || index < 4);
      marker.scale.setScalar(
        Math.max(0.001, reveal * (1 - uncertainty * (index === 3 ? 0.42 : 0))),
      );
    });
  });

  return (
    <group name="NS_ResearchField" scale={[portrait ? 0.75 : 1, portrait ? 0.96 : 1, 1]}>
      {SAMPLES.map((sample, index) => (
        <group
          key={sample.id}
          ref={(node) => {
            samples.current[index] = node;
          }}
          position={[...sample.loose]}
          rotation={[0, sample.turn, 0]}
          visible={sample.reveal === 0}
        >
          <group
            ref={(node) => {
              rearSlices.current[index] = node;
            }}
            position={[0, 0, -0.08]}
          >
            <mesh
              scale={[sample.size[0] * 1.08, sample.size[1] * 1.04, 1]}
              rotation={[0, 0, index % 2 ? 0.09 : -0.07]}
            >
              <planeGeometry args={[1, 1]} />
              <meshStandardMaterial
                ref={(node) => {
                  rearMaterials.current[index] = node;
                }}
                map={scanTexture}
                color={COOL_DEEP}
                side={DoubleSide}
                transparent
                opacity={0}
                depthWrite={false}
                roughness={0.96}
              />
            </mesh>
          </group>
          <mesh scale={[sample.size[0], sample.size[1], 1]}>
            <planeGeometry args={[1, 1]} />
            <meshStandardMaterial
              ref={(node) => {
                scanMaterials.current[index] = node;
              }}
              map={scanTexture}
              color={index % 3 === 0 ? COOL : PARCHMENT}
              emissive={index % 3 === 0 ? COOL_DEEP : PARCHMENT}
              emissiveIntensity={0}
              side={DoubleSide}
              transparent
              opacity={sample.reveal === 0 ? 0.87 : 0}
              depthWrite={false}
              roughness={0.96}
              metalness={0}
            />
          </mesh>
          <group
            ref={(node) => {
              frontSlices.current[index] = node;
            }}
            position={[0, 0, 0.08]}
          >
            <mesh
              scale={[sample.size[0] * 0.84, sample.size[1] * 0.87, 1]}
              rotation={[0, 0, index % 2 ? -0.12 : 0.11]}
            >
              <planeGeometry args={[1, 1]} />
              <meshStandardMaterial
                ref={(node) => {
                  frontMaterials.current[index] = node;
                }}
                map={scanTexture}
                color={index === 1 || index === 4 ? PARCHMENT : COOL}
                side={DoubleSide}
                transparent
                opacity={0}
                depthWrite={false}
                roughness={0.91}
              />
            </mesh>
            <mesh
              position={[0.03, -0.015, 0.012]}
              rotation={[0, 0, index * 0.47]}
              scale={[sample.size[0] * 1.05, sample.size[1] * 0.95, 1]}
            >
              <torusGeometry args={[0.35, 0.003, 3, 40, Math.PI * 1.42]} />
              <meshBasicMaterial
                ref={(node) => {
                  contourMaterials.current[index] = node;
                }}
                color={index === 1 || index === 4 ? PARCHMENT : COOL}
                transparent
                opacity={0}
                depthWrite={false}
              />
            </mesh>
          </group>
          <mesh position={[sample.size[0] * 0.27, -sample.size[1] * 0.28, 0.012]}>
            <ringGeometry args={[0.025, 0.038, 14]} />
            <meshBasicMaterial
              ref={(node) => {
                markers.current[index] = node;
              }}
              color={index === 1 ? CRIMSON : PARCHMENT}
              transparent
              opacity={0}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[-sample.size[0] * 0.45, -sample.size[1] * 0.37, 0.012]}>
            <boxGeometry args={[sample.size[0] * 0.13, 0.008, 0.004]} />
            <meshBasicMaterial color={DIM} transparent opacity={0.6} />
          </mesh>
        </group>
      ))}
      {RELATIONS.map((relation, index) => (
        <mesh
          key={`${relation.from}:${relation.to}`}
          ref={(node) => {
            links.current[index] = node;
          }}
          visible={false}
        >
          <cylinderGeometry
            args={[
              relation.kind === 'selected' ? 0.006 : 0.004,
              relation.kind === 'selected' ? 0.006 : 0.004,
              1,
              6,
            ]}
          />
          <meshBasicMaterial
            ref={(node) => {
              linkMaterials.current[index] = node;
            }}
            color={relation.kind === 'selected' ? PARCHMENT : COOL_DEEP}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      ))}
      <CrimsonResearchPath progress={progress} samples={samples} />
      <ExperimentApparatus progress={progress} />
      <group position={[0.25, 0, 0]}>
        <Trace
          points={[
            [-2.15, 1.18, -2.95],
            [-1.2, 1.45, -3.05],
            [-0.32, 1.22, -3.18],
            [0.58, 1.83, -3.22],
            [1.5, 2.02, -3.3],
            [2.45, 1.89, -3.55],
          ]}
          color={PARCHMENT}
          progress={progress}
          start={0.57}
          end={0.76}
          fadeAtUncertainty
        />
        <Trace
          points={[
            [-2.15, 0.82, -3.75],
            [-1.2, 1.12, -3.8],
            [-0.32, 1.04, -3.86],
            [0.58, 1.3, -3.93],
            [1.5, 1.15, -4.02],
            [2.45, 1.42, -4.17],
          ]}
          color={DIM}
          progress={progress}
          start={0.64}
          end={0.82}
        />
        <Trace
          points={[
            [1.5, 2.02, -3.3],
            [2.16, 2.37, -4.6],
            [2.8, 2.18, -5.5],
            [3.2, 2.55, -6.5],
          ]}
          color={DIM}
          progress={progress}
          start={0.81}
          end={0.98}
        />
        <Trace
          points={[
            [1.5, 2.02, -3.3],
            [1.9, 2.28, -4.1],
            [2.25, 2.1, -4.82],
          ]}
          color={CRIMSON}
          progress={progress}
          start={0.83}
          end={0.96}
          maxOpacity={0.2}
        />
        <Trace
          points={[
            [1.5, 2.02, -3.3],
            [1.36, 1.7, -4.15],
            [1.58, 1.47, -5.1],
          ]}
          color={COOL}
          progress={progress}
          start={0.86}
          end={0.99}
          maxOpacity={0.26}
        />
      </group>
      <mesh ref={selectedMarker} visible={false}>
        <ringGeometry args={[0.055, 0.075, 20]} />
        <meshBasicMaterial color={CRIMSON} side={DoubleSide} />
      </mesh>
      {EVIDENCE_MARKERS.map((position, index) => (
        <mesh
          key={position.join(':')}
          ref={(node) => {
            resultMarkers.current[index] = node;
          }}
          position={[...position]}
          visible={false}
        >
          <sphereGeometry args={[index < 4 ? 0.035 : 0.026, 10, 8]} />
          <meshBasicMaterial color={index < 4 ? PARCHMENT : DIM} />
        </mesh>
      ))}
      <mesh position={[0, 0.12, -6.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[11, 9]} />
        <meshBasicMaterial color={INK} />
      </mesh>
    </group>
  );
}

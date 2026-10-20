import { useFrame } from '@react-three/fiber';
import { type MutableRefObject, useEffect, useMemo, useRef } from 'react';
import {
  MeshBasicMaterial as BasicMaterial,
  BufferGeometry,
  CylinderGeometry,
  DynamicDrawUsage,
  Float32BufferAttribute,
  type Group,
  InstancedMesh,
  Line,
  LineBasicMaterial,
  type MeshBasicMaterial,
  Object3D,
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

const BLUE = '#416B82';
const CYAN = '#397D82';
const ICE = '#9CC6C5';
const PARCHMENT = '#F2E8D5';
const AMBER = '#B88946';
const CRIMSON = '#8B1E2D';
type Point = readonly [number, number, number];
type Node = { id: string; loose: Point; ordered: Point; onset: number; selected?: boolean };
type Edge = {
  from: number;
  to: number;
  bend: Point;
  onset: number;
  kind: 'candidate' | 'active' | 'supported' | 'unresolved';
  stop?: number;
};

// Every point belongs to a research plate or a deliberate gap between plates.
const NODES: readonly Node[] = [
  { id: 'A', loose: [-6.2, 4.2, -3.04], ordered: [-5.3, 4.4, -2.64], onset: 0 },
  { id: 'B', loose: [-2.35, 5.18, -4.78], ordered: [-2.95, 4.48, -3.43], onset: 0 },
  { id: 'C', loose: [2.25, 3.85, -4.08], ordered: [0.35, 4.47, -2.94], onset: 0.03 },
  { id: 'D', loose: [6.85, 5.35, -5.78], ordered: [4.1, 4.5, -4.04], onset: 0.12, selected: true },
  { id: 'E', loose: [-7.4, 0.95, -4.54], ordered: [-5.25, 1.45, -2.84], onset: 0.05 },
  { id: 'F', loose: [-2.25, 1, -6.23], ordered: [-2.2, 1.42, -3.84], onset: 0.2 },
  { id: 'G', loose: [2.15, 0.9, -3.48], ordered: [1.1, 1.45, -2.84], onset: 0.26 },
  { id: 'H', loose: [6.4, 1.2, -5.13], ordered: [4.12, 1.43, -2.84], onset: 0.37, selected: true },
  { id: 'I', loose: [-10.35, 6.8, -6.82], ordered: [-8.55, 6.4, -5.36], onset: 0.18 },
  { id: 'J', loose: [9.95, 3.25, -7.04], ordered: [8.1, 3.55, -5.39], onset: 0.34 },
  { id: 'K', loose: [-8.8, -1.55, -6.82], ordered: [-7.9, -1.2, -5.89], onset: 0.56 },
  { id: 'L', loose: [9.5, -1.3, -7.68], ordered: [7.9, -1.15, -5.49], onset: 0.67, selected: true },
];

// Candidate and unresolved branches remain incomplete; the crimson path is one hypothesis.
const EDGES: readonly Edge[] = [
  { from: 0, to: 1, bend: [0.2, 0.34, -0.86], onset: 0.18, kind: 'active' },
  { from: 1, to: 2, bend: [-0.12, -0.18, 0.72], onset: 0.27, kind: 'active' },
  { from: 2, to: 6, bend: [0.32, 0.06, -1.05], onset: 0.42, kind: 'active' },
  { from: 6, to: 7, bend: [0.08, 0.51, 0.65], onset: 0.57, kind: 'active' },
  { from: 7, to: 11, bend: [-0.32, -0.19, -0.92], onset: 0.7, kind: 'active' },
  { from: 0, to: 4, bend: [-0.65, 0.2, -0.8], onset: 0.23, kind: 'candidate' },
  { from: 1, to: 5, bend: [-0.15, 0.14, 1.14], onset: 0.35, kind: 'candidate' },
  { from: 2, to: 3, bend: [0.25, 0.58, -0.83], onset: 0.43, kind: 'candidate' },
  { from: 4, to: 10, bend: [-0.68, -0.25, 0.52], onset: 0.57, kind: 'candidate' },
  { from: 5, to: 6, bend: [0, 0.45, -1.25], onset: 0.51, kind: 'candidate' },
  { from: 3, to: 7, bend: [0.6, 0.1, 0.35], onset: 0.66, kind: 'supported' },
  { from: 6, to: 7, bend: [0.25, -0.34, -0.63], onset: 0.72, kind: 'supported' },
  { from: 7, to: 9, bend: [0.5, 0.36, -1.15], onset: 0.83, kind: 'unresolved', stop: 0.67 },
  { from: 5, to: 10, bend: [-0.5, -0.42, 0.52], onset: 0.87, kind: 'unresolved', stop: 0.58 },
  { from: 11, to: 9, bend: [0.35, 0.17, -0.93], onset: 0.9, kind: 'unresolved', stop: 0.46 },
];

const STEPS = 36;

function bezier(a: Vector3, b: Vector3, bend: Point, t: number, out: Vector3) {
  const inverse = 1 - t;
  const x1 = a.x + (b.x - a.x) / 3 + bend[0];
  const y1 = a.y + (b.y - a.y) / 3 + bend[1];
  const z1 = a.z + (b.z - a.z) / 3 + bend[2];
  const x2 = a.x + ((b.x - a.x) * 2) / 3 + bend[0] * 0.64;
  const y2 = a.y + ((b.y - a.y) * 2) / 3 + bend[1] * 0.64;
  const z2 = a.z + ((b.z - a.z) * 2) / 3 + bend[2] * 0.64;
  out.set(
    inverse ** 3 * a.x + 3 * inverse ** 2 * t * x1 + 3 * inverse * t ** 2 * x2 + t ** 3 * b.x,
    inverse ** 3 * a.y + 3 * inverse ** 2 * t * y1 + 3 * inverse * t ** 2 * y2 + t ** 3 * b.y,
    inverse ** 3 * a.z + 3 * inverse ** 2 * t * z1 + 3 * inverse * t ** 2 * z2 + t ** 3 * b.z,
  );
  return out;
}

export function NeuralConstellation({
  progress,
  portrait,
}: {
  progress: MutableRefObject<number>;
  portrait: boolean;
}) {
  const nodes = useRef<(Group | null)[]>([]);
  const nodeMaterials = useRef<(MeshBasicMaterial | null)[]>([]);
  const positions = useMemo(() => NODES.map(() => new Vector3()), []);
  const candidateLines = useMemo(
    () =>
      EDGES.filter((edge) => edge.kind !== 'active').map((edge) => {
        const geometry = new BufferGeometry().setAttribute(
          'position',
          new Float32BufferAttribute(new Float32Array(STEPS * 3), 3),
        );
        const color = edge.kind === 'supported' ? AMBER : edge.kind === 'unresolved' ? BLUE : CYAN;
        const material = new LineBasicMaterial({
          color,
          transparent: true,
          opacity: 0,
          depthWrite: false,
        });
        return { edge, geometry, material, line: new Line(geometry, material) };
      }),
    [],
  );
  const redEdges = useMemo(() => EDGES.filter((edge) => edge.kind === 'active'), []);
  const redGeometry = useMemo(() => new CylinderGeometry(0.012, 0.012, 1, 5), []);
  const redMaterial = useMemo(
    () => new BasicMaterial({ color: CRIMSON, transparent: true, opacity: 0, depthWrite: false }),
    [],
  );
  const redPath = useMemo(() => {
    const mesh = new InstancedMesh(redGeometry, redMaterial, redEdges.length * (STEPS - 1));
    mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    mesh.count = 0;
    mesh.frustumCulled = false;
    return mesh;
  }, [redEdges, redGeometry, redMaterial]);
  useEffect(
    () => () => {
      candidateLines.forEach(({ geometry, material }) => {
        geometry.dispose();
        material.dispose();
      });
      redGeometry.dispose();
      redMaterial.dispose();
    },
    [candidateLines, redGeometry, redMaterial],
  );
  const point = useMemo(() => new Vector3(), []);
  const next = useMemo(() => new Vector3(), []);
  const direction = useMemo(() => new Vector3(), []);
  const up = useMemo(() => new Vector3(0, 1, 0), []);
  const segment = useMemo(() => new Object3D(), []);

  useFrame(() => {
    const p = progress.current;
    const hypothesis = getHypothesisProgress(p);
    const experiment = getExperimentProgress(p);
    const evidence = getEvidenceProgress(p);
    const uncertainty = getUncertaintyProgress(p);
    const organize = smoothstep(rangeProgress(p, 0.39, 0.64));
    NODES.forEach((node, index) => {
      const position = positions[index];
      const group = nodes.current[index];
      const material = nodeMaterials.current[index];
      const reveal =
        node.onset === 0 ? 1 : smoothstep(rangeProgress(p, node.onset, node.onset + 0.13));
      const visible = !portrait || index < 8 || index === 9;
      const side = node.loose[0] < 0 ? -1 : 1;
      position.set(
        node.loose[0] +
          (node.ordered[0] - node.loose[0]) * organize +
          uncertainty * side * (index % 3 === 0 ? 0.72 : 0.24),
        node.loose[1] +
          (node.ordered[1] - node.loose[1]) * organize +
          uncertainty * (index % 4 === 0 ? 0.42 : -0.1),
        node.loose[2] +
          (node.ordered[2] - node.loose[2]) * organize +
          (node.selected ? evidence * 0.3 : 0) -
          uncertainty * (index % 3 === 1 ? 0.8 : 0),
      );
      if (group) {
        group.position.copy(position);
        group.visible = visible && reveal > 0.01;
        group.scale.setScalar(
          0.8 + reveal * 0.2 + (node.selected ? evidence * 0.34 : hypothesis * 0.12),
        );
      }
      if (material) {
        material.color.set(
          node.selected ? (evidence > 0.3 ? AMBER : PARCHMENT) : index % 3 === 0 ? ICE : CYAN,
        );
        material.opacity =
          reveal *
          (node.selected ? 0.55 + evidence * 0.42 : 0.3 + hypothesis * 0.24 + experiment * 0.15) *
          (1 - uncertainty * (node.selected ? 0.12 : 0.3));
      }
    });
    candidateLines.forEach(({ edge, geometry, material, line }) => {
      const reveal = smoothstep(rangeProgress(p, edge.onset, edge.onset + 0.16));
      const portraitWeight = portrait && (edge.from > 7 || edge.to > 7) ? 0.13 : 1;
      const stop = edge.stop ?? 1;
      const visibleCount = Math.floor(reveal * (STEPS - 1)) + 1;
      const array = geometry.attributes.position.array as Float32Array;
      const start = positions[edge.from];
      const end = positions[edge.to];
      for (let step = 0; step < STEPS; step++) {
        bezier(start, end, edge.bend, (step / (STEPS - 1)) * stop, point);
        const offset = step * 3;
        array[offset] = point.x;
        array[offset + 1] = point.y;
        array[offset + 2] = point.z;
      }
      geometry.attributes.position.needsUpdate = true;
      geometry.setDrawRange(0, visibleCount);
      material.opacity =
        reveal *
        portraitWeight *
        (edge.kind === 'supported'
          ? 0.75 * evidence
          : edge.kind === 'unresolved'
            ? 0.46 * uncertainty
            : 0.38 * (1 - evidence * 0.64));
      line.visible = reveal > 0.01 && portraitWeight > 0.2;
    });
    let count = 0;
    redEdges.forEach((edge) => {
      const reveal = smoothstep(rangeProgress(p, edge.onset, edge.onset + 0.17));
      const visibleSegments = Math.floor(reveal * (STEPS - 1));
      for (let step = 0; step < visibleSegments; step++) {
        bezier(positions[edge.from], positions[edge.to], edge.bend, step / (STEPS - 1), point);
        bezier(positions[edge.from], positions[edge.to], edge.bend, (step + 1) / (STEPS - 1), next);
        direction.copy(next).sub(point);
        const length = direction.length();
        segment.position.copy(point).add(next).multiplyScalar(0.5);
        segment.quaternion.setFromUnitVectors(up, direction.normalize());
        segment.scale.set(
          1 + experiment * 0.3 + evidence * 0.28,
          length,
          1 + experiment * 0.3 + evidence * 0.28,
        );
        segment.updateMatrix();
        redPath.setMatrixAt(count, segment.matrix);
        count++;
      }
    });
    redPath.count = count;
    redPath.instanceMatrix.needsUpdate = true;
    redMaterial.opacity =
      hypothesis * (0.77 + experiment * 0.13 + evidence * 0.1) * (1 - uncertainty * 0.72);
  });

  return (
    <group name="NS_NeuralConstellation">
      {NODES.map((node, index) => (
        <group
          key={node.id}
          ref={(element) => {
            nodes.current[index] = element;
          }}
          position={[...node.loose]}
          visible={node.onset === 0}
        >
          <mesh>
            <octahedronGeometry args={[node.selected ? 0.088 : 0.062, 0]} />
            <meshBasicMaterial
              ref={(material) => {
                nodeMaterials.current[index] = material;
              }}
              color={node.selected ? PARCHMENT : ICE}
              transparent
              opacity={0.3}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[0, 0, -0.04]}>
            <boxGeometry args={[0.19, 0.008, 0.008]} />
            <meshBasicMaterial color={node.selected ? AMBER : BLUE} transparent opacity={0.58} />
          </mesh>
        </group>
      ))}
      {candidateLines.map(({ edge, line }) => (
        <primitive key={`${edge.from}:${edge.to}:${edge.kind}`} object={line} />
      ))}
      <primitive object={redPath} />
    </group>
  );
}

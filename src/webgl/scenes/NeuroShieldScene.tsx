'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import {
  type DirectionalLight,
  type Group,
  type Mesh,
  type PerspectiveCamera,
  Vector3,
} from 'three';
import {
  getEvidenceProgress,
  getExperimentProgress,
  getHypothesisProgress,
  getUncertaintyProgress,
  smoothstep,
} from '@/components/neuroshield/neuroShieldChoreography';
import type { ChapterProgressController } from '@/experience/chapterProgress';

interface NeuroShieldSceneProps {
  controller: ChapterProgressController;
  portrait: boolean;
}

const INK = '#0b0908';
const CHARCOAL = '#24211e';
const PARCHMENT = '#e5dac7';
const PAPER = '#afa28e';
const MUTED = '#746c62';
const CRIMSON = '#7d201d';

const EVIDENCE_PLANES = [
  { position: [-2.7, 2.35, 0.7], size: [1.25, 0.75], stage: 0 },
  { position: [1.75, 1.3, 0.45], size: [1.05, 0.66], stage: 0 },
  { position: [-0.35, 3.05, -0.15], size: [1.35, 0.82], stage: 1 },
  { position: [2.85, 3.0, -0.55], size: [1.1, 0.7], stage: 1 },
  { position: [-2.15, 0.25, -0.6], size: [1.2, 0.72], stage: 2 },
  { position: [0.5, 0.15, -1.15], size: [1.4, 0.78], stage: 2 },
  { position: [3.2, 0.55, -1.45], size: [1.1, 0.68], stage: 3 },
  { position: [-3.25, 3.65, -1.55], size: [0.92, 0.6], stage: 3 },
] as const;

const NODES = [
  { position: [-2.05, 2.05, 0.52], stage: 0, kind: 'primary' },
  { position: [1.15, 1.55, 0.35], stage: 0, kind: 'primary' },
  { position: [-0.62, 2.62, -0.05], stage: 1, kind: 'primary' },
  { position: [2.25, 2.55, -0.45], stage: 1, kind: 'secondary' },
  { position: [-1.55, 0.82, -0.5], stage: 2, kind: 'secondary' },
  { position: [0.1, 0.72, -0.95], stage: 2, kind: 'primary' },
  { position: [2.6, 0.95, -1.2], stage: 2, kind: 'terminated' },
  { position: [-2.8, 3.35, -1.35], stage: 3, kind: 'secondary' },
  { position: [0.85, 3.55, -1.15], stage: 3, kind: 'secondary' },
  { position: [3.25, 2.0, -1.6], stage: 3, kind: 'primary' },
] as const;

const CONNECTIONS = [
  { from: [-2.05, 2.05, 0.52], to: [-0.62, 2.62, -0.05], stage: 1, kind: 'primary' },
  { from: [-0.62, 2.62, -0.05], to: [1.15, 1.55, 0.35], stage: 1, kind: 'primary' },
  { from: [-0.62, 2.62, -0.05], to: [2.25, 2.55, -0.45], stage: 1, kind: 'secondary' },
  { from: [-2.05, 2.05, 0.52], to: [-1.55, 0.82, -0.5], stage: 2, kind: 'secondary' },
  { from: [-1.55, 0.82, -0.5], to: [0.1, 0.72, -0.95], stage: 2, kind: 'primary' },
  { from: [0.1, 0.72, -0.95], to: [2.6, 0.95, -1.2], stage: 2, kind: 'terminated' },
  { from: [2.25, 2.55, -0.45], to: [0.85, 3.55, -1.15], stage: 3, kind: 'secondary' },
  { from: [0.85, 3.55, -1.15], to: [-2.8, 3.35, -1.35], stage: 3, kind: 'secondary' },
  { from: [2.25, 2.55, -0.45], to: [3.25, 2.0, -1.6], stage: 3, kind: 'primary' },
] as const;

function stageProgress(stage: number, hypothesis: number, experiment: number, evidence: number) {
  if (stage === 0) return 1;
  if (stage === 1) return hypothesis;
  if (stage === 2) return experiment;
  return evidence;
}

function segmentTransform(from: readonly number[], to: readonly number[]) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const dz = to[2] - from[2];
  return {
    length: Math.sqrt(dx * dx + dy * dy + dz * dz),
    position: [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2] as const,
    rotation: [0, -Math.atan2(dz, Math.sqrt(dx * dx + dy * dy)), Math.atan2(dy, dx)] as const,
  };
}

function ResearchStructure({
  progress,
  portrait,
}: {
  progress: React.MutableRefObject<number>;
  portrait: boolean;
}) {
  const planes = useRef<(Group | null)[]>([]);
  const nodes = useRef<(Mesh | null)[]>([]);
  const connections = useRef<(Group | null)[]>([]);
  const bridgeLeft = useRef<Mesh>(null);
  const bridgeRight = useRef<Mesh>(null);
  const bridgeBranch = useRef<Group>(null);
  const termination = useRef<Mesh>(null);

  useFrame(() => {
    const hypothesis = getHypothesisProgress(progress.current);
    const experiment = getExperimentProgress(progress.current);
    const evidence = getEvidenceProgress(progress.current);
    const uncertainty = getUncertaintyProgress(progress.current);

    planes.current.forEach((plane, index) => {
      if (!plane) return;
      const reveal = stageProgress(EVIDENCE_PLANES[index].stage, hypothesis, experiment, evidence);
      plane.visible = reveal > 0.01;
      plane.scale.setScalar(Math.max(0.001, reveal));
      plane.rotation.z = (index % 2 === 0 ? -0.025 : 0.025) * (1 - reveal);
    });

    nodes.current.forEach((node, index) => {
      if (!node) return;
      const reveal = stageProgress(NODES[index].stage, hypothesis, experiment, evidence);
      node.visible = reveal > 0.01;
      node.scale.setScalar(Math.max(0.001, reveal));
    });

    connections.current.forEach((connection, index) => {
      if (!connection) return;
      const reveal = stageProgress(CONNECTIONS[index].stage, hypothesis, experiment, evidence);
      connection.visible = reveal > 0.01;
      connection.scale.x = Math.max(0.001, reveal);
    });

    if (bridgeLeft.current && bridgeRight.current) {
      bridgeLeft.current.scale.x = 1 - hypothesis * 0.14;
      bridgeRight.current.scale.x = 1 - hypothesis * 0.2;
      bridgeLeft.current.position.x = -1.16 - hypothesis * 0.12;
      bridgeRight.current.position.x = 1.16 + hypothesis * 0.18;
    }
    if (bridgeBranch.current) {
      bridgeBranch.current.visible = hypothesis > 0.01;
      bridgeBranch.current.scale.setScalar(Math.max(0.001, hypothesis));
      bridgeBranch.current.rotation.z = -0.16 + uncertainty * 0.12;
    }
    if (termination.current) {
      termination.current.visible = experiment > 0.1;
      termination.current.scale.y = Math.max(0.001, experiment);
    }
  });

  return (
    <group scale={[portrait ? 0.72 : 1, portrait ? 0.86 : 1, 1]} position={[0, -0.1, 0]}>
      <group position={[0, 2.0, 0.8]}>
        <mesh ref={bridgeLeft} position={[-1.16, 0, 0]}>
          <boxGeometry args={[1.92, 0.025, 0.025]} />
          <meshBasicMaterial color={PARCHMENT} />
        </mesh>
        <mesh ref={bridgeRight} position={[1.16, 0, 0]}>
          <boxGeometry args={[1.92, 0.025, 0.025]} />
          <meshBasicMaterial color={PARCHMENT} />
        </mesh>
        <mesh position={[-2.15, 0, 0]}>
          <sphereGeometry args={[0.075, 12, 10]} />
          <meshBasicMaterial color={PARCHMENT} />
        </mesh>
        <mesh position={[2.15, 0, 0]}>
          <sphereGeometry args={[0.075, 12, 10]} />
          <meshBasicMaterial color={PARCHMENT} />
        </mesh>
        <group ref={bridgeBranch} position={[0, 0, -0.05]} visible={false}>
          <mesh position={[0.72, -0.43, 0]} rotation={[0, 0, -0.55]}>
            <boxGeometry args={[1.65, 0.022, 0.022]} />
            <meshBasicMaterial color={MUTED} />
          </mesh>
          <mesh position={[-0.66, 0.38, -0.1]} rotation={[0, 0, 0.48]}>
            <boxGeometry args={[1.45, 0.022, 0.022]} />
            <meshBasicMaterial color={MUTED} />
          </mesh>
        </group>
      </group>

      {EVIDENCE_PLANES.map((plane, index) => (
        <group
          key={plane.position.join(':')}
          ref={(node) => {
            planes.current[index] = node;
          }}
          position={plane.position}
        >
          <mesh castShadow>
            <boxGeometry args={[plane.size[0], plane.size[1], 0.055]} />
            <meshStandardMaterial color={index < 2 ? PARCHMENT : PAPER} roughness={0.9} />
          </mesh>
          {[0.2, 0, -0.2].map((y, lineIndex) => (
            <mesh key={y} position={[-plane.size[0] * 0.16, y * plane.size[1], 0.034]}>
              <boxGeometry args={[plane.size[0] * (0.48 + lineIndex * 0.08), 0.024, 0.008]} />
              <meshBasicMaterial color={lineIndex === 2 && index === 5 ? CRIMSON : CHARCOAL} />
            </mesh>
          ))}
        </group>
      ))}

      {NODES.map((node, index) => (
        <mesh
          key={node.position.join(':')}
          ref={(element) => {
            nodes.current[index] = element;
          }}
          position={node.position}
        >
          <sphereGeometry args={[node.kind === 'primary' ? 0.09 : 0.07, 12, 10]} />
          <meshStandardMaterial
            color={
              node.kind === 'terminated' ? CRIMSON : node.kind === 'primary' ? PARCHMENT : MUTED
            }
            roughness={0.76}
          />
        </mesh>
      ))}

      {CONNECTIONS.map((connection, index) => {
        const transform = segmentTransform(connection.from, connection.to);
        return (
          <group
            key={`${connection.from.join(':')}-${connection.to.join(':')}`}
            ref={(element) => {
              connections.current[index] = element;
            }}
            position={transform.position}
            rotation={transform.rotation}
          >
            <mesh>
              <boxGeometry
                args={[transform.length, connection.kind === 'primary' ? 0.028 : 0.018, 0.018]}
              />
              <meshBasicMaterial
                color={
                  connection.kind === 'terminated'
                    ? MUTED
                    : connection.kind === 'primary'
                      ? PARCHMENT
                      : MUTED
                }
              />
            </mesh>
          </group>
        );
      })}

      <mesh ref={termination} position={[2.67, 0.95, -1.2]} visible={false}>
        <boxGeometry args={[0.025, 0.26, 0.025]} />
        <meshBasicMaterial color={CRIMSON} />
      </mesh>
    </group>
  );
}

function lerpVector(points: Vector3[], progress: number) {
  const scaled = Math.min(points.length - 1, Math.max(0, progress * (points.length - 1)));
  const index = Math.min(points.length - 2, Math.floor(scaled));
  return points[index].clone().lerp(points[index + 1], smoothstep(scaled - index));
}

export function NeuroShieldScene({ controller, portrait }: NeuroShieldSceneProps) {
  const { camera } = useThree();
  const keyLight = useRef<DirectionalLight>(null);
  const target = useMemo(() => new Vector3(), []);
  const desktopCamera = useMemo(
    () => [
      new Vector3(0, 2.05, 9.2),
      new Vector3(-0.65, 2.2, 8.55),
      new Vector3(0.15, 2.0, 7.95),
      new Vector3(0.95, 2.28, 8.3),
      new Vector3(0.45, 2.45, 9.0),
    ],
    [],
  );
  const portraitCamera = useMemo(
    () => [
      new Vector3(0, 2.1, 11.5),
      new Vector3(-0.3, 2.35, 10.95),
      new Vector3(0.15, 2.15, 10.45),
      new Vector3(0.45, 2.4, 10.8),
      new Vector3(0.1, 2.55, 11.35),
    ],
    [],
  );

  useFrame(() => {
    const p = controller.progress.current;
    const evidence = getEvidenceProgress(p);
    const uncertainty = getUncertaintyProgress(p);
    const perspectiveCamera = camera as PerspectiveCamera;
    const desiredFov = portrait ? 50 : 39;
    if (perspectiveCamera.fov !== desiredFov) {
      perspectiveCamera.fov = desiredFov;
      perspectiveCamera.updateProjectionMatrix();
    }
    camera.position.copy(lerpVector(portrait ? portraitCamera : desktopCamera, p));
    target.set(
      (portrait ? 0 : -0.18) + evidence * 0.42 - uncertainty * 0.2,
      1.95 + evidence * 0.18,
      -0.2 - evidence * 0.38,
    );
    camera.lookAt(target);
    camera.updateMatrixWorld();
    if (keyLight.current) {
      keyLight.current.intensity = 1.65 + evidence * 0.75;
      keyLight.current.position.x = -3.5 + evidence * 4.2;
    }
  });

  return (
    <>
      <color attach="background" args={[INK]} />
      <fog attach="fog" args={[INK, portrait ? 10.5 : 8.5, portrait ? 18 : 15]} />
      <ambientLight intensity={0.48} color="#d6c8b2" />
      <directionalLight ref={keyLight} position={[-3.5, 6.5, 5]} intensity={1.65} color="#e6d9c5" />
      <pointLight position={[3.5, 1.2, 2]} intensity={0.55} color="#6a5149" distance={7} />
      <ResearchStructure progress={controller.progress} portrait={portrait} />
    </>
  );
}

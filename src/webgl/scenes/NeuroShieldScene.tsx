'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { type DirectionalLight, type PerspectiveCamera, type PointLight, Vector3 } from 'three';
import {
  getEvidenceProgress,
  getExperimentProgress,
  getHypothesisProgress,
  getUncertaintyProgress,
  smoothstep,
} from '@/components/neuroshield/neuroShieldChoreography';
import type { ChapterProgressController } from '@/experience/chapterProgress';
import { NeuralConstellation } from './neuroshield/NeuralConstellation';
import { ResearchWall } from './neuroshield/ResearchWall';

interface NeuroShieldSceneProps {
  controller: ChapterProgressController;
  portrait: boolean;
}

const KEYS = [0, 0.2, 0.42, 0.64, 0.84, 1] as const;
const DESKTOP_CAMERA = [
  [-2.7, 2.62, 13],
  [-2.1, 2.52, 9.8],
  [3.15, 2.65, 6.8],
  [-0.5, 2.32, -2.8],
  [4.05, 2.58, 2.5],
  [-0.9, 3.5, 12.5],
] as const;
const DESKTOP_TARGET = [
  [-1.2, 2.3, -4.6],
  [-1.3, 2.3, -4.4],
  [0.8, 2.52, -4.8],
  [0.2, 2.35, -6.2],
  [3.3, 2.25, -4],
  [0.1, 2.5, -7.2],
] as const;
const PORTRAIT_CAMERA = [
  [-1.25, 2.7, 15.1],
  [-0.8, 2.55, 11.2],
  [1.65, 2.75, 8.7],
  [0.1, 2.36, -1.5],
  [2.0, 2.65, 5.1],
  [-0.3, 3.55, 15.2],
] as const;
const PORTRAIT_TARGET = [
  [-0.7, 2.3, -4.7],
  [-0.8, 2.3, -4.5],
  [0.4, 2.52, -4.8],
  [0.1, 2.34, -6.1],
  [1.6, 2.25, -4],
  [0.1, 2.5, -7.1],
] as const;

function samplePath(points: readonly (readonly number[])[], progress: number, out: Vector3) {
  const last = KEYS.length - 1;
  let index = last - 1;
  for (let key = 0; key < last; key++) {
    if (progress <= KEYS[key + 1]) {
      index = key;
      break;
    }
  }
  const t = smoothstep((progress - KEYS[index]) / (KEYS[index + 1] - KEYS[index]));
  const a = points[index];
  const b = points[index + 1];
  out.set(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
}

export function NeuroShieldScene({ controller, portrait }: NeuroShieldSceneProps) {
  const { camera } = useThree();
  const target = useMemo(() => new Vector3(), []);
  const keyLight = useRef<DirectionalLight>(null);
  const coolLight = useRef<PointLight>(null);
  const evidenceLight = useRef<PointLight>(null);
  const pathLight = useRef<PointLight>(null);

  useFrame(() => {
    const p = controller.progress.current;
    const hypothesis = getHypothesisProgress(p);
    const experiment = getExperimentProgress(p);
    const evidence = getEvidenceProgress(p);
    const uncertainty = getUncertaintyProgress(p);
    const perspective = camera as PerspectiveCamera;
    const fov = (portrait ? 50 : 39) + uncertainty * (portrait ? 3 : 4);
    if (perspective.fov !== fov) {
      perspective.fov = fov;
      perspective.updateProjectionMatrix();
    }
    samplePath(portrait ? PORTRAIT_CAMERA : DESKTOP_CAMERA, p, camera.position);
    samplePath(portrait ? PORTRAIT_TARGET : DESKTOP_TARGET, p, target);
    camera.lookAt(target);
    camera.updateMatrixWorld();
    if (keyLight.current) keyLight.current.intensity = 0.82 + experiment * 0.22 + evidence * 0.16;
    if (coolLight.current)
      coolLight.current.intensity = 1.25 + hypothesis * 0.32 + experiment * 0.38 - evidence * 0.23;
    if (evidenceLight.current)
      evidenceLight.current.intensity = 0.26 + evidence * 1.72 - uncertainty * 0.66;
    if (pathLight.current) {
      pathLight.current.position.set(
        -3.8 + hypothesis * 2.2 + experiment * 3.2 + evidence * 1.25,
        3.2,
        -2.4 - experiment * 1.25,
      );
      pathLight.current.intensity =
        hypothesis * (0.45 + experiment * 0.45 + evidence * 0.24) * (1 - uncertainty * 0.76);
    }
  });

  return (
    <>
      <color attach="background" args={['#315768']} />
      <ambientLight intensity={0.35} color="#9CC6C5" />
      <directionalLight ref={keyLight} position={[-6, 8, 5]} intensity={0.82} color="#F2E8D5" />
      <pointLight
        ref={coolLight}
        position={[-5.8, 5.1, -1.4]}
        intensity={1.25}
        color="#9CC6C5"
        distance={14}
        decay={2}
      />
      <pointLight
        ref={evidenceLight}
        position={[4.15, 3.7, -2.7]}
        intensity={0.26}
        color="#B88946"
        distance={10}
        decay={2}
      />
      <pointLight
        ref={pathLight}
        position={[-3.8, 3.2, -2.4]}
        intensity={0}
        color="#8B1E2D"
        distance={4.6}
        decay={2}
      />
      <ResearchWall progress={controller.progress} portrait={portrait} />
      <NeuralConstellation progress={controller.progress} portrait={portrait} />
    </>
  );
}

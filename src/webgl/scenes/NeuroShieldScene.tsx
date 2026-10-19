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
import { ResearchField } from './neuroshield/ResearchField';

interface NeuroShieldSceneProps {
  controller: ChapterProgressController;
  portrait: boolean;
}

const INK = '#111111';
const PARCHMENT = '#F2E8D5';

// One camera path: enter observations, follow a proposed relationship,
// traverse the experiment, then pull back to reveal unresolved context.
const DESKTOP_CAMERA = [
  [0.05, 2.13, 9.65],
  [-0.55, 2.2, 7.4],
  [-0.28, 2.12, 1.15],
  [0.62, 2.3, 5.6],
  [0.35, 2.6, 10.5],
] as const;
const PORTRAIT_CAMERA = [
  [0.02, 2.28, 11.7],
  [-0.3, 2.4, 9.1],
  [0.08, 2.23, 2.75],
  [0.36, 2.45, 7.35],
  [0.1, 2.65, 12.8],
] as const;

function sampleCamera(points: readonly (readonly number[])[], progress: number, out: Vector3) {
  const scaled = Math.min(4, Math.max(0, progress * 4));
  const index = Math.min(3, Math.floor(scaled));
  const t = smoothstep(scaled - index);
  const a = points[index];
  const b = points[index + 1];
  out.set(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
}

export function NeuroShieldScene({ controller, portrait }: NeuroShieldSceneProps) {
  const { camera } = useThree();
  const keyLight = useRef<DirectionalLight>(null);
  const focusLight = useRef<PointLight>(null);
  const coolFill = useRef<PointLight>(null);
  const target = useMemo(() => new Vector3(), []);

  useFrame(() => {
    const p = controller.progress.current;
    const hypothesis = getHypothesisProgress(p);
    const experiment = getExperimentProgress(p);
    const evidence = getEvidenceProgress(p);
    const uncertainty = getUncertaintyProgress(p);
    const perspective = camera as PerspectiveCamera;
    const fov = portrait ? 50 : 39;
    if (perspective.fov !== fov) {
      perspective.fov = fov;
      perspective.updateProjectionMatrix();
    }
    sampleCamera(portrait ? PORTRAIT_CAMERA : DESKTOP_CAMERA, p, camera.position);
    target.set(
      (portrait ? 0 : -0.12) + hypothesis * 0.16 + experiment * 0.12 - uncertainty * 0.28,
      1.95 + evidence * 0.13 + uncertainty * 0.13,
      -0.85 - experiment * 0.3 - uncertainty * 0.32,
    );
    camera.lookAt(target);
    camera.updateMatrixWorld();
    if (keyLight.current) {
      keyLight.current.intensity = 1.05 + experiment * 0.28 + evidence * 0.14 - uncertainty * 0.13;
      keyLight.current.position.x = -3.4 + evidence * 2.4;
    }
    if (focusLight.current) {
      focusLight.current.position.set(
        -2.2 + hypothesis * 1.3 + experiment * 1.4 + evidence * 0.95,
        3.0 - evidence * 0.45,
        1.85 - hypothesis * 2.35 - experiment * 1.45 - evidence * 1.1,
      );
      focusLight.current.intensity =
        1.5 + hypothesis * 0.55 + experiment * 1.05 + evidence * 0.45 - uncertainty * 1.1;
    }
    if (coolFill.current)
      coolFill.current.intensity = 0.38 + experiment * 0.34 + uncertainty * 0.18;
  });

  return (
    <>
      <color attach="background" args={[INK]} />
      <fog attach="fog" args={[INK, portrait ? 10.5 : 9.5, portrait ? 24 : 22]} />
      <ambientLight intensity={0.2} color={PARCHMENT} />
      <directionalLight
        ref={keyLight}
        position={[-3.4, 5.7, 4.6]}
        intensity={1.05}
        color={PARCHMENT}
      />
      <pointLight
        ref={focusLight}
        position={[-2.2, 3, 1.85]}
        intensity={1.5}
        color="#F2E8D5"
        distance={3.8}
        decay={2}
      />
      <pointLight
        ref={coolFill}
        position={[2.65, 3.15, -3.35]}
        intensity={0.38}
        color="#A2B5C1"
        distance={5.8}
        decay={2}
      />
      <ResearchField progress={controller.progress} portrait={portrait} />
    </>
  );
}

'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import {
  type AmbientLight,
  type HemisphereLight,
  Object3D,
  type DirectionalLight,
  type PerspectiveCamera,
  type PointLight,
  Vector3,
} from 'three';
import { rangeProgress, smoothstep } from '@/components/neuroshield/neuroShieldChoreography';
import type { ChapterProgressController } from '@/experience/chapterProgress';
import { AnatomicalEnvironment } from './neuroshield/AnatomicalEnvironment';
import { AnatomicalSlices } from './neuroshield/AnatomicalSlices';
import { BrainAnatomy } from './neuroshield/BrainAnatomy';
import { ImagingSequence } from './neuroshield/ImagingSequence';
import { SCAN_BACKGROUND } from './neuroshield/ScanVolume';

interface NeuroShieldSceneProps {
  controller: ChapterProgressController;
  portrait: boolean;
}

const KEYS = [0, 0.18, 0.35, 0.45, 0.52, 0.6, 0.68, 0.78, 0.88, 1] as const;
const CAMERA = [
  [0.6, 2.45, 10.8],
  [-1.45, 2.35, 6.7],
  [0.15, 2.08, 2.6],
  [0.1, 1.9, -0.4],
  [-0.1, 1.88, -5.2],
  [0.1, 1.83, -11.1],
  [0.2, 1.82, -17.8],
  [0.5, 2.05, -19.2],
  [1.3, 2.65, -19.1],
  [0.7, 2.8, -17.3],
] as const;
const TARGET = [
  [0.65, 1.8, -2.2],
  [0.8, 1.8, -2.2],
  [0.45, 1.8, -4.4],
  [0, 1.8, -7.2],
  [0, 1.8, -10.9],
  [0, 1.8, -16.7],
  [0, 1.9, -25.8],
  [0, 2.1, -27],
  [0, 1.8, -30],
  [0, 1.8, -30],
] as const;

function samplePath(points: readonly (readonly number[])[], progress: number, out: Vector3) {
  let index = KEYS.length - 2;
  for (let key = 0; key < KEYS.length - 1; key++) {
    if (progress <= KEYS[key + 1]) {
      index = key;
      break;
    }
  }
  const t = smoothstep(rangeProgress(progress, KEYS[index], KEYS[index + 1]));
  const a = points[index];
  const b = points[index + 1];
  out.set(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
}

export function NeuroShieldScene({ controller, portrait }: NeuroShieldSceneProps) {
  const { camera } = useThree();
  const target = useMemo(() => new Vector3(), []);
  const warm = useRef<DirectionalLight>(null);
  const cool = useRef<PointLight>(null);
  const violet = useRef<PointLight>(null);
  const evidence = useRef<PointLight>(null);
  const crimson = useRef<PointLight>(null);
  const ambient = useRef<AmbientLight>(null);
  const hemisphere = useRef<HemisphereLight>(null);
  const lightTarget = useMemo(() => new Object3D(), []);

  useFrame(() => {
    const p = controller.progress.current;
    samplePath(CAMERA, p, camera.position);
    samplePath(TARGET, p, target);
    if (portrait) {
      camera.position.z += 1.6;
      target.x += 0.12;
    }
    camera.lookAt(target);
    camera.updateMatrixWorld();
    const perspective = camera as PerspectiveCamera;
    const fov = portrait ? 53 : 40;
    if (perspective.fov !== fov || perspective.near !== 0.1) {
      perspective.fov = fov;
      perspective.near = 0.1;
      perspective.updateProjectionMatrix();
    }
    const hypothesis = smoothstep(rangeProgress(p, 0.18, 0.42));
    const experiment = smoothstep(rangeProgress(p, 0.43, 0.68));
    const clarity = smoothstep(rangeProgress(p, 0.65, 0.79));
    const uncertainty = smoothstep(rangeProgress(p, 0.82, 1));
    if (warm.current)
      warm.current.intensity = 1.5 - hypothesis * 0.45 + clarity * 0.55 - uncertainty * 0.5;
    if (cool.current)
      cool.current.intensity = 1.8 + hypothesis * 0.8 + experiment * 0.55 - clarity * 0.4;
    if (cool.current) cool.current.position.z = -0.2 - experiment * 9.8;
    if (violet.current)
      violet.current.intensity = 0.24 + hypothesis * 0.56 * (1 - uncertainty * 0.7);
    if (violet.current) violet.current.position.z = -1.2 - experiment * 16.8;
    if (evidence.current) evidence.current.intensity = clarity * 1.45 * (1 - uncertainty * 0.55);
    if (crimson.current)
      crimson.current.intensity =
        smoothstep(rangeProgress(p, 0.27, 0.34)) *
        (1 - smoothstep(rangeProgress(p, 0.38, 0.46))) *
        0.16;
    if (ambient.current) ambient.current.intensity = 0.43;
    if (hemisphere.current) hemisphere.current.intensity = 0.42;
  });

  return (
    <>
      <color attach="background" args={[SCAN_BACKGROUND]} />
      <fog attach="fog" args={[SCAN_BACKGROUND, 24, 62]} />
      <ambientLight ref={ambient} color="#B4CCD0" intensity={0.43} />
      <hemisphereLight ref={hemisphere} args={['#C1DEE1', '#8698AA', 0.42]} />
      <primitive object={lightTarget} />
      <directionalLight
        ref={warm}
        target={lightTarget}
        position={[-5, 7, 7]}
        color="#F2E8D5"
        intensity={1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-normalBias={0.018}
        shadow-radius={3}
      />
      <pointLight
        ref={cool}
        position={[3.2, 3.5, -0.2]}
        color="#8BBCC6"
        intensity={1.8}
        distance={26}
        decay={2}
      />
      <pointLight
        ref={violet}
        position={[-2.6, 2.7, -1.2]}
        color="#9B90AF"
        intensity={0.24}
        distance={18}
        decay={2}
      />
      <pointLight
        ref={evidence}
        position={[1, 5, -27]}
        color="#F7F4E8"
        intensity={0}
        distance={15}
        decay={2}
      />
      <pointLight
        ref={crimson}
        position={[1.5, 2.7, -0.5]}
        color="#8B1E2D"
        intensity={0}
        distance={3}
        decay={2}
      />
      <AnatomicalEnvironment progress={controller.progress} />
      <BrainAnatomy progress={controller.progress} />
      <AnatomicalSlices progress={controller.progress} />
      <ImagingSequence progress={controller.progress} portrait={portrait} />
      <BrainAnatomy progress={controller.progress} ending />
      <AnatomicalSlices progress={controller.progress} ending />
    </>
  );
}

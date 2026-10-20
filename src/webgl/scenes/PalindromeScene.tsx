'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { type MutableRefObject, type RefObject, useMemo, useRef } from 'react';
import {
  type AmbientLight,
  Color,
  type DirectionalLight,
  type Group,
  type HemisphereLight,
  type PerspectiveCamera,
  type PointLight,
  Vector3,
} from 'three';
import {
  getControlProgress,
  getFragmentationProgress,
  getOrganizationProgress,
  getRelationshipProgress,
  rangeProgress,
  smoothstep,
} from '@/components/palindrome/palindromeChoreography';
import type { ChapterProgressController } from '@/experience/chapterProgress';
import { DomesticRoom, ROOM_PALETTE } from './palindrome/DomesticRoom';
import { InformationField } from './palindrome/InformationField';

interface PalindromeSceneProps {
  controller: ChapterProgressController;
  portrait: boolean;
  bridgeProgress?: MutableRefObject<number>;
  headAnchorRef?: RefObject<Group | null>;
  headInteriorProgress?: MutableRefObject<number>;
}

export function PalindromeScene({
  controller,
  portrait,
  bridgeProgress,
  headAnchorRef,
  headInteriorProgress,
}: PalindromeSceneProps) {
  const { camera } = useThree();
  const target = useMemo(() => new Vector3(0, 1.9, -0.55), []);
  const reflectedFill = useRef<PointLight>(null);
  const ambient = useRef<AmbientLight>(null);
  const hemisphere = useRef<HemisphereLight>(null);
  const key = useRef<DirectionalLight>(null);
  const fillColors = useMemo(
    () => ({
      warm: new Color('#F2EDE3'),
      crimson: new Color(ROOM_PALETTE.crimson),
    }),
    [],
  );

  useFrame(() => {
    const p = controller.progress.current;
    const domesticLight = bridgeProgress
      ? 1 - smoothstep(rangeProgress(bridgeProgress.current, 0.28, 0.78))
      : 1;
    if (ambient.current) ambient.current.intensity = 0.24 * domesticLight;
    if (hemisphere.current) hemisphere.current.intensity = 0.58 * domesticLight;
    if (key.current) key.current.intensity = 1.9 * domesticLight;
    const relationships = getRelationshipProgress(p);
    const organization = getOrganizationProgress(p);
    const attention =
      (getFragmentationProgress(p) * 0.22 + relationships * 0.78) * (1 - getControlProgress(p));
    // Reuse the local fill: a small reflected warmth shift, never a red wash.
    if (reflectedFill.current) {
      reflectedFill.current.color.lerpColors(fillColors.warm, fillColors.crimson, attention * 0.1);
      reflectedFill.current.intensity = (1.45 + attention * 0.2) * domesticLight;
    }
    if (bridgeProgress) return;
    const perspectiveCamera = camera as PerspectiveCamera;
    const desiredFov = portrait ? 51 : 39;
    if (perspectiveCamera.fov !== desiredFov || perspectiveCamera.near !== 0.1) {
      perspectiveCamera.fov = desiredFov;
      perspectiveCamera.near = 0.1;
      perspectiveCamera.updateProjectionMatrix();
    }
    camera.position.set(
      portrait ? 0.1 : -0.2 + relationships * 0.18,
      portrait ? 3.15 : 3.05 + organization * 0.08,
      portrait ? 11.4 : 9.6 - relationships * 0.2,
    );
    target.set(portrait ? 0 : -0.05, 1.9 + organization * 0.04, -0.55);
    camera.lookAt(target);
    camera.updateMatrixWorld();
  });

  return (
    <>
      {!bridgeProgress && <color attach="background" args={[ROOM_PALETTE.ink]} />}
      <ambientLight ref={ambient} intensity={0.24} color="#F3F0E9" />
      <hemisphereLight ref={hemisphere} args={['#E5EBE7', '#686E64', 0.58]} />
      <directionalLight
        ref={key}
        position={[-3.8, 4.2, 1.5]}
        intensity={1.9}
        color={ROOM_PALETTE.parchment}
        castShadow={!portrait}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-3}
        shadow-camera-near={0.5}
        shadow-camera-far={16}
        shadow-normalBias={0.018}
        shadow-bias={-0.0001}
        shadow-radius={5}
      />
      <pointLight
        ref={reflectedFill}
        position={[1.3, 1.8, 1.1]}
        intensity={1.45}
        color={ROOM_PALETTE.parchment}
        distance={4.6}
        decay={2}
      />
      <DomesticRoom
        portrait={portrait}
        headAnchorRef={headAnchorRef}
        interiorProgress={headInteriorProgress ?? bridgeProgress}
      />
      <InformationField
        progress={controller.progress}
        portrait={portrait}
        exitProgress={bridgeProgress}
      />
    </>
  );
}

'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useMemo } from 'react';
import { type PerspectiveCamera, Vector3 } from 'three';
import {
  getOrganizationProgress,
  getRelationshipProgress,
} from '@/components/palindrome/palindromeChoreography';
import type { ChapterProgressController } from '@/experience/chapterProgress';
import { DomesticRoom, ROOM_PALETTE } from './palindrome/DomesticRoom';
import { InformationField } from './palindrome/InformationField';

interface PalindromeSceneProps {
  controller: ChapterProgressController;
  portrait: boolean;
}

export function PalindromeScene({ controller, portrait }: PalindromeSceneProps) {
  const { camera } = useThree();
  const target = useMemo(() => new Vector3(0, 1.9, -0.55), []);

  useFrame(() => {
    const p = controller.progress.current;
    const relationships = getRelationshipProgress(p);
    const organization = getOrganizationProgress(p);
    const perspectiveCamera = camera as PerspectiveCamera;
    const desiredFov = portrait ? 51 : 39;
    if (perspectiveCamera.fov !== desiredFov) {
      perspectiveCamera.fov = desiredFov;
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
      <color attach="background" args={[ROOM_PALETTE.ink]} />
      <ambientLight intensity={0.24} color={ROOM_PALETTE.parchment} />
      <hemisphereLight args={[ROOM_PALETTE.parchment, '#625B4E', 0.58]} />
      <directionalLight
        position={[-3.8, 4.2, 1.5]}
        intensity={1.75}
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
        position={[1.3, 1.8, 1.1]}
        intensity={1.2}
        color={ROOM_PALETTE.parchment}
        distance={6}
        decay={2}
      />
      <DomesticRoom portrait={portrait} />
      <InformationField progress={controller.progress} portrait={portrait} />
    </>
  );
}

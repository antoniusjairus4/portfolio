'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { Suspense, useMemo, useRef } from 'react';
import {
  type AmbientLight,
  Color,
  type DirectionalLight,
  type Group,
  type HemisphereLight,
  MathUtils,
  type PerspectiveCamera,
  type PointLight,
  Vector3,
} from 'three';
import type { ChapterProgressController } from '@/experience/chapterProgress';
import { DomesticRoom, ROOM_PALETTE } from './palindrome/DomesticRoom';
import { InformationField } from './palindrome/InformationField';
import { IntactBrain } from './NeuroShieldScene';

function smoothstep(min: number, max: number, value: number) {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

export function PalindromeNeuroShieldBridgeScene({
  controller,
  portrait,
}: {
  controller: ChapterProgressController;
  portrait: boolean;
}) {
  const { camera, invalidate } = useThree();
  const palindromeGroup = useRef<Group>(null);
  const brainAnchor = useRef<Group>(null);

  // Palindrome lights
  const palAmbient = useRef<AmbientLight>(null);
  const palHemi = useRef<HemisphereLight>(null);
  const reflectedFill = useRef<PointLight>(null);
  const palindromeKey = useRef<DirectionalLight>(null);

  // NeuroShield lights
  const neuroAmbient = useRef<AmbientLight>(null);
  const neuroHemi = useRef<HemisphereLight>(null);
  const neuroKey1 = useRef<DirectionalLight>(null);
  const neuroKey2 = useRef<DirectionalLight>(null);

  const startCamPos = useMemo(
    () => new Vector3(portrait ? 0.1 : -0.2, portrait ? 3.15 : 3.05, portrait ? 11.4 : 9.6),
    [portrait],
  );
  const endCamPos = useMemo(
    () => new Vector3(0, 0, portrait ? 9.9 : 7.15),
    [portrait],
  );
  const startTarget = useMemo(
    () => new Vector3(portrait ? 0 : -0.05, 1.9, -0.55),
    [portrait],
  );
  const endTarget = useMemo(() => new Vector3(0, 0, 0), []);
  const currentTarget = useMemo(() => new Vector3(), []);
  const bgColor = useMemo(() => new Color(ROOM_PALETTE.ink), []);

  const targetScale = portrait ? 0.8 : 0.94;
  const heldProgress = useRef(1);

  useFrame(() => {
    const p = Math.max(0, Math.min(1, controller.progress.current));
    const ease = p * p * (3 - 2 * p);

    // Camera FOV
    const perspCamera = camera as PerspectiveCamera;
    const startFov = portrait ? 51 : 39;
    const endFov = portrait ? 46 : 39;
    const currentFov = MathUtils.lerp(startFov, endFov, ease);
    if (perspCamera.fov !== currentFov || perspCamera.near !== 0.1) {
      perspCamera.fov = currentFov;
      perspCamera.near = 0.1;
      perspCamera.updateProjectionMatrix();
    }

    // Camera Position & LookAt smoothly interpolates from Palindrome to NeuroShield
    camera.position.lerpVectors(startCamPos, endCamPos, ease);
    currentTarget.lerpVectors(startTarget, endTarget, ease);
    camera.lookAt(currentTarget);

    // Palindrome room recedes back into depth and dissolves early without lifting into the sky
    if (palindromeGroup.current) {
      const roomRecedeZ = ease * -6.0;
      palindromeGroup.current.position.set(0, 0, roomRecedeZ);
      // Cleanly hide the room early so its underside is never viewed from below
      palindromeGroup.current.visible = p < 0.32;
    }

    // Palindrome light fading (complete by p = 0.3)
    const palLightFade = Math.max(0, 1 - p / 0.28);
    if (palAmbient.current) palAmbient.current.intensity = 0.33 * palLightFade;
    if (palHemi.current) palHemi.current.intensity = 0.67 * palLightFade;
    if (palindromeKey.current) palindromeKey.current.intensity = 1.7 * palLightFade;
    if (reflectedFill.current) reflectedFill.current.intensity = 1.45 * palLightFade;

    // NeuroShield light fading (fades in as brain arrives)
    const neuroLightFade = smoothstep(0.15, 0.85, p);
    if (neuroAmbient.current) neuroAmbient.current.intensity = 0.72 * neuroLightFade;
    if (neuroHemi.current) neuroHemi.current.intensity = 1.1 * neuroLightFade;
    if (neuroKey1.current) neuroKey1.current.intensity = 2.0 * neuroLightFade;
    if (neuroKey2.current) neuroKey2.current.intensity = 1.25 * neuroLightFade;

    // Brain entrance & 360-degree rotation
    if (brainAnchor.current) {
      // Moves up from below into the center like a normal scroll down
      const brainY = (1 - ease) * (portrait ? -5.8 : -4.8);
      brainAnchor.current.position.set(0, brainY, 0);

      // Full 360 degree rotation (from -2*PI to 0)
      brainAnchor.current.rotation.y = (1 - ease) * -Math.PI * 2;

      // Scale smoothly up to target scale
      const currentScale = targetScale * MathUtils.lerp(0.75, 1.0, ease);
      brainAnchor.current.scale.setScalar(currentScale);

      brainAnchor.current.visible = p > 0.02;
    }

    // Background color smoothly shifts from Palindrome ink (#0b0908) to NeuroShield black (#000000)
    bgColor.set(ROOM_PALETTE.ink).lerp(new Color('#000000'), ease);

    invalidate();
  });

  return (
    <>
      <color attach="background" args={[ROOM_PALETTE.ink]} />

      {/* Palindrome Scene (outgoing - recedes and dissolves cleanly) */}
      <group ref={palindromeGroup}>
        <ambientLight ref={palAmbient} intensity={0.33} color="#F3F0E9" />
        <hemisphereLight ref={palHemi} args={['#E5EBE7', '#686E64', 0.67]} />
        <directionalLight
          ref={palindromeKey}
          position={[-3.8, 4.2, 1.5]}
          intensity={1.7}
          color={ROOM_PALETTE.parchment}
          castShadow={false}
        />
        <pointLight
          ref={reflectedFill}
          position={[1.3, 1.8, 1.1]}
          intensity={1.45}
          color={ROOM_PALETTE.parchment}
          distance={6}
        />
        <DomesticRoom portrait={portrait} />
        <InformationField progress={heldProgress} portrait={portrait} />
      </group>

      {/* NeuroShield Lights (incoming - illuminating the brain) */}
      <ambientLight ref={neuroAmbient} intensity={0} color="#dce3e0" />
      <hemisphereLight ref={neuroHemi} args={['#edf0ea', '#465058', 0]} />
      <directionalLight ref={neuroKey1} position={[-4, 5, 6]} intensity={0} color="#f8f3e9" />
      <directionalLight ref={neuroKey2} position={[3, 2, -4]} intensity={0} color="#a5b9c3" />

      {/* Brain Model (incoming with 360 degree rotation) */}
      <group ref={brainAnchor}>
        <Suspense fallback={null}>
          <IntactBrain />
        </Suspense>
      </group>
    </>
  );
}

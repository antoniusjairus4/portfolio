'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import {
  CatmullRomCurve3,
  Color,
  type Fog,
  type Group,
  type PerspectiveCamera,
  Vector3,
} from 'three';
import { rangeProgress, smoothstep } from '@/components/palindrome/palindromeChoreography';
import type { ChapterProgressController } from '@/experience/chapterProgress';
import { NeuroShieldScene, type NeuroShieldEntry } from './NeuroShieldScene';
import { PalindromeScene } from './PalindromeScene';
import { ROOM_PALETTE } from './palindrome/palette';
import { ReconstructionContours, SCAN_BACKGROUND, ScanVolume } from './neuroshield/ScanVolume';

const ramp = (p: number, from: number, to: number) => smoothstep(rangeProgress(p, from, to));

function heldController(value: number): ChapterProgressController {
  return { progress: { current: value }, subscribe: () => () => {}, dispose: () => {} };
}

export function PalindromeNeuroShieldBridgeScene({
  controller,
  portrait,
}: {
  controller: ChapterProgressController;
  portrait: boolean;
}) {
  const { camera } = useThree();
  const room = useRef<Group>(null);
  const head = useRef<Group>(null);
  const research = useRef<Group>(null);
  const background = useRef<Color>(null);
  const atmosphere = useRef<Fog>(null);
  const control = useMemo(() => heldController(1), []);
  const observation = useMemo(() => heldController(0), []);
  const headProgress = useMemo(() => ({ current: 0 }), []);
  const entry = useMemo<NeuroShieldEntry>(
    () => ({
      lighting: { current: 0 },
      brain: { current: 0 },
      environment: { current: 0 },
      scale: { current: portrait ? 0.036 : 0.045 },
    }),
    [portrait],
  );
  const path = useMemo(
    () => ({
      head: new Vector3(),
      center: new Vector3(),
      target: new Vector3(),
      localCamera: new Vector3(),
      start: new Vector3(portrait ? 0.1 : -0.02, portrait ? 3.15 : 3.13, portrait ? 11.4 : 9.4),
      startTarget: new Vector3(portrait ? 0 : -0.05, 1.94, -0.55),
      brainCenter: new Vector3(0.2, 1.8, -2.2),
      arrivalCamera: new Vector3(0.4, 0.65, portrait ? 14.6 : 13),
      arrivalTarget: new Vector3(portrait ? 0.57 : 0.45, 0, 0),
      warm: new Color(ROOM_PALETTE.ink),
      interior: new Color(SCAN_BACKGROUND),
      curve: new CatmullRomCurve3(Array.from({ length: 6 }, () => new Vector3())),
    }),
    [portrait],
  );

  // This runs before either chapter's material/light callbacks. Every value is
  // reconstructed from document progress, including direct entry and reversal.
  useFrame(() => {
    const p = controller.progress.current;
    if (!head.current || !research.current) return;
    head.current.updateWorldMatrix(true, false);
    path.head.set(0, 0.055, -0.025);
    head.current.localToWorld(path.head);
    const innerScale = portrait ? 0.036 : 0.045;
    const enter = ramp(p, 0.35, 0.71);
    const unfold = ramp(p, 0.35, 0.68);
    const settle = ramp(p, 0.72, 0.985);
    const approach = ramp(p, 0.04, 0.35);
    const [start, anticipation, identify, near, profile, threshold] = path.curve.points;
    start.copy(path.start);
    anticipation.copy(path.start).lerp(path.head, 0.17);
    identify.set(
      path.head.x + (portrait ? -0.32 : -0.65),
      path.head.y + 0.4,
      path.head.z + (portrait ? 2.1 : 2.7),
    );
    near.set(path.head.x - 0.38, path.head.y + 0.14, path.head.z + 0.9);
    profile.set(path.head.x - 0.22, path.head.y + 0.05, path.head.z + 0.5);
    // Stop outside the head. The imaging stack, rather than the solid brain,
    // occupies this first close view.
    threshold.set(path.head.x, path.head.y, path.head.z + 6.4 * innerScale);

    const scale = innerScale * Math.pow(1 / innerScale, unfold);
    entry.scale.current = scale;
    entry.lighting.current = ramp(p, 0.3, 0.69);
    entry.brain.current = ramp(p, 0.77, 0.965);
    entry.environment.current = ramp(p, 0.36, 0.64);
    headProgress.current = 0.49 + 0.25 * ramp(p, 0.3, 0.49);
    path.center.copy(path.head).lerp(path.brainCenter, unfold);
    research.current.scale.setScalar(scale);
    research.current.position.copy(path.center).addScaledVector(path.brainCenter, -scale);
    research.current.position.z -= 14.6 * (1 - unfold) * scale;
    research.current.visible = p > 0.26;

    if (p <= 0.35) {
      path.curve.getPoint(approach, camera.position);
      path.target.copy(path.startTarget).lerp(path.head, ramp(p, 0.03, 0.3));
    } else {
      // Traverse ten sections, then arc slightly sideways while contours build
      // into anatomy. Forward travel ends before the solid lobes appear.
      const lateral = portrait ? -1.6 : -2.5;
      path.localCamera.set(Math.sin(Math.PI * enter) * 0.16, 0.5 * enter, 21 - 12.2 * enter);
      path.localCamera.lerp(path.arrivalCamera, settle);
      path.localCamera.x += lateral * Math.sin(Math.PI * settle);
      camera.position.copy(path.center).addScaledVector(path.localCamera, scale);
      camera.position.z -= 14.6 * (1 - unfold) * scale;
      path.target.copy(path.center).addScaledVector(path.arrivalTarget, scale * settle);
      path.target.z += 14.6 * (1 - enter) * scale - 14.6 * (1 - unfold) * scale;
    }
    camera.lookAt(path.target);
    camera.updateMatrixWorld();
    const perspective = camera as PerspectiveCamera;
    perspective.fov = (portrait ? 51 : 39) + (portrait ? 2 : 1) * settle;
    perspective.near = 0.003 + 0.097 * settle;
    perspective.updateProjectionMatrix();

    if (background.current)
      background.current.lerpColors(path.warm, path.interior, ramp(p, 0.28, 0.76));
    if (atmosphere.current) {
      atmosphere.current.color.copy(background.current ?? path.interior);
      const enclosure = ramp(p, 0.35, 0.5);
      const depth = ramp(p, 0.57, 0.74);
      atmosphere.current.near =
        (80 * (1 - enclosure) + 0.08 * enclosure) * (1 - depth) + 24 * depth;
      atmosphere.current.far = (120 * (1 - enclosure) + 0.5 * enclosure) * (1 - depth) + 62 * depth;
    }
    if (room.current) room.current.visible = p < 0.57;
  }, -1);

  return (
    <>
      <color ref={background} attach="background" args={[ROOM_PALETTE.ink]} />
      <fog ref={atmosphere} attach="fog" args={[ROOM_PALETTE.ink, 80, 120]} />
      <group ref={room}>
        <PalindromeScene
          controller={control}
          portrait={portrait}
          bridgeProgress={controller.progress}
          headAnchorRef={head}
          headInteriorProgress={headProgress}
        />
      </group>
      <group ref={research} visible={false}>
        <NeuroShieldScene controller={observation} portrait={portrait} entry={entry} />
        <ScanVolume progress={controller.progress} scale={entry.scale} />
        <ReconstructionContours progress={controller.progress} />
      </group>
    </>
  );
}

'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { type MutableRefObject, type RefObject, useLayoutEffect, useMemo, useRef } from 'react';
import {
  CatmullRomCurve3,
  Color,
  type Fog,
  type Group,
  Light,
  Mesh,
  type Material,
  type PerspectiveCamera,
  Quaternion,
  Vector3,
} from 'three';
import type { ChapterProgressController } from '@/experience/chapterProgress';
import { NeuroShieldScene, type NeuroShieldEntry } from './NeuroShieldScene';
import { PalindromeScene } from './PalindromeScene';
import { ROOM_PALETTE } from './palindrome/palette';
import { SCAN_BACKGROUND } from './neuroshield/ScanVolume';
import { AnatomicalScanJourney } from './neuroshield/AnatomicalScanJourney';
import { SpinalPassage } from './neuroshield/SpinalPassage';
import {
  SCAN_EXIT,
  SCAN_LENGTH,
  scanCursor,
  scanPath,
  scanRamp as ramp,
  scanSpread,
  spineReveal,
  spineCameraLock,
  spineCanalPoint,
} from './neuroshield/scanJourney';

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
  const journey = useRef<Group>(null);
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
      scale: { current: 1 },
    }),
    [],
  );
  const path = useMemo(
    () => ({
      head: new Vector3(),
      local: new Vector3(),
      target: new Vector3(),
      offset: new Vector3(),
      upperSpine: new Vector3(),
      spineDirection: new Vector3(),
      acquisition: new Vector3(),
      up: new Vector3(),
      forward: new Vector3(0, 0, -1),
      spineRotation: new Quaternion(),
      inverse: new Quaternion(),
      identity: new Quaternion(),
      canal: new Vector3(),
      canalTarget: new Vector3(),
      canalNormal: new Vector3(),
      canalRotation: new Quaternion(),
      start: new Vector3(portrait ? 0.1 : -0.02, portrait ? 3.15 : 3.13, portrait ? 11.4 : 9.4),
      startTarget: new Vector3(portrait ? 0 : -0.05, 1.94, -0.55),
      arrival: new Vector3(0.6, 2.45, portrait ? 12.4 : 10.8),
      arrivalTarget: new Vector3(portrait ? 0.77 : 0.65, 1.8, -2.2),
      exitOrigin: new Vector3(0.6, -0.75, (portrait ? 12.4 : 10.8) + SCAN_LENGTH * SCAN_EXIT),
      roomColor: new Color(ROOM_PALETTE.ink),
      interiorColor: new Color('#080D12'),
      spinalColor: new Color('#16252D'),
      clinical: new Color('#34576A'),
      researchColor: new Color(SCAN_BACKGROUND),
      curve: new CatmullRomCurve3(Array.from({ length: 5 }, () => new Vector3())),
    }),
    [portrait],
  );

  // No accumulated velocity or elapsed time: the existing scroll controller
  // supplies inertia, and every pose is reconstructed from its current value.
  useFrame(() => {
    const p = controller.progress.current;
    if (!head.current || !journey.current) return;
    head.current.updateWorldMatrix(true, false);
    path.head.set(0, 0.055, -0.025);
    head.current.localToWorld(path.head);
    // Derive the descent from the seated figure's own upper-back coordinates,
    // including its lean, rotation and portrait scale. Never aim down the legs.
    path.upperSpine.set(0, 1.2, -0.075);
    head.current.parent?.localToWorld(path.upperSpine);
    path.spineDirection.copy(path.upperSpine).sub(path.head).normalize();
    path.spineRotation.setFromUnitVectors(path.forward, path.spineDirection);
    const initialScale = portrait ? 0.095 : 0.11;
    const magnify = ramp(p, 0.45, 0.64);
    const scale = initialScale * Math.pow(1 / initialScale, magnify);
    const unfold = ramp(p, 0.7, 0.9);
    const arrive = ramp(p, 0.58, 0.94);
    const finish = ramp(p, 0.9, 1);
    journey.current.scale.setScalar(scale);
    journey.current.quaternion.copy(path.spineRotation).slerp(path.identity, unfold);
    journey.current.position.copy(path.head).lerp(path.exitOrigin, arrive);
    journey.current.visible = p > 0.24 && p < 1;

    const lateral = portrait ? -0.62 : -0.82;
    const distance = portrait ? 1.15 : 1.4;
    const [start, context, approach, profile, hold] = path.curve.points;
    start.copy(path.start);
    context.copy(path.start).lerp(path.head, 0.25);
    approach.set(path.head.x + lateral, path.head.y + 0.32, path.head.z + 3.1);
    profile.set(path.head.x + lateral, path.head.y + 0.15, path.head.z + 1.95);
    hold.set(path.head.x + lateral, path.head.y + 0.06, path.head.z + distance);
    if (p <= 0.35) {
      path.curve.getPoint(ramp(p, 0.025, 0.24), camera.position);
      path.target.copy(path.startTarget).lerp(path.head, ramp(p, 0.025, 0.24));
      camera.up.set(0, 1, 0);
    } else {
      if (p < 0.48) {
        // Orbit into the axial stack, then dolly across its first physical layer.
        const orbit = ramp(p, 0.35, 0.43);
        const dolly = ramp(p, 0.43, 0.48);
        const angle = (orbit * Math.PI) / 2;
        path.inverse.copy(journey.current.quaternion).invert();
        path.acquisition.set(lateral, 0.06, distance).applyQuaternion(path.inverse);
        path.local.set(
          (path.acquisition.x / scale) * (1 - orbit) * (1 - dolly),
          ((path.acquisition.y * Math.cos(angle) - 0.12 * orbit) / scale) * (1 - dolly),
          (path.acquisition.z * (1 - orbit) + distance * Math.sin(angle)) / scale,
        );
        path.local.z += (-SCAN_LENGTH * scanCursor(0.48) * scanSpread(0.48) - path.local.z) * dolly;
        scanPath(scanCursor(0.48) + 0.075, scanSpread(0.48), path.target);
        path.target.multiplyScalar(dolly);
        path.up.set(0, 1, 0).applyQuaternion(journey.current.quaternion);
        camera.up.set(0, 1, 0).lerp(path.up, orbit).normalize();
      } else {
        const cursor = scanCursor(p);
        scanPath(cursor, scanSpread(p), path.local);
        scanPath(cursor + 0.075, scanSpread(p), path.target);
        // Enter the center of the openings before the first vertebra, follow
        // the same curved frame as the column, then ease out into research.
        const center = spineCameraLock(p);
        spineCanalPoint(cursor, portrait, path.canal, path.canalRotation, path.canalNormal);
        spineCanalPoint(
          cursor + 0.025,
          portrait,
          path.canalTarget,
          path.canalRotation,
          path.canalNormal,
        );
        path.local.lerp(path.canal, center);
        path.target.lerp(path.canalTarget, center);
        camera.up.set(0, 1, 0).applyQuaternion(journey.current.quaternion);
      }
      path.offset
        .copy(path.local)
        .applyQuaternion(journey.current.quaternion)
        .multiplyScalar(scale);
      camera.position.copy(journey.current.position).add(path.offset);
      path.target
        .applyQuaternion(journey.current.quaternion)
        .multiplyScalar(scale)
        .add(journey.current.position);
      camera.position.lerp(path.arrival, finish);
      path.target.lerp(path.arrivalTarget, finish);
    }
    camera.lookAt(path.target);
    camera.updateMatrixWorld();
    const perspective = camera as PerspectiveCamera;
    perspective.fov = (portrait ? 51 : 39) + (portrait ? 2 : 1) * ramp(p, 0.43, 0.64);
    perspective.near = 0.003 + 0.097 * finish;
    perspective.updateProjectionMatrix();

    headProgress.current = 0.49 + 0.25 * ramp(p, 0.34, 0.45);
    if (room.current) room.current.visible = p < 0.415;
    // Established chapter geometry remains unchanged. Its section frames are
    // reached by the final extracted contours before ownership transfers.
    entry.lighting.current = ramp(p, 0.79, 0.96);
    entry.environment.current = ramp(p, 0.85, 0.99);
    entry.brain.current = ramp(p, 0.95, 1);
    if (research.current) research.current.visible = p > 0.78;
    if (background.current) {
      // Keep head/neck entry enclosed and dark; open light after cervical entry.
      background.current.lerpColors(path.roomColor, path.interiorColor, ramp(p, 0.32, 0.415));
      background.current.lerp(path.spinalColor, spineReveal(p));
      background.current.lerp(path.clinical, ramp(p, 0.72, 0.85));
      background.current.lerp(path.researchColor, ramp(p, 0.85, 1));
    }
    if (atmosphere.current) {
      atmosphere.current.color.copy(background.current ?? path.clinical);
      atmosphere.current.near = 80 * (1 - finish) + 24 * finish;
      atmosphere.current.far = 120 * (1 - finish) + 62 * finish;
    }
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
      <PhysicalRetirement room={room} progress={controller.progress} />
      <group ref={journey} visible={false}>
        <AnatomicalScanJourney progress={controller.progress} frame={journey} portrait={portrait} />
        <SpinalPassage progress={controller.progress} portrait={portrait} />
      </group>
      <group ref={research} visible={false}>
        <NeuroShieldScene controller={observation} portrait={portrait} entry={entry} />
      </group>
    </>
  );
}

function PhysicalRetirement({
  room,
  progress,
}: {
  room: RefObject<Group | null>;
  progress: MutableRefObject<number>;
}) {
  const materials = useRef<
    {
      material: Material;
      opacity: number;
      transparent: boolean;
      depthWrite: boolean;
      head: boolean;
      role: 'lamp' | 'shelf' | 'props' | 'room';
    }[]
  >([]);
  const lampLights = useRef<{ light: Light; intensity: number }[]>([]);
  const shadows = useRef<{ mesh: Mesh; castShadow: boolean; role: string }[]>([]);
  useLayoutEffect(() => {
    const seen = new Set<Material>();
    room.current?.traverse((object) => {
      let role: 'lamp' | 'shelf' | 'props' | 'room' = 'room';
      for (let parent = object.parent; parent; parent = parent.parent) {
        if (parent.name === 'Palindrome_TransitionLamp') {
          role = 'lamp';
          break;
        }
        if (parent.name === 'Palindrome_TransitionShelf') role = 'shelf';
        if (parent.name === 'Palindrome_TransitionProps' && role === 'room') role = 'props';
      }
      if (object instanceof Light && role === 'lamp')
        lampLights.current.push({ light: object, intensity: object.intensity });
      if (!(object instanceof Mesh)) return;
      shadows.current.push({ mesh: object, castShadow: object.castShadow, role });
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        if (seen.has(material)) continue;
        seen.add(material);
        // Head and information opacities are authored by their existing callbacks.
        const head = object.parent?.name === 'Palindrome_Head';
        if (material.type === 'MeshBasicMaterial' && role === 'room') continue;
        materials.current.push({
          material,
          opacity: material.opacity,
          transparent: material.transparent,
          depthWrite: material.depthWrite,
          head,
          role,
        });
      }
    });
    return () => {
      for (const item of materials.current) {
        item.material.opacity = item.opacity;
        item.material.transparent = item.transparent;
        item.material.depthWrite = item.depthWrite;
      }
      for (const item of lampLights.current) item.light.intensity = item.intensity;
      for (const item of shadows.current) item.mesh.castShadow = item.castShadow;
      materials.current = [];
      lampLights.current = [];
      shadows.current = [];
    };
  }, [room]);
  useFrame(() => {
    const p = progress.current;
    // Complete the room/body dissolve at cervical entry, before deeper
    // magnification can expose the torso, chair, lap or legs from inside.
    const fade = 1 - ramp(p, 0.32, 0.415);
    const lamp = 1 - ramp(p, 0.12, 0.265);
    const shelf = 1 - 0.88 * ramp(p, 0.23, 0.415);
    const props = 1 - 0.8 * ramp(p, 0.31, 0.46);
    for (const item of materials.current) {
      const hierarchy =
        item.role === 'lamp'
          ? lamp
          : item.role === 'shelf'
            ? shelf
            : item.role === 'props'
              ? props
              : 1;
      const visibility = fade * hierarchy;
      const opacity = item.head ? item.material.opacity : item.opacity;
      item.material.opacity = opacity * visibility;
      item.material.transparent = item.transparent || visibility < 1;
      if (!item.head) item.material.depthWrite = item.depthWrite && visibility > 0.98;
    }
    for (const item of lampLights.current) item.light.intensity = item.intensity * lamp * fade;
    for (const item of shadows.current) {
      // Head shadow retirement belongs to SeatedFigure's anatomy dissolve.
      if (item.mesh.parent?.name === 'Palindrome_Head') continue;
      const hierarchy =
        item.role === 'lamp'
          ? lamp
          : item.role === 'shelf'
            ? shelf
            : item.role === 'props'
              ? props
              : 1;
      item.mesh.castShadow = item.castShadow && fade * hierarchy > 0.98;
    }
  });
  return null;
}

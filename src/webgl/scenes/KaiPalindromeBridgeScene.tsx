'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { type MutableRefObject, useMemo, useRef } from 'react';
import {
  type AmbientLight,
  Color,
  type DirectionalLight,
  type Group,
  type HemisphereLight,
  type Mesh,
  type PerspectiveCamera,
  type PointLight,
  Vector3,
} from 'three';
import type { ChapterProgressController } from '@/experience/chapterProgress';
import { ArenaLighting } from './kaiforge/ArenaLighting';
import {
  GROUND_BOXES,
  OUTER_DESKTOP_BOXES,
  OUTER_PORTRAIT_BOXES,
  WALL_BOXES,
} from './kaiforge/architectureLayout';
import { sampleBallPosition } from './kaiforge/ballSequence';
import { Equipment } from './kaiforge/Equipment';
import type { Box } from './kaiforge/geometry';
import { KaiForgeMaterials, useKaiForgeMaterials } from './kaiforge/Materials';
import { ProceduralRobot } from './kaiforge/robot/ProceduralRobot';
import { CAMERAS, PALETTE, sampleCamera } from './kaiforge/staging';
import { TrainingProps } from './kaiforge/TrainingProps';
import { WallDesign } from './kaiforge/WallDesign';
import { DomesticRoom } from './palindrome/DomesticRoom';
import { InformationField } from './palindrome/InformationField';
import { ROOM_PALETTE } from './palindrome/palette';

type Triple = readonly [number, number, number];
type Slab = {
  from: Triple;
  size: Triple;
  to: Triple;
  finalSize: Triple;
  start: string;
  end: string;
};

function slab(box: Box, to: Triple, finalSize: Triple, start: string, end: string): Slab {
  return { from: box[0], size: box[1], to, finalSize, start, end };
}

function createSlabs(portrait: boolean): Slab[] {
  const vanish: Triple = [0.001, 0.001, 0.001];
  const outer = portrait ? OUTER_PORTRAIT_BOXES : OUTER_DESKTOP_BOXES;
  return [
    slab(GROUND_BOXES[0], [0, -0.09, -0.1], [9, 0.18, 7.4], PALETTE.courtFloor, ROOM_PALETTE.floor),
    slab(WALL_BOXES[0], [0, 2.65, -2.8], [9, 5.3, 0.18], '#696e6a', ROOM_PALETTE.plaster),
    slab(WALL_BOXES[1], [-4.15, 2.65, -0.45], [0.16, 5.3, 4.6], '#696e6a', ROOM_PALETTE.parchment),
    slab(WALL_BOXES[2], [4.2, 2.65, -2.6], vanish, '#696e6a', ROOM_PALETTE.plaster),
    ...outer.slice(0, 2).map((box) => slab(box, box[0], vanish, '#666c68', ROOM_PALETTE.charcoal)),
    slab(outer[2], [0, 0.12, -2.68], [8.3, 0.24, 0.07], '#666c68', ROOM_PALETTE.timber),
  ];
}

function ramp(a: number, b: number, p: number) {
  const t = Math.min(1, Math.max(0, (p - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

function ArchitecturalMorph({
  progress,
  portrait,
}: {
  progress: MutableRefObject<number>;
  portrait: boolean;
}) {
  const meshes = useRef<(Mesh | null)[]>([]);
  const slabs = useMemo(() => createSlabs(portrait), [portrait]);
  const colors = useMemo(
    () => slabs.map((item) => [new Color(item.start), new Color(item.end)] as const),
    [slabs],
  );
  useFrame(() => {
    const p = ramp(0.32, 0.82, progress.current);
    slabs.forEach((slab, index) => {
      const mesh = meshes.current[index];
      if (!mesh) return;
      const portraitX = portrait ? 0.76 : 1;
      mesh.position.set(
        slab.from[0] + (slab.to[0] * portraitX - slab.from[0]) * p,
        slab.from[1] + (slab.to[1] - slab.from[1]) * p,
        slab.from[2] + (slab.to[2] - slab.from[2]) * p,
      );
      mesh.scale.set(
        slab.size[0] + (slab.finalSize[0] * portraitX - slab.size[0]) * p,
        slab.size[1] + (slab.finalSize[1] - slab.size[1]) * p,
        slab.size[2] + (slab.finalSize[2] - slab.size[2]) * p,
      );
      const material = mesh.material;
      if ('color' in material && material.color instanceof Color) {
        material.color.lerpColors(colors[index][0], colors[index][1], p);
      }
    });
  });
  return (
    <group name="KF_to_PL_Architecture">
      {slabs.map((slab, index) => (
        <mesh
          key={slab.from.join(':')}
          ref={(node) => {
            meshes.current[index] = node;
          }}
          position={[...slab.from]}
          scale={[...slab.size]}
          receiveShadow
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={slab.start} roughness={0.94} />
        </mesh>
      ))}
    </group>
  );
}

function TransitionWorld({
  controller,
  portrait,
}: {
  controller: ChapterProgressController;
  portrait: boolean;
}) {
  const progress = controller.progress;
  const { camera } = useThree();
  const materials = useKaiForgeMaterials();
  const release = useMemo(() => ({ current: 1 }), []);
  const ordinary = useMemo(() => ({ current: 0 }), []);
  const robot = useRef<Group>(null);
  const ball = useRef<Mesh>(null);
  const information = useRef<Group>(null);
  const ambient = useRef<AmbientLight>(null);
  const domesticAmbient = useRef<HemisphereLight>(null);
  const domesticKey = useRef<DirectionalLight>(null);
  const domesticFill = useRef<PointLight>(null);
  const start = useMemo(() => new Vector3(), []);
  const finish = useMemo(() => new Vector3(), []);
  const startTarget = useMemo(() => new Vector3(), []);
  const finishTarget = useMemo(() => new Vector3(), []);
  const lookTarget = useMemo(() => new Vector3(), []);
  const ballStart = useMemo(() => sampleBallPosition(1, new Vector3()), []);
  const deskDetail = useMemo(() => new Vector3(portrait ? -0.9 : -1.18, 1.16, -0.1), [portrait]);

  useFrame(() => {
    const p = progress.current;
    const travel = ramp(0.18, 0.91, p);
    sampleCamera(portrait ? CAMERAS.portrait : CAMERAS.desktop, 1, start);
    sampleCamera(portrait ? CAMERAS.portraitTargets : CAMERAS.desktopTargets, 1, startTarget);
    finish.set(portrait ? 0.1 : -0.2, portrait ? 3.15 : 3.05, portrait ? 11.4 : 9.6);
    finishTarget.set(portrait ? 0 : -0.05, 1.9, -0.55);
    // The first move advances into the court; reforming slabs then carry the
    // viewer into the wider, intimate domestic frame.
    camera.position.copy(start).lerp(finish, travel);
    camera.position.z -= Math.sin(Math.PI * travel) * (portrait ? 0.72 : 2.35);
    lookTarget.copy(startTarget).lerp(finishTarget, travel);
    const perspective = camera as PerspectiveCamera;
    const fov = (portrait ? 46 : 39) + (portrait ? 5 * travel : 0);
    if (Math.abs(perspective.fov - fov) > 0.001) {
      perspective.fov = fov;
      perspective.updateProjectionMatrix();
    }
    camera.lookAt(lookTarget);
    camera.updateMatrixWorld();

    const retreat = ramp(0.22, 0.63, p);
    if (robot.current) {
      robot.current.position.set(-0.35 * retreat, -0.85 * retreat, -3.8 * retreat);
      robot.current.scale.setScalar(Math.max(0.001, 1 - retreat));
      robot.current.visible = retreat < 0.999;
    }
    if (ball.current) {
      const move = ramp(0.44, 0.91, p);
      ball.current.position.copy(ballStart).lerp(deskDetail, move);
      ball.current.position.y += Math.sin(Math.PI * move) * 0.28;
    }
    const roomLight = ramp(0.42, 0.88, p);
    if (ambient.current) ambient.current.intensity = 0.24 * roomLight;
    if (domesticAmbient.current) domesticAmbient.current.intensity = 0.58 * roomLight;
    if (domesticKey.current) domesticKey.current.intensity = 1.9 * roomLight;
    if (domesticFill.current) domesticFill.current.intensity = 1.45 * roomLight;
    if (information.current) {
      const reveal = ramp(0.91, 1, p);
      information.current.scale.setScalar(Math.max(0.001, reveal));
      information.current.visible = reveal > 0.001;
    }
  });

  return (
    <>
      <color attach="background" args={[ROOM_PALETTE.ink]} />
      <ArenaLighting portrait={portrait} progress={release} bridgeProgress={progress} />
      <ambientLight ref={ambient} color="#F3F0E9" intensity={0} />
      <hemisphereLight ref={domesticAmbient} args={['#E5EBE7', '#686E64', 0]} />
      <directionalLight
        ref={domesticKey}
        position={[-3.8, 4.2, 1.5]}
        color={ROOM_PALETTE.parchment}
        intensity={0}
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
        ref={domesticFill}
        position={[1.3, 1.8, 1.1]}
        color={ROOM_PALETTE.parchment}
        intensity={0}
        distance={4.6}
        decay={2}
      />
      <ArchitecturalMorph progress={progress} portrait={portrait} />
      <WallDesign bridgeProgress={progress} />
      <Equipment bridgeProgress={progress} bridgePortrait={portrait} />
      <TrainingProps bridgeProgress={progress} />
      <group ref={robot}>
        <ProceduralRobot progress={release} />
      </group>
      <mesh ref={ball} position={ballStart}>
        <sphereGeometry args={[0.02, 16, 12]} />
        <primitive attach="material" object={materials.ball} />
      </mesh>
      <DomesticRoom
        portrait={portrait}
        transitionProgress={progress}
        bridgeShell={false}
        bridgeDesk={false}
        bridgeBall={false}
      />
      <group ref={information} scale={0.001} visible={false}>
        <InformationField progress={ordinary} portrait={portrait} />
      </group>
    </>
  );
}

export function KaiPalindromeBridgeScene(props: {
  controller: ChapterProgressController;
  portrait: boolean;
}) {
  return (
    <KaiForgeMaterials>
      <TransitionWorld {...props} />
    </KaiForgeMaterials>
  );
}

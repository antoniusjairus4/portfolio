'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { CatmullRomCurve3, type Group, MathUtils, type Mesh, TubeGeometry, Vector3 } from 'three';
import {
  getImpactProgress,
  getUnderstandingProgress,
  rangeProgress,
  smoothstep,
} from '@/components/kaiforge/kaiforgeChoreography';
import type { ChapterProgressController } from '@/experience/chapterProgress';

interface KaiForgeSceneProps {
  controller: ChapterProgressController;
  portrait: boolean;
}

const INK = '#0b0908';
const WARM_WHITE = '#e9dfce';
const MUTED_METAL = '#6f6a62';
const CRIMSON = '#a52b24';

function lerpVector(points: Vector3[], progress: number) {
  const scaled = Math.min(points.length - 1, Math.max(0, progress * (points.length - 1)));
  const index = Math.min(points.length - 2, Math.floor(scaled));
  return points[index].clone().lerp(points[index + 1], smoothstep(scaled - index));
}

function PlayerBlockout({ progress }: { progress: React.MutableRefObject<number> }) {
  const player = useRef<Group>(null);
  const torso = useRef<Mesh>(null);
  const hittingArm = useRef<Group>(null);
  const paddle = useRef<Group>(null);

  useFrame(() => {
    const impact = getImpactProgress(progress.current);
    if (!player.current || !torso.current || !hittingArm.current || !paddle.current) return;
    player.current.rotation.y = -0.3 + impact * 0.34;
    torso.current.rotation.z = -0.12 + impact * 0.18;
    hittingArm.current.rotation.z = -0.78 + impact * 1.18;
    hittingArm.current.rotation.x = -0.25 - impact * 0.22;
    paddle.current.rotation.x = 0.35 - impact * 0.55;
  });

  return (
    <group ref={player} position={[-2.85, 0.05, 1.12]} rotation={[0.08, -0.3, 0]}>
      <mesh position={[0, 2.62, 0]} castShadow>
        <sphereGeometry args={[0.28, 16, 12]} />
        <meshStandardMaterial color={WARM_WHITE} roughness={0.9} />
      </mesh>
      <mesh ref={torso} position={[0, 1.85, 0]} rotation={[0.08, 0, -0.12]} castShadow>
        <capsuleGeometry args={[0.38, 0.9, 5, 10]} />
        <meshStandardMaterial color="#858078" roughness={0.82} />
      </mesh>
      <group position={[-0.25, 1.28, 0]} rotation={[0.08, 0, 0.2]}>
        <mesh position={[0, -0.6, 0]} castShadow>
          <capsuleGeometry args={[0.15, 0.85, 4, 8]} />
          <meshStandardMaterial color="#3b3936" roughness={0.9} />
        </mesh>
        <mesh position={[-0.18, -1.42, 0.05]} rotation={[0, 0, 0.2]} castShadow>
          <capsuleGeometry args={[0.14, 0.82, 4, 8]} />
          <meshStandardMaterial color="#3b3936" roughness={0.9} />
        </mesh>
      </group>
      <group position={[0.28, 1.25, 0]} rotation={[0.08, 0, -0.35]}>
        <mesh position={[0, -0.58, 0]} castShadow>
          <capsuleGeometry args={[0.15, 0.84, 4, 8]} />
          <meshStandardMaterial color="#46433f" roughness={0.9} />
        </mesh>
        <mesh position={[0.2, -1.38, 0.18]} rotation={[0, 0, -0.24]} castShadow>
          <capsuleGeometry args={[0.14, 0.78, 4, 8]} />
          <meshStandardMaterial color="#46433f" roughness={0.9} />
        </mesh>
      </group>
      <group ref={hittingArm} position={[0.32, 2.15, 0]} rotation={[-0.25, 0.2, -0.78]}>
        <mesh position={[0.55, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <capsuleGeometry args={[0.11, 0.78, 4, 8]} />
          <meshStandardMaterial color={WARM_WHITE} roughness={0.9} />
        </mesh>
        <group ref={paddle} position={[1.12, 0, 0]} rotation={[0.35, 0.15, Math.PI / 2]}>
          <mesh position={[-0.18, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.055, 0.065, 0.4, 10]} />
            <meshStandardMaterial color="#6c4630" roughness={0.9} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.07, 20]} />
            <meshStandardMaterial color="#24211f" roughness={0.72} />
          </mesh>
        </group>
      </group>
      <group position={[-0.35, 2.05, 0.02]} rotation={[0.1, 0, 0.65]}>
        <mesh position={[-0.45, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <capsuleGeometry args={[0.1, 0.62, 4, 8]} />
          <meshStandardMaterial color={WARM_WHITE} roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

function Table() {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 1.08, 0]} receiveShadow castShadow>
        <boxGeometry args={[5.5, 0.12, 3.05]} />
        <meshStandardMaterial color="#383a3a" roughness={0.75} metalness={0.08} />
      </mesh>
      <mesh position={[0, 1.15, 0]}>
        <boxGeometry args={[0.025, 0.014, 3.07]} />
        <meshBasicMaterial color={WARM_WHITE} />
      </mesh>
      <mesh position={[0, 1.55, 0]}>
        <boxGeometry args={[0.035, 0.8, 3.16]} />
        <meshStandardMaterial color="#b8b0a3" transparent opacity={0.72} wireframe />
      </mesh>
      {[-2.1, 2.1].flatMap((x) =>
        [-1.05, 1.05].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 0.48, z]}>
            <boxGeometry args={[0.12, 1.08, 0.12]} />
            <meshStandardMaterial color="#262422" roughness={0.8} />
          </mesh>
        )),
      )}
    </group>
  );
}

function Trajectory({ progress }: { progress: React.MutableRefObject<number> }) {
  const main = useRef<Mesh>(null);
  const echoes = useRef<Group>(null);
  const ball = useRef<Mesh>(null);
  const impactMarker = useRef<Mesh>(null);
  const curve = useMemo(
    () =>
      new CatmullRomCurve3([
        new Vector3(-1.05, 2.18, 0.48),
        new Vector3(-0.2, 2.55, 0.28),
        new Vector3(1.05, 2.25, -0.04),
        new Vector3(1.75, 1.16, -0.34),
        new Vector3(2.7, 1.75, -0.65),
      ]),
    [],
  );
  const geometry = useMemo(() => new TubeGeometry(curve, 80, 0.018, 6, false), [curve]);

  useLayoutEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(() => {
    const p = progress.current;
    const impact = getImpactProgress(p);
    const understanding = getUnderstandingProgress(p);
    if (main.current) {
      const count = geometry.index?.count ?? 0;
      geometry.setDrawRange(0, Math.round(count * Math.max(0.02, impact)));
      main.current.visible = p > 0.26;
    }
    if (ball.current) {
      ball.current.position.copy(curve.getPoint(Math.min(0.98, impact * 0.72)));
      const pulse = 1 + Math.sin(Math.min(1, impact) * Math.PI) * 0.35;
      ball.current.scale.setScalar(pulse);
    }
    if (impactMarker.current) {
      impactMarker.current.visible = p > 0.405 && p < 0.57;
      impactMarker.current.scale.setScalar(
        0.7 + Math.sin(rangeProgress(p, 0.4, 0.55) * Math.PI) * 1.6,
      );
    }
    if (echoes.current) {
      echoes.current.visible = understanding > 0.02;
      echoes.current.children.forEach((child, index) => {
        const reveal = MathUtils.clamp(understanding * 1.5 - index * 0.18, 0, 1);
        child.scale.setScalar(reveal);
      });
    }
  });

  return (
    <group>
      <mesh ref={main} geometry={geometry}>
        <meshBasicMaterial color="#cfc5b4" transparent opacity={0.78} />
      </mesh>
      <mesh ref={ball}>
        <sphereGeometry args={[0.095, 16, 12]} />
        <meshStandardMaterial color={WARM_WHITE} emissive="#5a5146" emissiveIntensity={0.4} />
      </mesh>
      <mesh ref={impactMarker} position={[-1.06, 2.18, 0.48]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.38, 0.025, 8, 40]} />
        <meshBasicMaterial color={CRIMSON} transparent opacity={0.9} />
      </mesh>
      <group ref={echoes}>
        {[-0.55, 0.55, 1.08].map((offset, index) => (
          <mesh key={offset} geometry={geometry} position={[0, index * 0.08, offset]} scale={0}>
            <meshBasicMaterial color={MUTED_METAL} transparent opacity={0.28 - index * 0.05} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function SpatialFrames({ progress }: { progress: React.MutableRefObject<number> }) {
  const group = useRef<Group>(null);
  useFrame(() => {
    if (!group.current) return;
    const understanding = getUnderstandingProgress(progress.current);
    group.current.position.z = -2 + understanding * 1.4;
    group.current.children.forEach((child, index) => {
      child.visible = progress.current > 0.06;
      child.rotation.z = (index - 2) * 0.025 * understanding;
    });
  });
  return (
    <group ref={group} position={[0, 2.1, -2]}>
      {[-6, -3, 0, 3, 6].map((z, index) => (
        <mesh key={z} position={[0, 0, z]}>
          <torusGeometry args={[4.5 + index * 0.22, 0.018, 4, 4]} />
          <meshBasicMaterial color="#564f47" transparent opacity={0.22} />
        </mesh>
      ))}
    </group>
  );
}

export function KaiForgeScene({ controller, portrait }: KaiForgeSceneProps) {
  const { camera } = useThree();
  const target = useMemo(() => new Vector3(), []);
  const desktopCamera = useMemo(
    () => [
      new Vector3(0, 4.25, 10.8),
      new Vector3(-2.7, 3.15, 7.4),
      new Vector3(-2.25, 2.35, 5.4),
      new Vector3(3.8, 4.7, 7.3),
      new Vector3(0, 6.2, 10.2),
    ],
    [],
  );
  const portraitCamera = useMemo(
    () => [
      new Vector3(0.1, 5.7, 12.8),
      new Vector3(-1.7, 4.4, 10.6),
      new Vector3(-1.45, 3.7, 8.9),
      new Vector3(2.2, 6.2, 11.4),
      new Vector3(0, 7.2, 13.2),
    ],
    [],
  );

  useFrame(() => {
    const p = controller.progress.current;
    camera.position.copy(lerpVector(portrait ? portraitCamera : desktopCamera, p));
    const impact = getImpactProgress(p);
    const understanding = getUnderstandingProgress(p);
    target.set(
      -0.3 + impact * 0.7 - understanding * 0.1,
      1.38 + impact * 0.45,
      understanding * -0.22,
    );
    camera.lookAt(target);
    camera.updateMatrixWorld();
  });

  return (
    <>
      <color attach="background" args={[INK]} />
      <ambientLight intensity={0.42} />
      <directionalLight
        position={[-4, 8, 6]}
        intensity={2.1}
        color="#f1dfc1"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[5, 4, -3]} intensity={0.9} color="#8d4035" />
      <SpatialFrames progress={controller.progress} />
      <Table />
      <PlayerBlockout progress={controller.progress} />
      <Trajectory progress={controller.progress} />
      <mesh position={[0, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#100e0d" roughness={1} />
      </mesh>
    </>
  );
}

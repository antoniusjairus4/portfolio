'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { type Group, MathUtils, type Mesh, type PerspectiveCamera, Vector3 } from 'three';
import {
  getControlProgress,
  getFragmentationProgress,
  getOrganizationProgress,
  getRelationshipProgress,
} from '@/components/palindrome/palindromeChoreography';
import type { ChapterProgressController } from '@/experience/chapterProgress';

interface PalindromeSceneProps {
  controller: ChapterProgressController;
  portrait: boolean;
}

const INK = '#0b0908';
const CHARCOAL = '#24211e';
const PARCHMENT = '#e8ddca';
const PAPER = '#c9bda9';
const MUTED = '#746c62';
const CRIMSON = '#7d201d';

const DESKTOP_ORDINARY = [
  [-1.95, 1.32, -0.12],
  [-1.45, 1.42, -0.24],
  [-0.94, 1.34, -0.08],
  [-1.72, 2.42, -0.66],
  [-1.12, 2.5, -0.7],
  [1.72, 1.12, -0.5],
  [2.08, 1.22, -0.56],
  [2.42, 1.1, -0.48],
  [1.78, 2.72, -0.88],
] as const;

const DESKTOP_FRAGMENTED = [
  [-2.8, 3.58, 0.25],
  [-1.62, 2.84, 0.72],
  [-0.35, 3.34, 0.2],
  [0.8, 2.54, 0.92],
  [2.12, 3.22, 0.22],
  [2.86, 2.04, 0.62],
  [1.84, 0.88, 0.42],
  [0.18, 1.1, 0.96],
  [-2.14, 1.28, 0.58],
] as const;

const DESKTOP_ORGANIZED = [
  [-2.55, 3.22, 0.05],
  [-1.78, 3.22, 0.05],
  [-1.01, 3.22, 0.05],
  [0.05, 2.25, 0.32],
  [0.82, 2.25, 0.32],
  [1.59, 2.25, 0.32],
  [2.36, 2.25, 0.32],
  [1.2, 1.12, -0.18],
  [2.08, 1.12, -0.18],
] as const;

const DESKTOP_CONTROL = [
  [-2.32, 3.08, -0.28],
  [-1.66, 3.08, -0.28],
  [-1, 3.08, -0.28],
  [0.42, 2.12, -0.15],
  [1.08, 2.12, -0.15],
  [1.74, 2.12, -0.15],
  [2.4, 2.12, -0.15],
  [1.42, 1.17, -0.5],
  [2.08, 1.17, -0.5],
] as const;

function Room() {
  return (
    <group>
      <mesh position={[0, -0.08, -0.2]} receiveShadow>
        <boxGeometry args={[10, 0.16, 8]} />
        <meshStandardMaterial color="#171412" roughness={0.94} />
      </mesh>
      <mesh position={[0, 3.4, -2.72]} receiveShadow>
        <boxGeometry args={[10, 7, 0.16]} />
        <meshStandardMaterial color="#28231f" roughness={1} />
      </mesh>
      <mesh position={[-4.35, 3.1, -0.1]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[5.4, 6.4, 0.12]} />
        <meshStandardMaterial color="#1d1a18" roughness={0.96} />
      </mesh>
      <group position={[-1.45, 0.72, -0.65]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3.6, 0.13, 1.25]} />
          <meshStandardMaterial color="#51483f" roughness={0.88} />
        </mesh>
        {[-1.48, 1.48].flatMap((x) =>
          [-0.42, 0.42].map((z) => (
            <mesh key={`${x}-${z}`} position={[x, -0.55, z]} castShadow>
              <boxGeometry args={[0.1, 1.1, 0.1]} />
              <meshStandardMaterial color={CHARCOAL} roughness={0.9} />
            </mesh>
          )),
        )}
      </group>
      <group position={[2.08, 1.45, -2.42]}>
        {[0, 1, 2].map((index) => (
          <mesh key={index} position={[0, index * 0.86, 0]}>
            <boxGeometry args={[2.2, 0.1, 0.5]} />
            <meshStandardMaterial color="#4a423b" roughness={0.9} />
          </mesh>
        ))}
        {[-0.82, 0.82].map((x) => (
          <mesh key={x} position={[x, 0.85, 0]}>
            <boxGeometry args={[0.09, 2.65, 0.45]} />
            <meshStandardMaterial color={CHARCOAL} roughness={0.92} />
          </mesh>
        ))}
      </group>
      <mesh position={[-2.5, 1.1, -1.18]} castShadow>
        <cylinderGeometry args={[0.18, 0.21, 0.52, 12]} />
        <meshStandardMaterial color="#7e7467" roughness={0.86} />
      </mesh>
      <mesh position={[-0.35, 1.05, -0.65]} castShadow>
        <boxGeometry args={[0.54, 0.62, 0.48]} />
        <meshStandardMaterial color="#39342f" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Person() {
  return (
    <group position={[0.52, 0.04, -0.72]} rotation={[0, -0.15, 0]}>
      <mesh position={[0, 2.52, 0]} castShadow>
        <sphereGeometry args={[0.27, 16, 12]} />
        <meshStandardMaterial color="#b6a48e" roughness={0.92} />
      </mesh>
      <mesh position={[0, 1.72, 0]} rotation={[0, 0, -0.04]} castShadow>
        <capsuleGeometry args={[0.38, 0.9, 5, 10]} />
        <meshStandardMaterial color="#77716a" roughness={0.94} />
      </mesh>
      <group position={[-0.17, 1.04, 0]} rotation={[0, 0, 0.16]}>
        <mesh position={[0, -0.48, 0]} castShadow>
          <capsuleGeometry args={[0.14, 0.65, 4, 8]} />
          <meshStandardMaterial color="#312e2b" roughness={0.95} />
        </mesh>
        <mesh position={[-0.1, -1.12, 0]} rotation={[0, 0, 0.12]} castShadow>
          <capsuleGeometry args={[0.13, 0.58, 4, 8]} />
          <meshStandardMaterial color="#312e2b" roughness={0.95} />
        </mesh>
      </group>
      <group position={[0.22, 1.04, 0]} rotation={[0, 0, -0.18]}>
        <mesh position={[0, -0.48, 0]} castShadow>
          <capsuleGeometry args={[0.14, 0.65, 4, 8]} />
          <meshStandardMaterial color="#393531" roughness={0.95} />
        </mesh>
        <mesh position={[0.1, -1.12, 0]} rotation={[0, 0, -0.12]} castShadow>
          <capsuleGeometry args={[0.13, 0.58, 4, 8]} />
          <meshStandardMaterial color="#393531" roughness={0.95} />
        </mesh>
      </group>
      <group position={[-0.32, 1.86, 0]} rotation={[0, 0, 0.5]}>
        <mesh position={[-0.38, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <capsuleGeometry args={[0.1, 0.55, 4, 8]} />
          <meshStandardMaterial color="#b6a48e" roughness={0.92} />
        </mesh>
      </group>
      <group position={[0.32, 1.86, 0]} rotation={[0, 0, -0.5]}>
        <mesh position={[0.38, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <capsuleGeometry args={[0.1, 0.55, 4, 8]} />
          <meshStandardMaterial color="#b6a48e" roughness={0.92} />
        </mesh>
      </group>
    </group>
  );
}

function InformationField({
  progress,
  portrait,
}: {
  progress: React.MutableRefObject<number>;
  portrait: boolean;
}) {
  const fragments = useRef<(Group | null)[]>([]);
  const relationBars = useRef<(Mesh | null)[]>([]);
  const total = useRef<Group>(null);
  const itemGroup = useRef<Group>(null);
  const bridge = useRef<Group>(null);

  useFrame(() => {
    const p = progress.current;
    const fragmentation = getFragmentationProgress(p);
    const relationships = getRelationshipProgress(p);
    const organization = getOrganizationProgress(p);
    const control = getControlProgress(p);

    fragments.current.forEach((fragment, index) => {
      if (!fragment) return;
      const ordinary = DESKTOP_ORDINARY[index];
      const scattered = DESKTOP_FRAGMENTED[index];
      const organized = DESKTOP_ORGANIZED[index];
      const calm = DESKTOP_CONTROL[index];
      let x = MathUtils.lerp(ordinary[0], scattered[0], fragmentation);
      let y = MathUtils.lerp(ordinary[1], scattered[1], fragmentation);
      let z = MathUtils.lerp(ordinary[2], scattered[2], fragmentation);
      x = MathUtils.lerp(x, organized[0], organization);
      y = MathUtils.lerp(y, organized[1], organization);
      z = MathUtils.lerp(z, organized[2], organization);
      x = MathUtils.lerp(x, calm[0], control);
      y = MathUtils.lerp(y, calm[1], control);
      z = MathUtils.lerp(z, calm[2], control);
      fragment.position.set(portrait ? x * 0.72 : x, y, z);
      fragment.rotation.z = MathUtils.lerp((index - 4) * 0.09 * fragmentation, 0, organization);
      fragment.rotation.y = MathUtils.lerp(((index % 3) - 1) * 0.22 * fragmentation, 0, control);
    });

    relationBars.current.forEach((bar, index) => {
      if (!bar) return;
      bar.visible = relationships > 0.01;
      bar.scale.x = Math.max(0.001, relationships * (1 - control * 0.18));
      bar.position.z = 0.02 + index * 0.01;
    });
    if (total.current) {
      total.current.position.x = MathUtils.lerp(
        portrait ? 0 : 0.1,
        portrait ? -0.55 : -0.22,
        relationships,
      );
      total.current.scale.setScalar(1 - relationships * 0.16);
    }
    if (itemGroup.current) {
      itemGroup.current.visible = relationships > 0.02;
      itemGroup.current.scale.setScalar(Math.max(0.001, relationships));
      itemGroup.current.position.x = MathUtils.lerp(0.2, portrait ? 0.45 : 1.18, relationships);
    }
    if (bridge.current) {
      bridge.current.visible = p < 0.3;
      bridge.current.position.x = MathUtils.lerp(2.9, 1.95, fragmentation);
      bridge.current.scale.x = Math.max(0.001, 1 - fragmentation * 0.62);
    }
  });

  return (
    <group>
      {DESKTOP_ORDINARY.map((ordinaryPosition, index) => (
        <group
          key={ordinaryPosition.join(':')}
          ref={(node) => {
            fragments.current[index] = node;
          }}
        >
          <mesh castShadow>
            <boxGeometry args={[index % 3 === 0 ? 0.58 : 0.46, 0.34, 0.035]} />
            <meshStandardMaterial color={index < 3 ? PARCHMENT : PAPER} roughness={0.86} />
          </mesh>
          <mesh position={[-0.08, 0.04, 0.022]}>
            <boxGeometry args={[0.22, 0.025, 0.008]} />
            <meshBasicMaterial color={index === 4 ? CRIMSON : MUTED} />
          </mesh>
        </group>
      ))}

      <group ref={total} position={[0.1, 3.72, 0.18]}>
        <mesh castShadow>
          <boxGeometry args={[1.72, 0.72, 0.09]} />
          <meshStandardMaterial color="#a99d8b" roughness={0.82} />
        </mesh>
        {[0.28, 0, -0.28].map((y) => (
          <mesh key={y} position={[-0.32, y, 0.052]}>
            <boxGeometry args={[0.72, 0.035, 0.012]} />
            <meshBasicMaterial color={CHARCOAL} />
          </mesh>
        ))}
      </group>

      <group ref={itemGroup} position={[0.2, 3.72, 0.24]} scale={0.001}>
        {[-0.54, 0, 0.54].map((x, index) => (
          <mesh key={x} position={[x, (index - 1) * 0.04, 0]} castShadow>
            <boxGeometry args={[0.42, 0.52, 0.07]} />
            <meshStandardMaterial color={index === 1 ? PARCHMENT : PAPER} roughness={0.86} />
          </mesh>
        ))}
      </group>

      {[-1.6, -0.72, 0.16, 1.04].map((x, index) => (
        <mesh
          key={x}
          ref={(node) => {
            relationBars.current[index] = node;
          }}
          position={[portrait ? x * 0.65 : x, 2.72 - index * 0.27, 0.04]}
          visible={false}
        >
          <boxGeometry args={[1.1, 0.018, 0.018]} />
          <meshBasicMaterial color={index === 1 ? CRIMSON : '#918777'} />
        </mesh>
      ))}

      <group ref={bridge} position={[2.9, 3.95, -0.08]}>
        <mesh>
          <boxGeometry args={[1.8, 0.018, 0.018]} />
          <meshBasicMaterial color="#8d8375" />
        </mesh>
        <mesh position={[-0.9, 0, 0]}>
          <sphereGeometry args={[0.065, 10, 8]} />
          <meshBasicMaterial color={CRIMSON} />
        </mesh>
      </group>
    </group>
  );
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
      <color attach="background" args={[INK]} />
      <fog attach="fog" args={[INK, portrait ? 10.5 : 9, portrait ? 18 : 16]} />
      <ambientLight intensity={0.72} color="#d8c9b3" />
      <directionalLight
        position={[-3.5, 7, 5]}
        intensity={2.4}
        color="#e6d8c3"
        castShadow={!portrait}
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[3.8, 3.2, 1.4]} intensity={1.2} color="#6c5046" distance={8} />
      <Room />
      <Person />
      <InformationField progress={controller.progress} portrait={portrait} />
    </>
  );
}

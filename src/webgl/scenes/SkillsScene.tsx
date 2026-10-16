'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { type DirectionalLight, type Group, type PerspectiveCamera, Vector3 } from 'three';
import {
  getDepthCollapse,
  getLandscapeProgress,
  SKILLS_CENTERS,
  smoothstep,
} from '@/components/skills/skillsChoreography';
import type { ChapterProgressController } from '@/experience/chapterProgress';

interface SkillsSceneProps {
  controller: ChapterProgressController;
  portrait: boolean;
  finePointer: boolean;
}

const INK = '#0b0908';
const CHARCOAL = '#27231f';
const MID = '#6f665a';
const PAPER = '#aa9c87';
const PARCHMENT = '#e5dac7';
const CRIMSON = '#7d201d';
const CATEGORY_X = [0, 5.3, 10.7, 16.2, 21.6, 27.1] as const;

function Beam({
  position,
  scale,
  color = PAPER,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number];
  scale: [number, number, number];
  color?: string;
  rotation?: [number, number, number];
}) {
  return (
    <mesh position={position} scale={scale} rotation={rotation} castShadow receiveShadow>
      <boxGeometry />
      <meshStandardMaterial color={color} roughness={0.86} metalness={0.04} />
    </mesh>
  );
}

function ProgrammingStructure() {
  return (
    <group>
      <Beam position={[0, -1.15, 0]} scale={[3.4, 0.18, 2.3]} color={CHARCOAL} />
      {[-1.2, -0.6, 0, 0.6, 1.2].map((x, index) => (
        <Beam
          key={x}
          position={[x, -0.05 + (index % 2) * 0.18, -0.2 - index * 0.12]}
          scale={[0.22, 2.05 - index * 0.13, 0.55]}
          color={index === 2 ? PARCHMENT : PAPER}
        />
      ))}
      <Beam position={[0, 1.05, -0.65]} scale={[3.15, 0.13, 0.38]} color={MID} />
    </group>
  );
}

function WebStructure() {
  return (
    <group>
      <Beam position={[-0.8, 0.15, 0.35]} scale={[2.3, 2.7, 0.15]} color={PARCHMENT} />
      <Beam position={[0.25, 0.4, -0.35]} scale={[2.5, 2.15, 0.12]} color={PAPER} />
      <Beam position={[1.05, -0.05, -0.95]} scale={[1.75, 2.55, 0.1]} color={MID} />
      <Beam position={[0, -1.27, -0.15]} scale={[3.8, 0.12, 1.9]} color={CHARCOAL} />
    </group>
  );
}

function BackendStructure() {
  return (
    <group>
      {[-1.25, 0, 1.25].map((x, index) => (
        <group key={x} position={[x, 0, -index * 0.72]}>
          <Beam
            position={[0, 0, 0]}
            scale={[0.8, 2.45, 0.75]}
            color={index === 1 ? PARCHMENT : PAPER}
          />
          <Beam position={[0, 1.35, 0]} scale={[1.0, 0.13, 0.9]} color={MID} />
        </group>
      ))}
      <Beam position={[0, 0.65, -0.72]} scale={[3.5, 0.1, 0.12]} color={MID} />
      <Beam position={[0, -0.55, -0.72]} scale={[3.5, 0.1, 0.12]} color={MID} />
    </group>
  );
}

function CybersecurityStructure() {
  return (
    <group>
      <Beam position={[-1.65, 0, 0]} scale={[0.16, 3.5, 1.5]} color={MID} />
      <Beam position={[1.65, 0, 0]} scale={[0.16, 3.5, 1.5]} color={MID} />
      <Beam position={[0, 1.67, 0]} scale={[3.45, 0.16, 1.5]} color={PAPER} />
      <Beam position={[0, -1.67, 0]} scale={[3.45, 0.16, 1.5]} color={PAPER} />
      <Beam position={[0, 0, -0.55]} scale={[1.25, 2.25, 0.5]} color={PARCHMENT} />
      <Beam position={[0, 0, 0.62]} scale={[0.7, 1.15, 0.12]} color={CHARCOAL} />
    </group>
  );
}

function ToolsStructure() {
  return (
    <group>
      <Beam position={[-1.45, -0.6, 0]} scale={[0.55, 2.2, 0.65]} color={PAPER} />
      <Beam position={[1.45, -0.6, -0.3]} scale={[0.55, 2.2, 0.65]} color={PAPER} />
      <Beam position={[0, 0.2, -0.15]} scale={[3.45, 0.22, 0.7]} color={PARCHMENT} />
      <Beam position={[0, 1.05, -0.7]} scale={[2.35, 0.15, 0.5]} color={MID} />
      <Beam position={[0, -1.62, 0.1]} scale={[4.0, 0.13, 1.45]} color={CHARCOAL} />
    </group>
  );
}

function AiToolsStructure() {
  return (
    <group>
      <Beam position={[-1.15, -0.65, 0]} scale={[0.75, 2.3, 0.72]} color={PAPER} />
      <Beam position={[0.25, 0.05, -0.35]} scale={[0.85, 3.4, 0.72]} color={PARCHMENT} />
      <Beam position={[1.65, 0.85, -0.9]} scale={[0.72, 2.2, 0.62]} color={PAPER} />
      <Beam position={[0.3, -1.72, -0.25]} scale={[4.1, 0.13, 1.5]} color={CHARCOAL} />
      <Beam
        position={[0.95, 1.75, -0.72]}
        scale={[2.4, 0.12, 0.25]}
        color={MID}
        rotation={[0, 0, 0.15]}
      />
      <Beam position={[2.35, 1.45, -1.05]} scale={[1.1, 0.1, 0.2]} color={CRIMSON} />
    </group>
  );
}

function CapabilityLandscape({
  progress,
  portrait,
}: {
  progress: React.MutableRefObject<number>;
  portrait: boolean;
}) {
  const world = useRef<Group>(null);

  useFrame(() => {
    if (!world.current) return;
    const collapse = getDepthCollapse(progress.current);
    world.current.scale.z = Math.max(0.055, 1 - collapse * 0.945);
    world.current.scale.y = 1 - collapse * 0.12;
  });

  return (
    <group ref={world} scale={[portrait ? 0.82 : 1, portrait ? 0.88 : 1, 1]}>
      <Beam position={[13.55, -2.15, 0.2]} scale={[31.5, 0.08, 0.18]} color={PARCHMENT} />
      {CATEGORY_X.slice(0, -1).map((x, index) => (
        <Beam
          key={x}
          position={[(x + CATEGORY_X[index + 1]) / 2, -1.82, -0.35 - (index % 2) * 0.35]}
          scale={[5.0, 0.08, 0.12]}
          color={MID}
          rotation={[0, index % 2 ? 0.07 : -0.07, 0]}
        />
      ))}
      <group position={[CATEGORY_X[0], 0, 0]}>
        <ProgrammingStructure />
      </group>
      <group position={[CATEGORY_X[1], 0.15, -0.35]}>
        <WebStructure />
      </group>
      <group position={[CATEGORY_X[2], -0.05, -0.6]}>
        <BackendStructure />
      </group>
      <group position={[CATEGORY_X[3], 0.2, -0.3]}>
        <CybersecurityStructure />
      </group>
      <group position={[CATEGORY_X[4], -0.05, -0.65]}>
        <ToolsStructure />
      </group>
      <group position={[CATEGORY_X[5], 0.05, -0.4]}>
        <AiToolsStructure />
      </group>
    </group>
  );
}

function interpolateCategoryX(progress: number) {
  if (progress <= SKILLS_CENTERS[0]) return CATEGORY_X[0];
  for (let index = 0; index < SKILLS_CENTERS.length - 1; index += 1) {
    const start = SKILLS_CENTERS[index];
    const end = SKILLS_CENTERS[index + 1];
    if (progress <= end) {
      const local = smoothstep((progress - start) / (end - start));
      return CATEGORY_X[index] + (CATEGORY_X[index + 1] - CATEGORY_X[index]) * local;
    }
  }
  return CATEGORY_X[CATEGORY_X.length - 1];
}

export function SkillsScene({ controller, portrait, finePointer }: SkillsSceneProps) {
  const { camera, pointer } = useThree();
  const target = useMemo(() => new Vector3(), []);
  const keyLight = useRef<DirectionalLight>(null);

  useFrame(() => {
    const progress = controller.progress.current;
    const travel = getLandscapeProgress(progress);
    const collapse = getDepthCollapse(progress);
    const x = interpolateCategoryX(progress);
    const pointerX = finePointer && !portrait ? pointer.x * 0.18 : 0;
    const pointerY = finePointer && !portrait ? pointer.y * 0.1 : 0;
    const perspectiveCamera = camera as PerspectiveCamera;
    const desiredFov = portrait ? 52 : 42;
    if (perspectiveCamera.fov !== desiredFov) {
      perspectiveCamera.fov = desiredFov;
      perspectiveCamera.updateProjectionMatrix();
    }

    camera.position.set(
      x + pointerX,
      (portrait ? 2.15 : 2.35) + Math.sin(travel * Math.PI * 2) * 0.22 - pointerY + collapse * 0.55,
      (portrait ? 12.4 : 10.2) + collapse * 2.4,
    );
    target.set(x + pointerX * 0.3, -0.15 + collapse * 0.35, -0.35);
    camera.lookAt(target);
    camera.updateMatrixWorld();

    if (keyLight.current) {
      keyLight.current.position.x = x - 1.8;
      keyLight.current.intensity = 2.0 - collapse * 0.55;
    }
  });

  return (
    <>
      <color attach="background" args={[INK]} />
      <fog attach="fog" args={[INK, portrait ? 11 : 9, portrait ? 21 : 18]} />
      <ambientLight intensity={0.42} color="#d8ccb9" />
      <directionalLight ref={keyLight} position={[-1.8, 7, 5]} intensity={2} color="#e7dac6" />
      <pointLight position={[0, -1, 4]} intensity={0.42} color="#6e2925" distance={8} />
      <CapabilityLandscape progress={controller.progress} portrait={portrait} />
    </>
  );
}

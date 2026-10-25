'use client';

import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Suspense, useMemo, useRef } from 'react';
import { Color, MathUtils, type Mesh, type MeshStandardMaterial, Vector3 } from 'three';
import { rangeProgress, smoothstep } from '@/components/neuroshield/neuroShieldChoreography';
import type { ChapterProgressController } from '@/experience/chapterProgress';

interface NeuroShieldSceneProps {
  controller: ChapterProgressController;
  portrait: boolean;
}

const MODEL_URL = '/models/neuroshield/anatomical-brain.glb';
const IVORY = new Color('#d9dcd8');
const PARTS = [
  { name: 'frontal', color: '#ae7770', offset: [-0.95, 0.18, 0.07] },
  { name: 'parietal', color: '#b9a27c', offset: [0.2, 0.72, -0.06] },
  { name: 'temporal', color: '#988da2', offset: [-0.58, -0.58, 0.18] },
  { name: 'occipital', color: '#8599aa', offset: [0.9, 0.2, -0.1] },
  { name: 'cerebellum', color: '#aa8171', offset: [0.93, -0.55, 0.12] },
  { name: 'brainstem', color: '#8d8b9a', offset: [0.08, -0.78, 0.25] },
] as const;

function BrainModel({ controller, portrait }: NeuroShieldSceneProps) {
  const { scene } = useGLTF(MODEL_URL);
  const { camera, invalidate } = useThree();
  const group = useRef<import('three').Group>(null);
  const meshes = useRef<(Mesh | null)[]>([]);
  const materials = useRef<(MeshStandardMaterial | null)[]>([]);
  const core = useRef<Mesh>(null);
  const coreMaterial = useRef<MeshStandardMaterial>(null);
  const hovered = useRef<string | null>(null);
  const sources = useMemo(
    () =>
      PARTS.map((part) => {
        const mesh = scene.getObjectByName(part.name);
        if (!mesh || !('geometry' in mesh)) {
          throw new Error(`NeuroShield anatomical model is missing ${part.name}`);
        }
        return mesh as Mesh;
      }),
    [scene],
  );
  const coreSource = useMemo(() => scene.getObjectByName('core') as Mesh | undefined, [scene]);
  const colors = useMemo(() => PARTS.map((part) => new Color(part.color)), []);
  const basePositions = useMemo(() => sources.map((mesh) => mesh.position.clone()), [sources]);
  const corePosition = useMemo(() => coreSource?.position.clone() ?? new Vector3(), [coreSource]);

  useFrame((_, delta) => {
    const p = controller.progress.current;
    const focus = smoothstep(rangeProgress(p, 0.01, 0.09));
    const split = smoothstep(rangeProgress(p, 0.09, 0.3));
    const colour = smoothstep(rangeProgress(p, 0.15, 0.34));
    const exit = 1 - smoothstep(rangeProgress(p, 0.48, 0.57));
    const ease = 1 - Math.exp(-Math.min(delta, 0.05) * 10);
    let moving = false;

    if (group.current) {
      group.current.visible = exit > 0.005;
      const targetScale = (portrait ? 0.8 : 0.94) + focus * (portrait ? 0.12 : 0.12);
      const nextScale = MathUtils.lerp(group.current.scale.x, targetScale, ease);
      moving ||= Math.abs(nextScale - targetScale) > 0.001;
      group.current.scale.setScalar(nextScale);
      group.current.rotation.y = MathUtils.lerp(group.current.rotation.y, -0.045 * split, ease);
    }

    const targetDistance = (portrait ? 9.9 : 7.15) + split * (portrait ? 0.55 : 0.65);
    camera.position.set(0, 0, MathUtils.lerp(camera.position.z, targetDistance, ease));
    camera.lookAt(0, 0, 0);
    moving ||= Math.abs(camera.position.z - targetDistance) > 0.002;

    PARTS.forEach((part, index) => {
      const mesh = meshes.current[index];
      const material = materials.current[index];
      if (!mesh || !material) return;
      const hover = hovered.current === part.name && split > 0.8 && exit > 0.4 ? 1 : 0;
      const offset = part.offset;
      const base = basePositions[index];
      const targetX = base.x + offset[0] * split;
      const targetY = base.y + offset[1] * split;
      const targetZ = base.z + offset[2] * split + hover * 0.13;
      mesh.position.x = MathUtils.lerp(mesh.position.x, targetX, ease);
      mesh.position.y = MathUtils.lerp(mesh.position.y, targetY, ease);
      mesh.position.z = MathUtils.lerp(mesh.position.z, targetZ, ease);
      mesh.rotation.y = MathUtils.lerp(mesh.rotation.y, hover * 0.14, ease);
      mesh.rotation.x = MathUtils.lerp(mesh.rotation.x, hover * -0.065, ease);
      material.color.copy(IVORY).lerp(colors[index], colour);
      material.opacity = exit;
      moving ||= Math.abs(mesh.position.x - targetX) > 0.002;
      moving ||= Math.abs(mesh.position.y - targetY) > 0.002;
      moving ||= Math.abs(mesh.position.z - targetZ) > 0.002;
      moving ||= Math.abs(mesh.rotation.y - hover * 0.14) > 0.002;
    });

    if (core.current && coreMaterial.current) {
      core.current.position.copy(corePosition);
      core.current.visible = split < 0.99 && exit > 0.01;
      coreMaterial.current.opacity = (1 - split) * exit;
    }
    if (moving) invalidate();
  });

  return (
    <group ref={group}>
      {sources.map((source, index) => (
        <mesh
          key={PARTS[index].name}
          ref={(mesh) => {
            meshes.current[index] = mesh;
          }}
          geometry={source.geometry}
          position={source.position}
          rotation={source.rotation}
          scale={source.scale}
          onPointerOver={(event) => {
            if (controller.progress.current < 0.26 || controller.progress.current > 0.52) return;
            event.stopPropagation();
            hovered.current = PARTS[index].name;
            invalidate();
          }}
          onPointerOut={() => {
            hovered.current = null;
            invalidate();
          }}
        >
          <meshStandardMaterial
            ref={(material) => {
              materials.current[index] = material;
            }}
            color={IVORY}
            roughness={0.86}
            metalness={0.015}
            transparent
            depthWrite
          />
        </mesh>
      ))}
      {coreSource && (
        <mesh ref={core} geometry={coreSource.geometry} position={coreSource.position}>
          <meshStandardMaterial ref={coreMaterial} color="#797d7c" roughness={1} transparent />
        </mesh>
      )}
    </group>
  );
}

export function NeuroShieldScene({ controller, portrait }: NeuroShieldSceneProps) {
  return (
    <>
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.72} color="#dce3e0" />
      <hemisphereLight args={['#edf0ea', '#465058', 1.1]} />
      <directionalLight position={[-4, 5, 6]} intensity={2.0} color="#f8f3e9" />
      <directionalLight position={[3, 2, -4]} intensity={1.25} color="#a5b9c3" />
      <Suspense fallback={null}>
        <BrainModel controller={controller} portrait={portrait} />
      </Suspense>
    </>
  );
}

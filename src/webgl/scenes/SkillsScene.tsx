'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  Color,
  type Group,
  MathUtils,
  type Mesh,
  type PerspectiveCamera,
  type PointLight,
  Raycaster,
  Vector2,
  Vector3,
} from 'three';
import type { ChapterProgressController } from '@/experience/chapterProgress';
import { CapabilityAtmosphere, ENVIRONMENT_ACCENTS } from './skills/CapabilityAtmosphere';
import { CapabilityTerrain } from './skills/CapabilityTerrain';
import {
  CAPABILITY_CARDS,
  createCapabilityTexture,
  paintCapabilityCard,
} from './skills/capabilityCards';

interface SkillsSceneProps {
  controller: ChapterProgressController;
  portrait: boolean;
  finePointer: boolean;
  reducedMotion: boolean;
}

type CardPlacement = { x: number; y: number; z: number; rotation: number };
const STOPS = [0.065, 0.215, 0.365, 0.515, 0.665, 0.815, 0.96] as const;
function smooth(value: number) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}

function makePlacements(portrait: boolean): CardPlacement[] {
  return CAPABILITY_CARDS.map((_, index) => {
    const side = index === 0 ? 0 : index % 2 === 1 ? 1 : -1;
    return {
      x: side * (portrait ? 0.78 : 3.15),
      y: -0.1 + Math.sin(index * 1.7) * 0.045,
      z: index * -21.5,
      rotation: side * -0.085,
    };
  });
}

function stopPose(placement: CardPlacement, portrait: boolean) {
  return {
    eye: new Vector3(
      placement.x * 0.1,
      portrait ? 0.12 : 0.23,
      placement.z + (portrait ? 7.4 : 8.8),
    ),
    look: new Vector3(placement.x * 0.38, -0.15, placement.z),
  };
}

export function SkillsScene({
  controller,
  portrait,
  finePointer,
  reducedMotion,
}: SkillsSceneProps) {
  const { camera, invalidate } = useThree();
  const placements = useMemo(() => makePlacements(portrait), [portrait]);
  const poses = useMemo(
    () => placements.map((placement) => stopPose(placement, portrait)),
    [placements, portrait],
  );
  const textures = useMemo(() => CAPABILITY_CARDS.map(createCapabilityTexture), []);
  const groups = useRef<(Group | null)[]>([]);
  const slabs = useRef<(Mesh | null)[]>([]);
  const focusLight = useRef<PointLight>(null);
  const groundLight = useRef<PointLight>(null);
  const pointer = useRef({ active: false, ndc: new Vector2() });
  const raycaster = useMemo(() => new Raycaster(), []);
  const eye = useMemo(() => new Vector3(), []);
  const look = useMemo(() => new Vector3(), []);
  const activeColor = useMemo(() => new Color(), []);
  const neutralLight = useMemo(() => new Color('#1b3543'), []);
  const nextColor = useMemo(() => new Color(), []);

  useEffect(() => {
    const perspective = camera as PerspectiveCamera;
    const previous = { fov: perspective.fov, near: perspective.near, far: perspective.far };
    perspective.fov = portrait ? 52 : 42;
    perspective.near = 0.1;
    perspective.far = 180;
    perspective.updateProjectionMatrix();
    invalidate();
    return () => {
      perspective.fov = previous.fov;
      perspective.near = previous.near;
      perspective.far = previous.far;
      perspective.updateProjectionMatrix();
    };
  }, [camera, portrait, invalidate]);

  useEffect(() => {
    let active = true;
    Promise.all([
      document.fonts.load('600 120px "Clash Display"'),
      document.fonts.load('500 50px "Satoshi"'),
    ])
      .then(() => {
        if (!active) return;
        textures.forEach((texture, index) => {
          paintCapabilityCard(texture.image as HTMLCanvasElement, CAPABILITY_CARDS[index]);
          texture.needsUpdate = true;
        });
        invalidate();
      })
      .catch(() => {});
    return () => {
      active = false;
      textures.forEach((texture) => {
        texture.dispose();
      });
    };
  }, [textures, invalidate]);

  useEffect(() => {
    if (!finePointer || portrait || reducedMotion) return;
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
      pointer.current.active = true;
      pointer.current.ndc.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        1 - (event.clientY / window.innerHeight) * 2,
      );
      invalidate();
    };
    const reset = () => {
      pointer.current.active = false;
      invalidate();
    };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('blur', reset);
    document.documentElement.addEventListener('pointerleave', reset);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('blur', reset);
      document.documentElement.removeEventListener('pointerleave', reset);
    };
  }, [finePointer, portrait, reducedMotion, invalidate]);

  useFrame((_, delta) => {
    const progress = controller.progress.current;
    let from = 0;
    while (from < STOPS.length - 2 && progress > STOPS[from + 1]) from += 1;
    const beforeFirst = progress < STOPS[0];
    const afterLast = progress > STOPS[STOPS.length - 1];
    const local = (progress - STOPS[from]) / (STOPS[from + 1] - STOPS[from]);
    const travel = smooth((local - 0.1) / 0.8);
    eye.copy(poses[from].eye).lerp(poses[from + 1].eye, travel);
    look.copy(poses[from].look).lerp(poses[from + 1].look, travel);
    if (beforeFirst) {
      eye.z += (1 - smooth(progress / STOPS[0])) * (portrait ? 3.3 : 5.4);
    }
    if (afterLast) {
      eye.z -= smooth((progress - STOPS[STOPS.length - 1]) / 0.04) * 1.2;
    }
    camera.position.copy(eye);
    camera.up.set(0, 1, 0);
    camera.lookAt(look);
    camera.updateMatrixWorld();

    let activeIndex = 0;
    for (let index = 1; index < STOPS.length; index += 1) {
      if (Math.abs(progress - STOPS[index]) < Math.abs(progress - STOPS[activeIndex])) {
        activeIndex = index;
      }
    }
    let hoveredIndex = -1;
    if (pointer.current.active && finePointer && !portrait) {
      raycaster.setFromCamera(pointer.current.ndc, camera);
      const hit = raycaster.intersectObjects(
        slabs.current.filter((slab): slab is Mesh => Boolean(slab)),
        false,
      )[0];
      if (hit && Math.abs(progress - STOPS[activeIndex]) < 0.105) {
        hoveredIndex = hit.object.userData.cardIndex === activeIndex ? activeIndex : -1;
      }
    }
    const ease = 1 - Math.exp(-Math.min(delta, 0.05) * 9);
    let settling = false;
    groups.current.forEach((group, index) => {
      if (!group) return;
      const placement = placements[index];
      const hover = hoveredIndex === index ? 1 : 0;
      const targetX = hover ? -pointer.current.ndc.y * 0.025 : 0;
      const targetY = placement.rotation + (hover ? pointer.current.ndc.x * 0.045 : 0);
      const targetZ = placement.z + hover * 0.13;
      group.rotation.x = MathUtils.lerp(group.rotation.x, targetX, ease);
      group.rotation.y = MathUtils.lerp(group.rotation.y, targetY, ease);
      group.position.z = MathUtils.lerp(group.position.z, targetZ, ease);
      settling ||= Math.abs(group.rotation.x - targetX) > 0.001;
      settling ||= Math.abs(group.rotation.y - targetY) > 0.001;
      settling ||= Math.abs(group.position.z - targetZ) > 0.001;
    });
    if (focusLight.current || groundLight.current) {
      const lightX = MathUtils.lerp(placements[from].x, placements[from + 1].x, travel);
      const lightZ = MathUtils.lerp(placements[from].z, placements[from + 1].z, travel);
      if (travel < 0.5) {
        activeColor.set(ENVIRONMENT_ACCENTS[from]).lerp(neutralLight, travel * 2);
      } else {
        nextColor.set(ENVIRONMENT_ACCENTS[from + 1]);
        activeColor.copy(neutralLight).lerp(nextColor, (travel - 0.5) * 2);
      }
      const lightStrength = 1 - Math.sin(travel * Math.PI) * 0.25;
      if (focusLight.current) {
        focusLight.current.position.set(lightX - 1.5, 3.2, lightZ + 3.8);
        focusLight.current.color.copy(activeColor);
        focusLight.current.intensity = (portrait ? 2.6 : 3.5) * lightStrength;
      }
      if (groundLight.current) {
        groundLight.current.position.set(lightX, -1.8, lightZ + 1.2);
        groundLight.current.color.copy(activeColor);
        groundLight.current.intensity = (portrait ? 0.8 : 1.25) * lightStrength;
      }
    }
    if (settling) invalidate();
  });

  return (
    <>
      <fog attach="fog" args={['#08131b', portrait ? 20 : 24, portrait ? 75 : 92]} />
      <ambientLight color="#b3c8cf" intensity={0.64} />
      <hemisphereLight args={['#8daab8', '#101c24', 0.82]} />
      <directionalLight position={[-6, 12, 10]} intensity={1.35} color="#d6d8d1" />
      <pointLight ref={focusLight} color="#c4c6c1" intensity={3.5} distance={17} decay={2} />
      <pointLight ref={groundLight} color="#7694a8" intensity={1.25} distance={11} decay={2} />
      <CapabilityTerrain portrait={portrait} />
      <CapabilityAtmosphere portrait={portrait} placements={placements} />
      {CAPABILITY_CARDS.map((card, index) => {
        const placement = placements[index];
        const scale = portrait ? 0.76 : 1;
        return (
          <group
            key={card.number}
            ref={(node) => {
              groups.current[index] = node;
            }}
            position={[placement.x, placement.y, placement.z]}
            rotation={[0, placement.rotation, 0]}
            scale={scale}
          >
            <mesh
              ref={(node) => {
                slabs.current[index] = node;
              }}
              userData={{ cardIndex: index }}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[3.76, 5.18, 0.2]} />
              <meshStandardMaterial color="#171d22" roughness={0.78} metalness={0.16} />
            </mesh>
            <mesh position={[0, 0, 0.111]}>
              <planeGeometry args={[3.55, 4.98]} />
              <meshBasicMaterial
                map={textures[index]}
                transparent
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
            <mesh position={[-1.84, 0, 0.113]}>
              <boxGeometry args={[0.022, 4.96, 0.022]} />
              <meshStandardMaterial
                color={card.accent}
                emissive={card.accent}
                emissiveIntensity={0.35}
                roughness={0.58}
              />
            </mesh>
            <mesh position={[0, -2.64, 0]} receiveShadow>
              <boxGeometry args={[4.05, 0.12, 0.58]} />
              <meshStandardMaterial color="#10161a" roughness={0.9} metalness={0.14} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

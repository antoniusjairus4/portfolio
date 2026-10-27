'use client';

import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { type RefObject, useEffect, useMemo, useRef } from 'react';
import {
  Color,
  type Group,
  type Material,
  MathUtils,
  type Mesh,
  MeshStandardMaterial,
  type Object3D,
  type PerspectiveCamera,
  type ShaderMaterial,
  type SpotLight,
} from 'three';
import type { ChapterProgressController } from '@/experience/chapterProgress';

const MODEL_ROOT = '/models/achievements';

type MaterialTreatment = 'original' | 'ivory' | 'charcoal' | 'fabric' | 'metal' | 'speaker';

const MODEL_COLORS: Record<Exclude<MaterialTreatment, 'original'>, string> = {
  ivory: '#ddd2bd',
  charcoal: '#171513',
  fabric: '#101011',
  metal: '#777269',
  speaker: '#111214',
};

function smooth(value: number) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}

function panelProgress(panel: string, portrait: boolean) {
  const element = document.querySelector<HTMLElement>(`[data-achievement-panel="${panel}"]`);
  if (!element) return 0;
  const rect = element.getBoundingClientRect();
  const viewport = window.innerHeight;
  const start = portrait ? viewport * 0.4 : 0;
  return Math.min(1, Math.max(0, (start - rect.top) / Math.max(1, rect.height - viewport + start)));
}

function presence(progress: number) {
  return smooth(progress / 0.14) * (1 - smooth((progress - 0.84) / 0.14));
}

function setGroupPresence(group: Group | null, amount: number, scale: number) {
  if (!group) return;
  group.visible = amount > 0.002;
  group.scale.setScalar(Math.max(0.001, scale * (0.82 + amount * 0.18)));
}

function LoadedModel({
  url,
  treatment = 'original',
}: {
  url: string;
  treatment?: MaterialTreatment;
}) {
  const { scene } = useGLTF(url);
  const clone = useMemo(() => {
    const next = scene.clone(true);
    next.traverse((child: Object3D) => {
      const mesh = child as Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const source = mesh.material;
      const materialWasArray = Array.isArray(source);
      const materials: Material[] = materialWasArray ? source : [source];
      const clonedMaterials = materials.map((source) => {
        const material = source.clone();
        if (material instanceof MeshStandardMaterial) {
          if (treatment !== 'original') material.color = new Color(MODEL_COLORS[treatment]);
          if (treatment === 'fabric') {
            material.roughness = 0.78;
            material.metalness = 0;
          } else if (treatment === 'metal') {
            material.roughness = 0.28;
            material.metalness = 0.72;
          } else if (treatment === 'speaker') {
            material.roughness = 0.7;
            material.metalness = 0.16;
          } else {
            material.roughness = MathUtils.clamp(material.roughness, 0.32, 0.72);
            material.metalness = MathUtils.clamp(material.metalness, 0.04, 0.48);
          }
        }
        return material;
      });
      mesh.material = materialWasArray ? clonedMaterials : clonedMaterials[0];
    });
    return next;
  }, [scene, treatment]);

  useEffect(
    () => () => {
      clone.traverse((child: Object3D) => {
        const mesh = child as Mesh;
        if (!mesh.isMesh) return;
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((material) => {
          material.dispose();
        });
      });
    },
    [clone],
  );

  return <primitive object={clone} />;
}

function ChessBoard() {
  const squares = useMemo(
    () =>
      Array.from({ length: 64 }, (_, index) => ({
        key: index,
        x: ((index % 8) - 3.5) * 0.45,
        z: (Math.floor(index / 8) - 3.5) * 0.45,
        light: (index + Math.floor(index / 8)) % 2 === 0,
      })),
    [],
  );
  return (
    <group>
      <mesh receiveShadow position={[0, -0.12, 0]}>
        <boxGeometry args={[3.85, 0.22, 3.85]} />
        <meshStandardMaterial color="#30271f" roughness={0.42} metalness={0.12} />
      </mesh>
      {squares.map((square) => (
        <mesh key={square.key} receiveShadow position={[square.x, 0.01, square.z]}>
          <boxGeometry args={[0.45, 0.04, 0.45]} />
          <meshStandardMaterial
            color={square.light ? '#d8cdb8' : '#171513'}
            roughness={square.light ? 0.52 : 0.38}
            metalness={square.light ? 0.04 : 0.16}
          />
        </mesh>
      ))}
    </group>
  );
}

function KarateBackdrop({ materialRef }: { materialRef: RefObject<ShaderMaterial | null> }) {
  const uniforms = useMemo(
    () => ({
      uOpacity: { value: 0 },
      uTopLeft: { value: new Color('#E0D4C1') },
      uCenter: { value: new Color('#CBBBA3') },
      uBottomRight: { value: new Color('#A58F73') },
    }),
    [],
  );

  return (
    <mesh position={[0, 0, -5]} renderOrder={-100} frustumCulled={false}>
      <planeGeometry args={[30, 20]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        transparent
        depthTest
        depthWrite={false}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uOpacity;
          uniform vec3 uTopLeft;
          uniform vec3 uCenter;
          uniform vec3 uBottomRight;
          varying vec2 vUv;

          void main() {
            float diagonal = clamp((vUv.x + (1.0 - vUv.y)) * 0.5, 0.0, 1.0);
            vec3 gradient = mix(uTopLeft, uBottomRight, smoothstep(0.0, 1.0, diagonal));
            float centerWeight = 1.0 - smoothstep(0.0, 0.72, distance(vUv, vec2(0.5)));
            gradient = mix(gradient, uCenter, centerWeight * 0.68);
            gl_FragColor = vec4(gradient, uOpacity);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
        `}
      />
    </mesh>
  );
}

export function AchievementsScene({
  controller,
  portrait,
}: {
  controller: ChapterProgressController;
  portrait: boolean;
}) {
  const { camera, invalidate } = useThree();
  const table = useRef<Group>(null);
  const belt = useRef<Group>(null);
  const chess = useRef<Group>(null);
  const speaking = useRef<Group>(null);
  const tableLight = useRef<SpotLight>(null);
  const beltLight = useRef<SpotLight>(null);
  const chessLight = useRef<SpotLight>(null);
  const speakingLight = useRef<SpotLight>(null);
  const karateBackdrop = useRef<ShaderMaterial>(null);
  const floorMaterial = useRef<MeshStandardMaterial>(null);

  useEffect(() => {
    const perspective = camera as PerspectiveCamera;
    const previous = {
      fov: perspective.fov,
      near: perspective.near,
      far: perspective.far,
      position: perspective.position.clone(),
    };
    perspective.fov = portrait ? 49 : 40;
    perspective.near = 0.1;
    perspective.far = 45;
    perspective.position.set(0, portrait ? 0.7 : 1.25, portrait ? 9.4 : 9.8);
    perspective.lookAt(0, portrait ? -1.05 : -0.35, 0);
    perspective.updateProjectionMatrix();
    invalidate();
    return () => {
      perspective.fov = previous.fov;
      perspective.near = previous.near;
      perspective.far = previous.far;
      perspective.position.copy(previous.position);
      perspective.updateProjectionMatrix();
    };
  }, [camera, invalidate, portrait]);

  useFrame(() => {
    void controller.progress.current;
    const tableProgress = panelProgress('table-tennis', portrait);
    const beltProgress = panelProgress('karate', portrait);
    const chessProgress = panelProgress('chess', portrait);
    const speakingProgress = panelProgress('public-speaking', portrait);
    const tablePresence = presence(tableProgress);
    const beltPresence = presence(beltProgress);
    const chessPresence = presence(chessProgress);
    const speakingPresence = presence(speakingProgress);
    // The achievements renderer is physically clipped to the narrative pane.
    // Keep every model centered in that local viewport rather than offsetting
    // it inside the full browser width.
    const centerX = 0;

    setGroupPresence(table.current, tablePresence, portrait ? 0.92 : 1.2);
    if (table.current) {
      table.current.position.set(
        centerX,
        (portrait ? -1.65 : -1.48) - (1 - smooth(tableProgress / 0.28)) * 0.75,
        -0.15,
      );
      table.current.rotation.set(-0.03, -0.34 + tableProgress * 0.08, -0.015);
    }

    setGroupPresence(belt.current, beltPresence, portrait ? 0.72 : 0.9);
    if (belt.current) {
      const arrival = smooth(tableProgress + beltProgress);
      belt.current.position.set(
        centerX - (1 - smooth(beltProgress / 0.38)) * 4.2,
        portrait ? -0.85 : -0.18,
        0.2,
      );
      belt.current.rotation.set(0.12, -0.12, -0.16 + (1 - arrival) * -0.18);
    }

    setGroupPresence(chess.current, chessPresence, portrait ? 0.78 : 1.02);
    if (chess.current) {
      const lift = smooth(chessProgress / 0.5);
      chess.current.position.set(centerX, (portrait ? -2.45 : -1.72) - (1 - lift) * 0.8, -0.2);
      chess.current.rotation.set(0.02, -0.22 + chessProgress * 0.1, 0);
    }

    setGroupPresence(speaking.current, speakingPresence, portrait ? 0.74 : 0.94);
    if (speaking.current) {
      const lift = smooth(speakingProgress / 0.44);
      speaking.current.position.set(centerX, (portrait ? -2.1 : -1.55) - (1 - lift) * 1.25, 0);
      speaking.current.rotation.set(0, -0.16 + speakingProgress * 0.08, 0);
    }

    if (tableLight.current) tableLight.current.intensity = tablePresence * 52;
    if (beltLight.current) beltLight.current.intensity = beltPresence * 44;
    if (chessLight.current) chessLight.current.intensity = chessPresence * 50;
    if (speakingLight.current) speakingLight.current.intensity = speakingPresence * 58;
    if (karateBackdrop.current) karateBackdrop.current.uniforms.uOpacity.value = beltPresence;
    if (floorMaterial.current) floorMaterial.current.opacity = 1 - beltPresence;
  });

  return (
    <>
      <KarateBackdrop materialRef={karateBackdrop} />
      <fog attach="fog" args={['#0b0908', 8, 24]} />
      <ambientLight color="#8d8477" intensity={0.42} />
      <hemisphereLight args={['#b9c6cb', '#120e0b', 0.72]} />
      <directionalLight
        position={[-5, 8, 7]}
        color="#f2dfbd"
        intensity={1.8}
        castShadow={!portrait}
      />
      <spotLight
        ref={tableLight}
        position={[-3.7, 4.8, 4.5]}
        color="#f2d5a4"
        distance={14}
        angle={0.55}
        penumbra={0.72}
        decay={2}
      />
      <spotLight
        ref={beltLight}
        position={[-1.8, 4.2, 4]}
        color="#d9cdb9"
        distance={13}
        angle={0.58}
        penumbra={0.78}
        decay={2}
      />
      <spotLight
        ref={chessLight}
        position={[-4, 5, 3.5]}
        color="#eee2cc"
        distance={14}
        angle={0.5}
        penumbra={0.72}
        decay={2}
      />
      <spotLight
        ref={speakingLight}
        position={[-2.5, 5.8, 3.8]}
        color="#ead5ad"
        distance={15}
        angle={0.45}
        penumbra={0.68}
        decay={2}
      />

      <group ref={table} visible={false}>
        <LoadedModel url={`${MODEL_ROOT}/table-tennis.glb`} />
      </group>

      <group ref={belt} visible={false}>
        <LoadedModel url={`${MODEL_ROOT}/karate-black-belt.glb`} treatment="fabric" />
      </group>

      <group ref={chess} visible={false}>
        <ChessBoard />
        <group position={[-1.08, 0.1, -0.35]} scale={18} rotation={[0, 0.35, 0]}>
          <LoadedModel url={`${MODEL_ROOT}/chess-knight.glb`} treatment="ivory" />
        </group>
        <group position={[0.15, 0.1, 0.42]} scale={18} rotation={[0, -0.22, 0]}>
          <LoadedModel url={`${MODEL_ROOT}/chess-queen.glb`} treatment="charcoal" />
        </group>
        <group position={[1.25, 0.1, -0.6]} scale={17} rotation={[0, -0.38, 0]}>
          <LoadedModel url={`${MODEL_ROOT}/chess-king.glb`} treatment="ivory" />
        </group>
      </group>

      <group ref={speaking} visible={false}>
        <group position={[0, -0.15, 0]} scale={0.84}>
          <LoadedModel url={`${MODEL_ROOT}/stage-platform.glb`} treatment="charcoal" />
        </group>
        <group position={[-0.55, 0.18, 0.38]} scale={1.34} rotation={[0, -0.24, 0]}>
          <LoadedModel url={`${MODEL_ROOT}/stage-microphone.glb`} treatment="metal" />
        </group>
        <group position={[1.6, 0.04, -0.2]} scale={1.4} rotation={[0, -0.34, 0]}>
          <LoadedModel url={`${MODEL_ROOT}/line-array-speaker.glb`} treatment="speaker" />
        </group>
      </group>

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.7, 0]}>
        <planeGeometry args={[8, 7]} />
        <meshStandardMaterial
          ref={floorMaterial}
          color="#0c0a09"
          roughness={0.92}
          metalness={0.02}
          transparent
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

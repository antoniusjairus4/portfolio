'use client';

import { useGLTF } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import {
  Color,
  type Group,
  MathUtils,
  type Mesh,
  MeshStandardMaterial,
  type Object3D,
} from 'three';
import styles from './AchievementEditorial.module.css';

useGLTF.preload('/models/achievements/chess-king.glb');
useGLTF.preload('/models/achievements/chess-queen.glb');

interface PieceProps {
  url: string;
  isDark?: boolean;
  position: [number, number, number];
  scale: number;
  rotation: [number, number, number];
}

function DualChessPiece({ url, isDark = false, position, scale, rotation }: PieceProps) {
  const { scene } = useGLTF(url);

  const clone = useMemo(() => {
    const next = scene.clone(true);
    next.traverse((child: Object3D) => {
      const mesh = child as Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Compute smooth vertex normals to eliminate any flat-polygon facets
      if (mesh.geometry) {
        mesh.geometry.computeVertexNormals();
      }

      // Clone original material to preserve the metallic gold collar/crown accents
      const source = mesh.material;
      const isArray = Array.isArray(source);
      const materials = isArray ? source : [source];

      const clonedMaterials = materials.map((mat) => {
        if (!(mat instanceof MeshStandardMaterial)) return mat.clone();
        const nextMat = mat.clone();

        const hex = nextMat.color.getHexString();
        // The gold accent ring/collar in the model is ~c8a459
        const isGoldAccent = hex.startsWith('c8') || hex.startsWith('b') || nextMat.metalness > 0.4;

        if (isDark) {
          if (isGoldAccent) {
            nextMat.color = new Color('#b89345');
            nextMat.roughness = 0.32;
            nextMat.metalness = 0.65;
          } else {
            // Deep black satin finish for specular edge highlights
            nextMat.color = new Color('#0d0c0b');
            nextMat.roughness = 0.22;
            nextMat.metalness = 0.22;
          }
        } else {
          if (isGoldAccent) {
            nextMat.color = new Color('#d4af37');
            nextMat.roughness = 0.3;
            nextMat.metalness = 0.65;
          } else {
            // Rich polished ivory porcelain for the king
            nextMat.color = new Color('#f4ede0');
            nextMat.roughness = 0.28;
            nextMat.metalness = 0.05;
          }
        }
        return nextMat;
      });

      mesh.material = isArray ? clonedMaterials : clonedMaterials[0];
    });
    return next;
  }, [scene, isDark]);

  useEffect(() => {
    return () => {
      clone.traverse((child: Object3D) => {
        const mesh = child as Mesh;
        if (!mesh.isMesh) return;
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => {
              m.dispose();
            });
          } else {
            mesh.material.dispose();
          }
        }
      });
    };
  }, [clone]);

  return <primitive object={clone} position={position} scale={scale} rotation={rotation} />;
}

function SceneContent({ reducedMotion }: { reducedMotion: boolean }) {
  const stageRef = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!stageRef.current || reducedMotion) return;
    const targetRotY = state.pointer.x * 0.14;
    const targetRotX = -state.pointer.y * 0.1;
    stageRef.current.rotation.y = MathUtils.damp(
      stageRef.current.rotation.y,
      targetRotY,
      3.5,
      delta,
    );
    stageRef.current.rotation.x = MathUtils.damp(
      stageRef.current.rotation.x,
      targetRotX,
      3.5,
      delta,
    );
  });

  return (
    <group ref={stageRef}>
      {/* 1. Ivory King (Hero Piece) */}
      <Suspense fallback={null}>
        <DualChessPiece
          url="/models/achievements/chess-king.glb"
          isDark={false}
          position={[0.34, -0.42, 0.15]}
          scale={14.8}
          rotation={[0.04, -0.44, -0.03]}
        />
      </Suspense>

      {/* 2. Obsidian Queen (Opposing Duel Piece) */}
      <Suspense fallback={null}>
        <DualChessPiece
          url="/models/achievements/chess-queen.glb"
          isDark={true}
          position={[-0.42, -0.45, -0.12]}
          scale={13.2}
          rotation={[0.06, 0.48, 0.04]}
        />
      </Suspense>
    </group>
  );
}

export default function ChessHero3D({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const [mounted, setMounted] = useState(false);
  const [renderActive, setRenderActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const container = containerRef.current;
    const visualLayer = container?.parentElement;
    const editorial = visualLayer?.parentElement;
    const panel = container?.closest<HTMLElement>('[data-achievement-panel]');
    if (!container || !visualLayer || !editorial || !panel) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = container.getBoundingClientRect();
      const pieceTarget =
        Number.parseFloat(getComputedStyle(panel).getPropertyValue('--chess-pieces')) || 0;
      const currentOpacity = Number.parseFloat(getComputedStyle(visualLayer).opacity) || 0;
      const editorialOpacity = Number.parseFloat(getComputedStyle(editorial).opacity) || 0;
      const visible =
        document.visibilityState === 'visible' &&
        rect.width > 0 &&
        rect.height > 0 &&
        rect.bottom > 0 &&
        rect.top < window.innerHeight &&
        rect.right > 0 &&
        rect.left < window.innerWidth &&
        editorialOpacity > 0.001 &&
        (pieceTarget > 0.001 || currentOpacity > 0.001);
      setRenderActive((current) => (current === visible ? current : visible));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const observer = new IntersectionObserver(schedule);
    observer.observe(container);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    document.addEventListener('visibilitychange', schedule);
    visualLayer.addEventListener('transitionend', schedule);
    update();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('visibilitychange', schedule);
      visualLayer.removeEventListener('transitionend', schedule);
    };
  }, [mounted]);

  if (!mounted) {
    return <div className={styles.chess3dPlaceholder} aria-hidden="true" />;
  }

  return (
    <div
      ref={containerRef}
      className={styles.chess3dContainer}
      aria-hidden="true"
      data-render-active={renderActive}
    >
      <Canvas
        camera={{ position: [0, 0.35, 3.1], fov: 28 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        shadows
        dpr={[1, 1.75]}
        frameloop={renderActive ? 'always' : 'never'}
      >
        <ambientLight color="#1e1814" intensity={0.52} />

        {/* Primary warm key spotlight */}
        <spotLight
          position={[-2.8, 5.5, 3.8]}
          color="#fdf4e6"
          intensity={65}
          angle={0.48}
          penumbra={0.8}
          distance={15}
          castShadow
        />

        {/* Subtle warm rim light behind the black Queen */}
        <spotLight
          position={[-2.2, 1.8, -2.4]}
          color="#f0dfc8"
          intensity={42}
          angle={0.52}
          penumbra={0.85}
          distance={12}
        />

        {/* Crimson tactical rim light from rear-right */}
        <spotLight
          position={[3.5, 2.5, -2.2]}
          color="#c82d3e"
          intensity={32}
          angle={0.62}
          penumbra={0.75}
          distance={14}
        />

        {/* Soft front fill */}
        <directionalLight position={[0.2, 1.2, 3.5]} color="#ede2d2" intensity={0.35} />

        <SceneContent reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}

import { useFrame } from '@react-three/fiber';
import { type MutableRefObject, useEffect, useMemo, useRef } from 'react';
import { type Group, type MeshStandardMaterial, Object3D, type SpotLight } from 'three';
import {
  DISPLAY_INSET_BOXES,
  DISPLAY_LEDGE_BOXES,
  WALL_ACCENT_BOXES,
  WALL_PANEL_BOXES,
  WALL_TRIM_BOXES,
} from './architectureLayout';
import { boxes } from './geometry';
import { useKaiForgeMaterials } from './Materials';

export function WallDesign({ bridgeProgress }: { bridgeProgress?: MutableRefObject<number> }) {
  const shared = useKaiForgeMaterials();
  const root = useRef<Group>(null);
  const wash = useRef<SpotLight>(null);
  const washTarget = useMemo(() => {
    const target = new Object3D();
    target.position.set(0, 2.25, -5.7);
    return target;
  }, []);
  const fadesInBridge = bridgeProgress !== undefined;
  const geometries = useMemo(
    () => ({
      panels: boxes(WALL_PANEL_BOXES),
      insets: boxes(DISPLAY_INSET_BOXES),
      ledges: boxes(DISPLAY_LEDGE_BOXES),
      trim: boxes(WALL_TRIM_BOXES),
      accent: boxes(WALL_ACCENT_BOXES),
    }),
    [],
  );
  const materials = useMemo(() => {
    const source = {
      panels: shared.wallPanel,
      insets: shared.wallInset,
      ledges: shared.wallLedge,
      trim: shared.wallTrim,
      accent: shared.wallAccent,
    };
    if (!fadesInBridge) return source;
    return Object.fromEntries(
      Object.entries(source).map(([key, material]) => {
        const copy = material.clone();
        copy.transparent = true;
        copy.depthWrite = false;
        return [key, copy];
      }),
    ) as typeof source;
  }, [fadesInBridge, shared]);
  useEffect(
    () => () => {
      for (const geometry of Object.values(geometries)) geometry.dispose();
      if (fadesInBridge) {
        for (const material of Object.values(materials)) material.dispose();
      }
    },
    [fadesInBridge, geometries, materials],
  );
  useFrame(() => {
    const t = bridgeProgress ? Math.min(1, Math.max(0, (bridgeProgress.current - 0.25) / 0.35)) : 0;
    const remaining = 1 - t * t * (3 - 2 * t);
    if (bridgeProgress) {
      for (const material of Object.values(materials) as MeshStandardMaterial[]) {
        material.opacity = remaining;
      }
    }
    materials.accent.emissiveIntensity = 0.45 * remaining;
    if (wash.current) wash.current.intensity = 5.5 * remaining;
    if (root.current) root.current.visible = remaining > 0.001;
  });

  return (
    <group ref={root} name="KF_WallDesign">
      <mesh geometry={geometries.panels} material={materials.panels} receiveShadow />
      <mesh geometry={geometries.insets} material={materials.insets} receiveShadow />
      <mesh geometry={geometries.ledges} material={materials.ledges} castShadow receiveShadow />
      <mesh geometry={geometries.trim} material={materials.trim} />
      <mesh geometry={geometries.accent} material={materials.accent} />
      <primitive object={washTarget} />
      <spotLight
        ref={wash}
        position={[0, 3.05, -3.9]}
        target={washTarget}
        color="#f0ebe1"
        intensity={5.5}
        angle={0.82}
        penumbra={0.9}
        distance={4.2}
        decay={2}
      />
    </group>
  );
}

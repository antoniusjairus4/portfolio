import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { LineBasicMaterial, MeshBasicMaterial, MeshStandardMaterial } from 'three';
import { PALETTE } from './staging';
function createMaterials() {
  return {
    parchment: new MeshStandardMaterial({ color: '#e4ddcf', roughness: 0.9 }),
    architecture: new MeshStandardMaterial({ color: '#e4ddcf', roughness: .92, vertexColors: true }),
    ground: new MeshStandardMaterial({ color: '#cfc4b0', roughness: 0.98 }),
    mineral: new MeshStandardMaterial({ color: '#b5ae9f', roughness: 0.97 }),
    ink: new MeshStandardMaterial({ color: PALETTE.ink, roughness: 0.85 }),
    skin: new MeshStandardMaterial({ color: '#ad9c87', roughness: 0.95 }),
    table: new MeshStandardMaterial({ color: '#283531', roughness: 0.7 }),
    net: new LineBasicMaterial({ color: '#56564d' }),
    trace: new MeshBasicMaterial({ color: '#aba18e' }),
    echo: new MeshBasicMaterial({ color: '#746f62' }),
    crimson: new MeshBasicMaterial({ color: PALETTE.crimson }),
    contact: new MeshBasicMaterial({ color: '#b4aa98' }),
  };
}
const Context = createContext<ReturnType<typeof createMaterials> | null>(null);
/** Scene-owned procedural resources, never assets in the GLB cache. */
export function KaiForgeMaterials({ children }: { children: ReactNode }) {
  const materials = useMemo(createMaterials, []);
  useEffect(
    () => () => {
      for (const material of Object.values(materials)) material.dispose();
    },
    [materials],
  );
  return <Context.Provider value={materials}>{children}</Context.Provider>;
}
export function useKaiForgeMaterials() {
  const materials = useContext(Context);
  if (!materials) throw new Error('KaiForge material scope missing');
  return materials;
}

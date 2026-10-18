import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { LineBasicMaterial, MeshBasicMaterial, MeshStandardMaterial } from 'three';
import { PALETTE } from './staging';
function createMaterials() {
  return {
    parchment: new MeshStandardMaterial({ color: PALETTE.parchment, roughness: 0.95 }),
    mineral: new MeshStandardMaterial({ color: PALETTE.mineral, roughness: 1 }),
    ink: new MeshStandardMaterial({ color: PALETTE.ink, roughness: 0.85 }),
    skin: new MeshStandardMaterial({ color: '#ad9c87', roughness: 0.95 }),
    table: new MeshStandardMaterial({ color: '#303e3b', roughness: 0.78 }),
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

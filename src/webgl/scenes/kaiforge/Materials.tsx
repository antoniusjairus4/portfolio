import { createContext, type ReactNode, useContext, useEffect, useMemo } from 'react';
import {
  DataTexture,
  LineBasicMaterial,
  MeshBasicMaterial,
  MeshStandardMaterial,
  RepeatWrapping,
  RGBAFormat,
  SRGBColorSpace,
} from 'three';
import { PALETTE } from './staging';

function parchmentGrain() {
  const size = 128;
  const pixels = new Uint8Array(size * size * 4);
  const hash = (x: number, y: number) => {
    const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return value - Math.floor(value);
  };
  const coarse = (x: number, y: number) => {
    const gx = x / 16;
    const gy = y / 16;
    const ix = Math.floor(gx);
    const iy = Math.floor(gy);
    const tx = (gx - ix) ** 2 * (3 - 2 * (gx - ix));
    const ty = (gy - iy) ** 2 * (3 - 2 * (gy - iy));
    const at = (dx: number, dy: number) => hash((ix + dx) % 8, (iy + dy) % 8);
    const low = at(0, 0) * (1 - tx) + at(1, 0) * tx;
    const high = at(0, 1) * (1 - tx) + at(1, 1) * tx;
    return low * (1 - ty) + high * ty;
  };
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const value = Math.round(244 + (coarse(x, y) - 0.5) * 14 + (hash(x, y) - 0.5) * 3);
      const offset = (y * size + x) * 4;
      pixels[offset] = value;
      pixels[offset + 1] = value - 2;
      pixels[offset + 2] = value - 4;
      pixels[offset + 3] = 255;
    }
  }
  const texture = new DataTexture(pixels, size, size, RGBAFormat);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

function createMaterials() {
  const grain = parchmentGrain();
  return {
    grain,
    parchment: new MeshStandardMaterial({ color: '#e4ddcf', roughness: 0.9 }),
    architecture: new MeshStandardMaterial({
      color: '#d9cdbb',
      roughness: 0.96,
      vertexColors: true,
      map: grain,
    }),
    ground: new MeshStandardMaterial({
      color: '#d2c5b2',
      roughness: 0.99,
      vertexColors: true,
      map: grain,
    }),
    mineral: new MeshStandardMaterial({
      color: '#c5b7a2',
      roughness: 0.97,
      vertexColors: true,
      map: grain,
    }),
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

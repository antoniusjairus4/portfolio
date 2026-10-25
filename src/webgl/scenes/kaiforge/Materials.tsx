import { createContext, type ReactNode, useContext, useEffect, useMemo } from 'react';
import {
  DataTexture,
  LinearFilter,
  LinearMipmapLinearFilter,
  LineBasicMaterial,
  MeshBasicMaterial,
  MeshStandardMaterial,
  RepeatWrapping,
  RGBAFormat,
  SRGBColorSpace,
} from 'three';
import { withGroundContactShadows } from './groundContactShadows';
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
      const value = Math.round(247 + (coarse(x, y) - 0.5) * 7 + (hash(x, y) - 0.5) * 2);
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
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

/** Shared linear data: red is micro-height, green is roughness. No downloaded maps. */
function surfaceFinish() {
  const size = 128;
  const pixels = new Uint8Array(size * size * 4);
  let seed = 719;
  for (let i = 0; i < size * size; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const grain = seed / 4294967296;
    pixels[i * 4] = Math.round(110 + grain * 36);
    pixels[i * 4 + 1] = Math.round(228 + grain * 27);
    pixels[i * 4 + 2] = 255;
    pixels[i * 4 + 3] = 255;
  }
  const texture = new DataTexture(pixels, size, size, RGBAFormat);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

function createMaterials() {
  const grain = parchmentGrain();
  const finish = surfaceFinish();
  return {
    grain,
    finish,
    parchment: new MeshStandardMaterial({ color: PALETTE.parchment, roughness: 0.86 }),
    markings: new MeshStandardMaterial({ color: '#f6f3e9', roughness: 0.88 }),
    ceiling: new MeshStandardMaterial({ color: '#111111', roughness: 0.96 }),
    reveal: new MeshStandardMaterial({ color: '#a69a83', roughness: 0.94 }),
    ball: new MeshStandardMaterial({
      color: '#f8f5eb',
      roughness: 0.58,
      metalness: 0,
      roughnessMap: finish,
      bumpMap: finish,
      bumpScale: 0.00008,
    }),
    architecture: new MeshStandardMaterial({
      color: '#7d817d',
      roughness: 0.97,
      vertexColors: true,
      map: grain,
      roughnessMap: finish,
      bumpMap: finish,
      bumpScale: 0.003,
    }),
    ground: withGroundContactShadows(
      new MeshStandardMaterial({
        color: PALETTE.courtFloor,
        roughness: 0.84,
        metalness: 0,
        vertexColors: true,
        map: grain,
        roughnessMap: finish,
        bumpMap: finish,
        bumpScale: 0.002,
      }),
    ),
    mineral: new MeshStandardMaterial({
      color: '#666c68',
      roughness: 0.9,
      vertexColors: true,
      map: grain,
      roughnessMap: finish,
      bumpMap: finish,
      bumpScale: 0.004,
    }),
    wallPanel: new MeshStandardMaterial({
      color: '#737a76',
      roughness: 0.94,
      emissive: '#171b19',
      emissiveIntensity: 0.18,
    }),
    wallInset: new MeshStandardMaterial({
      color: '#353b39',
      roughness: 0.98,
      emissive: '#111514',
      emissiveIntensity: 0.12,
    }),
    wallLedge: new MeshStandardMaterial({
      color: '#727873',
      metalness: 0.22,
      roughness: 0.65,
    }),
    wallTrim: new MeshStandardMaterial({ color: '#b4b5ac', metalness: 0.12, roughness: 0.72 }),
    wallAccent: new MeshStandardMaterial({
      color: PALETTE.crimson,
      emissive: PALETTE.crimson,
      emissiveIntensity: 0.45,
      roughness: 0.55,
    }),
    ink: new MeshStandardMaterial({ color: PALETTE.ink, roughness: 0.78, metalness: 0.12 }),
    skin: new MeshStandardMaterial({ color: '#ad9c87', roughness: 0.95 }),
    table: new MeshStandardMaterial({
      color: '#183d2b',
      roughness: 0.87,
      vertexColors: true,
      metalness: 0,
      roughnessMap: finish,
      bumpMap: finish,
      bumpScale: 0.00035,
    }),
    net: new LineBasicMaterial({ color: '#343530' }),
    trace: new MeshBasicMaterial({ color: '#aba18e' }),
    echo: new MeshBasicMaterial({ color: '#746f62' }),
    crimson: new MeshBasicMaterial({ color: PALETTE.crimson }),
    contact: new MeshBasicMaterial({
      color: PALETTE.ink,
      transparent: true,
      opacity: 0.13,
      depthWrite: false,
    }),
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

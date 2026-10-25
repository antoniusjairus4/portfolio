import { createContext, type ReactNode, useContext, useEffect, useMemo } from 'react';
import {
  Color,
  DataTexture,
  LinearFilter,
  LinearMipmapLinearFilter,
  RepeatWrapping,
  RGBAFormat,
  SRGBColorSpace,
} from 'three';
import { ROOM_PALETTE } from './palette';

type Finish = 'plaster' | 'wood' | 'paper' | 'ceramic' | 'fabric' | 'metal' | 'stone';
type Maps = Record<Finish, DataTexture> & { woodTone: DataTexture; stoneTone: DataTexture };
const SurfaceContext = createContext<Maps | null>(null);

function stoneNoise(x: number, y: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const easeX = fx * fx * (3 - 2 * fx);
  const easeY = fy * fy * (3 - 2 * fy);
  const hash = (px: number, py: number) => {
    const value = Math.sin(px * 127.1 + py * 311.7) * 43758.5453;
    return value - Math.floor(value);
  };
  const low = hash(ix, iy) * (1 - easeX) + hash(ix + 1, iy) * easeX;
  const high = hash(ix, iy + 1) * (1 - easeX) + hash(ix + 1, iy + 1) * easeX;
  return low * (1 - easeY) + high * easeY;
}

function stoneMap(albedo: boolean) {
  const size = 256;
  const pixels = new Uint8Array(size * size * 4);
  const base = new Color(ROOM_PALETTE.floor);
  const secondary = new Color(ROOM_PALETTE.stoneSecondary);
  const veinColor = new Color(ROOM_PALETTE.stoneVein);
  const warmVein = new Color(ROOM_PALETTE.stoneWarmVein);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / (size - 1);
      const v = y / (size - 1);
      const cloud = stoneNoise(u * 3.2, v * 2.8);
      const flow = v * 1.65 + u * 0.38 + (stoneNoise(u * 3.5, v * 3.5) - 0.5) * 0.27;
      const distance = Math.abs(flow - Math.round(flow));
      const vein = Math.exp(-((distance / 0.015) ** 2));
      const branch = Math.exp(-(((distance - 0.07) / 0.012) ** 2)) * 0.3;
      const offset = (y * size + x) * 4;
      if (albedo) {
        const stone = base.clone().lerp(secondary, Math.max(0, (0.64 - cloud) * 1.5));
        stone.lerp(warmVein, branch);
        stone.lerp(veinColor, vein * 0.78);
        // The albedo map multiplies the base material: encode the ratio so the
        // visible stone reaches the palette colours instead of washing them out.
        stone.r /= base.r;
        stone.g /= base.g;
        stone.b /= base.b;
        stone.convertLinearToSRGB();
        pixels[offset] = Math.round(Math.min(1, stone.r) * 255);
        pixels[offset + 1] = Math.round(Math.min(1, stone.g) * 255);
        pixels[offset + 2] = Math.round(Math.min(1, stone.b) * 255);
      } else {
        const height = Math.round(132 + (cloud - 0.5) * 15 - vein * 10);
        pixels[offset] = height;
        pixels[offset + 1] = height;
        pixels[offset + 2] = height;
      }
      pixels[offset + 3] = 255;
    }
  }
  const texture = new DataTexture(pixels, size, size, RGBAFormat);
  texture.generateMipmaps = true;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  if (albedo) texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function grain(finish: Finish, albedo = false) {
  const size = 128;
  const pixels = new Uint8Array(size * size * 4);
  let seed = 417;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const noise = seed / 4294967296 - 0.5;
      const wave = Math.sin((x * Math.PI) / 8 + Math.sin((y * Math.PI) / 64) * 0.5);
      const weave = Math.sin((x * Math.PI) / 2) * Math.sin((y * Math.PI) / 2);
      const structure =
        finish === 'wood'
          ? wave * 22
          : finish === 'fabric'
            ? weave * 34
            : Math.sin((x * Math.PI) / 32) * Math.sin((y * Math.PI) / 32) * 8;
      const at = (y * size + x) * 4;
      pixels[at] = Math.round(128 + structure + noise * 25);
      pixels[at + 1] = Math.round(235 + noise * 18);
      pixels[at + 2] = pixels[at];
      pixels[at + 3] = 255;
      if (albedo) {
        const tone = Math.round(237 + structure * 0.48 + noise * 6);
        pixels[at] = tone;
        pixels[at + 1] = Math.max(0, tone - 6);
        pixels[at + 2] = Math.max(0, tone - 12);
      }
    }
  }
  const texture = new DataTexture(pixels, size, size, RGBAFormat);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(finish === 'wood' ? 2 : 4, finish === 'wood' ? 6 : 4);
  texture.generateMipmaps = true;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  if (albedo) texture.colorSpace = SRGBColorSpace;
  return texture;
}

export function DomesticSurfaces({ children }: { children: ReactNode }) {
  const maps = useMemo(
    () =>
      ({
        ...Object.fromEntries(
          (['plaster', 'wood', 'paper', 'ceramic', 'fabric', 'metal'] as Finish[]).map((finish) => [
            finish,
            grain(finish),
          ]),
        ),
        woodTone: grain('wood', true),
        stone: stoneMap(false),
        stoneTone: stoneMap(true),
      }) as Maps,
    [],
  );
  useEffect(
    () => () => {
      Object.values(maps).forEach((map) => {
        map.dispose();
      });
    },
    [maps],
  );
  return <SurfaceContext.Provider value={maps}>{children}</SurfaceContext.Provider>;
}

export function Surface({
  color,
  finish = 'wood',
  vertexColors = false,
}: {
  color: string;
  finish?: Finish;
  vertexColors?: boolean;
}) {
  const maps = useContext(SurfaceContext);
  const bump = {
    plaster: 0.018,
    wood: 0.011,
    paper: 0.0025,
    ceramic: 0.0015,
    fabric: 0.014,
    metal: 0.001,
    stone: 0.003,
  }[finish];
  const roughness = {
    plaster: 0.93,
    wood: 0.82,
    paper: 1,
    ceramic: 0.6,
    fabric: 1,
    metal: 0.58,
    stone: 0.64,
  }[finish];
  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={finish === 'metal' ? 0.65 : 0}
      map={finish === 'wood' ? maps?.woodTone : finish === 'stone' ? maps?.stoneTone : undefined}
      bumpMap={maps?.[finish]}
      bumpScale={bump}
      roughnessMap={finish === 'stone' ? undefined : maps?.[finish]}
      vertexColors={vertexColors}
    />
  );
}

/** Quiet contact occlusion also grounds small objects on the portrait render path. */
export function ContactPatch({
  position,
  size,
  opacity = 0.16,
}: {
  position: [number, number, number];
  size: [number, number];
  opacity?: number;
}) {
  const texture = useMemo(() => {
    const pixels = new Uint8Array(64 * 64 * 4);
    for (let y = 0; y < 64; y++)
      for (let x = 0; x < 64; x++) {
        const r = Math.hypot((x - 31.5) / 31.5, (y - 31.5) / 31.5);
        const a = Math.max(0, 1 - r);
        const at = (y * 64 + x) * 4;
        pixels[at] = pixels[at + 1] = pixels[at + 2] = 255;
        pixels[at + 3] = Math.round(a * a * 255);
      }
    const map = new DataTexture(pixels, 64, 64, RGBAFormat);
    map.magFilter = LinearFilter;
    map.needsUpdate = true;
    return map;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={size} />
      <meshBasicMaterial
        map={texture}
        color="#111111"
        transparent
        opacity={opacity}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import {
  DataTexture,
  LinearFilter,
  LinearMipmapLinearFilter,
  RepeatWrapping,
  RGBAFormat,
} from 'three';

type Finish = 'plaster' | 'wood' | 'paper' | 'ceramic' | 'fabric' | 'metal';
type Maps = Record<Finish, DataTexture>;
const SurfaceContext = createContext<Maps | null>(null);

function grain(finish: Finish) {
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
    }
  }
  const texture = new DataTexture(pixels, size, size, RGBAFormat);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(finish === 'wood' ? 2 : 4, finish === 'wood' ? 6 : 4);
  texture.generateMipmaps = true;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

export function DomesticSurfaces({ children }: { children: ReactNode }) {
  const maps = useMemo(
    () =>
      Object.fromEntries(
        (['plaster', 'wood', 'paper', 'ceramic', 'fabric', 'metal'] as Finish[]).map((finish) => [
          finish,
          grain(finish),
        ]),
      ) as Maps,
    [],
  );
  useEffect(
    () => () => {
      Object.values(maps).forEach((map) => map.dispose());
    },
    [maps],
  );
  return <SurfaceContext.Provider value={maps}>{children}</SurfaceContext.Provider>;
}

export function Surface({ color, finish = 'wood' }: { color: string; finish?: Finish }) {
  const maps = useContext(SurfaceContext);
  const bump = {
    plaster: 0.022,
    wood: 0.009,
    paper: 0.005,
    ceramic: 0.003,
    fabric: 0.018,
    metal: 0.001,
  }[finish];
  const roughness = { plaster: 0.98, wood: 0.84, paper: 1, ceramic: 0.49, fabric: 1, metal: 0.62 }[
    finish
  ];
  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={finish === 'metal' ? 0.55 : 0}
      bumpMap={maps?.[finish]}
      bumpScale={bump}
      roughnessMap={maps?.[finish]}
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

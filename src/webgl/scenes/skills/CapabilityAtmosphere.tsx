'use client';

import { useEffect, useMemo } from 'react';
import { CanvasTexture, LinearFilter, SRGBColorSpace } from 'three';

type Placement = { x: number; y: number; z: number; rotation: number };

const GHOST_WORDS = ['CODE', 'WEB', 'SYSTEMS', 'SECURITY', 'TOOLS', 'INTELLIGENCE'];
export const ENVIRONMENT_ACCENTS = [
  '#7694a8',
  '#4ea7b5',
  '#6f9478',
  '#8a3442',
  '#a78351',
  '#776a9e',
];

function makeTexture(
  width: number,
  height: number,
  draw: (context: CanvasRenderingContext2D) => void,
) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (context) draw(context);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  return texture;
}

function makeGhostTexture(word: string) {
  return makeTexture(1024, 256, (context) => {
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#e4eced';
    let size = 210;
    do {
      context.font = `600 ${size}px "Clash Display", sans-serif`;
      if (context.measureText(word).width < 1010) break;
      size -= 4;
    } while (size > 100);
    context.fillText(word, 512, 132);
  });
}

function makeHaloTexture() {
  return makeTexture(256, 256, (context) => {
    const halo = context.createRadialGradient(128, 128, 6, 128, 128, 128);
    halo.addColorStop(0, 'rgba(255,255,255,0.68)');
    halo.addColorStop(0.33, 'rgba(255,255,255,0.23)');
    halo.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = halo;
    context.fillRect(0, 0, 256, 256);
  });
}

function makeShaftTexture() {
  return makeTexture(64, 512, (context) => {
    const width = context.createLinearGradient(0, 0, 64, 0);
    width.addColorStop(0, 'rgba(255,255,255,0)');
    width.addColorStop(0.5, 'rgba(255,255,255,0.7)');
    width.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = width;
    context.fillRect(0, 0, 64, 512);
    context.globalCompositeOperation = 'destination-in';
    const length = context.createLinearGradient(0, 0, 0, 512);
    length.addColorStop(0, 'rgba(255,255,255,0)');
    length.addColorStop(0.25, 'rgba(255,255,255,0.9)');
    length.addColorStop(0.76, 'rgba(255,255,255,0.4)');
    length.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = length;
    context.fillRect(0, 0, 64, 512);
  });
}

export function CapabilityAtmosphere({
  portrait,
  placements,
}: {
  portrait: boolean;
  placements: readonly Placement[];
}) {
  const halo = useMemo(makeHaloTexture, []);
  const shaft = useMemo(() => (portrait ? null : makeShaftTexture()), [portrait]);
  const ghosts = useMemo(() => (portrait ? [] : GHOST_WORDS.map(makeGhostTexture)), [portrait]);

  useEffect(
    () => () => {
      halo.dispose();
      shaft?.dispose();
      ghosts.forEach((texture) => {
        texture.dispose();
      });
    },
    [halo, shaft, ghosts],
  );

  return (
    <group name="capability-atmosphere">
      {placements.map((placement, index) => {
        const side = index % 2 === 0 ? -1 : 1;
        return (
          <group key={placement.z}>
            <mesh position={[placement.x, 0.4, placement.z - 1.6]}>
              <planeGeometry args={[portrait ? 7 : 11, portrait ? 5 : 7]} />
              <meshBasicMaterial
                map={halo}
                color={ENVIRONMENT_ACCENTS[index]}
                transparent
                opacity={portrait ? 0.12 : 0.16}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
            {!portrait && shaft && (
              <mesh position={[placement.x + side * 3.7, 1.2, placement.z - 4.8]}>
                <planeGeometry args={[1.5, 8.5]} />
                <meshBasicMaterial
                  map={shaft}
                  color="#7694a8"
                  transparent
                  opacity={0.07}
                  depthWrite={false}
                  toneMapped={false}
                />
              </mesh>
            )}
            {!portrait && ghosts[index] && (
              <mesh position={[side * 5.7, 1.5, placement.z - 7]}>
                <planeGeometry args={[14, 3.5]} />
                <meshBasicMaterial
                  map={ghosts[index]}
                  transparent
                  opacity={0.055}
                  depthWrite={false}
                  toneMapped={false}
                />
              </mesh>
            )}
            {!portrait && (
              <>
                <mesh position={[-10.5, 1.2, placement.z - 12]}>
                  <boxGeometry args={[1.7, 8.2, 0.75]} />
                  <meshStandardMaterial color="#10202a" roughness={1} metalness={0.05} />
                </mesh>
                <mesh position={[11.4, 0.1, placement.z - 15]}>
                  <boxGeometry args={[2.1, 6.1, 0.9]} />
                  <meshStandardMaterial color="#0d1b24" roughness={1} metalness={0.05} />
                </mesh>
              </>
            )}
          </group>
        );
      })}
    </group>
  );
}

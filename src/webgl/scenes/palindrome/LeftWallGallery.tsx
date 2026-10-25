import { useTexture } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import { SRGBColorSpace } from 'three';

const PAINTING_PLACEMENTS = [
  [3.8, 1.05],
  [3.8, -1.25],
  [1.9, 1.05],
  [1.9, -1.25],
] as const;
const ART_WIDTH = 0.82;
const ART_HEIGHT = 1.1;
const HANGER_SPAN = 0.23;
const HANGER_RISE = 0.21;
const WIRE_LENGTH = Math.hypot(HANGER_SPAN, HANGER_RISE);
const WIRE_ANGLE = Math.atan2(HANGER_SPAN, HANGER_RISE);

export function LeftWallGallery() {
  const atlas = useTexture('/images/palindrome/left-wall-paintings.png');
  const paintings = useMemo(
    () =>
      PAINTING_PLACEMENTS.map((_, index) => {
        const texture = atlas.clone();
        texture.colorSpace = SRGBColorSpace;
        texture.offset.set(index / PAINTING_PLACEMENTS.length, 0);
        texture.repeat.set(1 / PAINTING_PLACEMENTS.length, 1);
        texture.needsUpdate = true;
        return texture;
      }),
    [atlas],
  );

  useEffect(
    () => () => {
      paintings.forEach((texture) => {
        texture.dispose();
      });
    },
    [paintings],
  );

  return (
    <group name="PL_LeftWallGallery">
      {PAINTING_PLACEMENTS.map(([y, z], index) => (
        <group key={`${y}:${z}`} position={[-4.34, y, z]} rotation={[0, Math.PI / 2, 0]}>
          <mesh position={[0, ART_HEIGHT / 2 + 0.29, 0.04]}>
            <sphereGeometry args={[0.025, 8, 6]} />
            <meshStandardMaterial color="#8c7658" metalness={0.45} roughness={0.6} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh
              key={side}
              position={[(side * HANGER_SPAN) / 2, ART_HEIGHT / 2 + 0.055 + HANGER_RISE / 2, 0.055]}
              rotation={[0, 0, side * WIRE_ANGLE]}
            >
              <cylinderGeometry args={[0.0035, 0.0035, WIRE_LENGTH, 5]} />
              <meshStandardMaterial color="#8c7658" metalness={0.3} roughness={0.7} />
            </mesh>
          ))}
          <mesh castShadow receiveShadow position={[0, 0, 0.045]}>
            <boxGeometry args={[ART_WIDTH + 0.13, ART_HEIGHT + 0.13, 0.09]} />
            <meshStandardMaterial color="#30251c" roughness={0.83} />
          </mesh>
          <mesh position={[0, 0, 0.094]}>
            <planeGeometry args={[ART_WIDTH + 0.035, ART_HEIGHT + 0.035]} />
            <meshStandardMaterial color="#b59d78" roughness={0.95} />
          </mesh>
          <mesh position={[0, 0, 0.097]}>
            <planeGeometry args={[ART_WIDTH, ART_HEIGHT]} />
            <meshStandardMaterial map={paintings[index]} color="#E6DED1" roughness={0.89} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

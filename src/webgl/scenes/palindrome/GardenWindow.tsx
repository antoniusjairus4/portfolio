import { useFrame } from '@react-three/fiber';
import { type MutableRefObject, useEffect, useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  Color,
  DataTexture,
  Float32BufferAttribute,
  LinearFilter,
  Object3D,
  PlaneGeometry,
  RGBAFormat,
  type SpotLight,
} from 'three';

const FOLIAGE = [
  [-4.24, 2.52, -5.65, 0.52, 0.8, 0.38, '#496f4b'],
  [-3.96, 2.93, -5.7, 0.54, 0.66, 0.38, '#628a55'],
  [-3.58, 2.62, -5.78, 0.48, 0.7, 0.35, '#759b5d'],
  [-2.45, 2.6, -5.85, 0.57, 0.74, 0.38, '#547d50'],
  [-2.7, 3.03, -5.9, 0.43, 0.63, 0.36, '#6d965e'],
  [-3.98, 1.83, -4.28, 0.55, 0.36, 0.3, '#3d6849'],
  [-3.38, 1.83, -4.5, 0.46, 0.32, 0.28, '#558052'],
  [-2.7, 1.83, -4.26, 0.55, 0.35, 0.3, '#4e7650'],
] as const;

const BLOOMS = [
  [-3.86, 2.02, -4.12, '#fff1d6'],
  [-3.57, 2.14, -4.3, '#f6d8b9'],
  [-3.13, 1.99, -4.17, '#fff5db'],
  [-2.77, 2.11, -4.25, '#e9c7aa'],
  [-3.4, 1.9, -4.03, '#f9edd0'],
] as const;

function createSky() {
  const skyHeight = 4.6;
  const geometry = new PlaneGeometry(13, skyHeight, 1, 12);
  const positions = geometry.getAttribute('position');
  const colors: number[] = [];
  const low = new Color('#f3e9c9');
  const high = new Color('#8ec2dc');
  for (let i = 0; i < positions.count; i++) {
    const t = Math.min(1, Math.max(0, (positions.getY(i) + skyHeight / 2) / skyHeight));
    const color = low.clone().lerp(high, t ** 0.78);
    colors.push(color.r, color.g, color.b);
  }
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  return geometry;
}

function createSunGlow() {
  const size = 64;
  const pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const distance = Math.hypot(
        (x + 0.5 - size / 2) / (size / 2),
        (y + 0.5 - size / 2) / (size / 2),
      );
      const alpha = Math.max(0, 1 - distance);
      const offset = (y * size + x) * 4;
      pixels[offset] = 255;
      pixels[offset + 1] = 237;
      pixels[offset + 2] = 184;
      pixels[offset + 3] = Math.round(alpha * alpha * 255);
    }
  }
  const texture = new DataTexture(pixels, size, size, RGBAFormat);
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

export function GardenWindow({
  transitionProgress,
}: {
  transitionProgress?: MutableRefObject<number>;
}) {
  const sky = useMemo(createSky, []);
  const glow = useMemo(createSunGlow, []);
  const sunbeam = useRef<SpotLight>(null);
  const sunTarget = useMemo(() => {
    const target = new Object3D();
    target.position.set(-1.15, 1.05, -0.35);
    return target;
  }, []);
  useEffect(
    () => () => {
      sky.dispose();
      glow.dispose();
    },
    [sky, glow],
  );
  useFrame(() => {
    if (!sunbeam.current || !transitionProgress) return;
    const t = Math.min(1, Math.max(0, (transitionProgress.current - 0.69) / 0.2));
    sunbeam.current.intensity = 18 * t * t * (3 - 2 * t);
  });

  return (
    <group name="PL_DaylightGarden">
      {/* The backdrop stays far enough behind the real aperture for camera parallax. */}
      <mesh geometry={sky} position={[-3.55, 2.55, -9.5]}>
        <meshBasicMaterial vertexColors toneMapped={false} />
      </mesh>
      <mesh position={[-4.3, 1.45, -8.1]} scale={[2.5, 0.66, 0.45]}>
        <sphereGeometry args={[1, 20, 10]} />
        <meshBasicMaterial color="#9db482" />
      </mesh>
      <mesh position={[-2.4, 1.38, -7.7]} scale={[2.1, 0.62, 0.42]}>
        <sphereGeometry args={[1, 20, 10]} />
        <meshBasicMaterial color="#789d71" />
      </mesh>
      <mesh position={[-3.48, 1.58, -4.8]} scale={[1.4, 0.32, 0.5]}>
        <sphereGeometry args={[1, 20, 10]} />
        <meshBasicMaterial color="#456e4c" />
      </mesh>
      {[-4.14, -2.54].map((x) => (
        <mesh key={x} position={[x, 1.84, -5.82]}>
          <cylinderGeometry args={[0.085, 0.12, 1.42, 8]} />
          <meshBasicMaterial color="#78583c" />
        </mesh>
      ))}
      {FOLIAGE.map(([x, y, z, sx, sy, sz, color]) => (
        <mesh key={`${x}:${y}:${z}`} position={[x, y, z]} scale={[sx, sy, sz]}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
      {BLOOMS.map(([x, y, z, color]) => (
        <group key={`${x}:${y}:${z}`} position={[x, y, z]}>
          <mesh position={[0, -0.12, 0]}>
            <cylinderGeometry args={[0.012, 0.016, 0.25, 5]} />
            <meshBasicMaterial color="#3d6a48" />
          </mesh>
          <mesh scale={[0.075, 0.07, 0.03]}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshBasicMaterial color={color} />
          </mesh>
          <mesh position={[0, 0, 0.031]}>
            <sphereGeometry args={[0.018, 8, 6]} />
            <meshBasicMaterial color="#e7b85f" />
          </mesh>
        </group>
      ))}
      <mesh position={[-3.25, 3.3, -6.98]}>
        <planeGeometry args={[2.4, 2.4]} />
        <meshBasicMaterial
          map={glow}
          transparent
          opacity={0.85}
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[-3.25, 3.3, -6.95]}>
        <circleGeometry args={[0.29, 32]} />
        <meshBasicMaterial color="#fff8dc" toneMapped={false} />
      </mesh>
      <mesh position={[-2.75, 2.72, -2.58]}>
        <planeGeometry args={[2.25, 2.6]} />
        <meshBasicMaterial
          map={glow}
          transparent
          opacity={0.16}
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <primitive object={sunTarget} />
      <spotLight
        ref={sunbeam}
        position={[-3.1, 3.6, -3.85]}
        target={sunTarget}
        color="#ffe9bc"
        intensity={transitionProgress ? 0 : 18}
        angle={0.48}
        penumbra={0.72}
        distance={6.5}
        decay={2}
        castShadow
        shadow-mapSize={[512, 512]}
        shadow-camera-near={0.2}
        shadow-camera-far={7}
        shadow-normalBias={0.008}
        shadow-bias={-0.00015}
        shadow-radius={4}
      />
    </group>
  );
}

import { DoubleSide } from 'three';
import { ROOM_PALETTE } from './palette';
import { RIGHT_WINDOW_CENTERS } from './roomLayout';

function WindowFrame({ z }: { z: number }) {
  return (
    <group position={[4.42, 3, z]} rotation={[0, -Math.PI / 2, 0]}>
      {/* The frame straddles the real wall aperture instead of hanging on it. */}
      {[-0.52, 0.52].map((x) => (
        <mesh key={x} position={[x, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.095, 1.17, 0.28]} />
          <meshStandardMaterial color={ROOM_PALETTE.timber} roughness={0.78} />
        </mesh>
      ))}
      {[-0.54, 0.54].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.14, 0.095, 0.28]} />
          <meshStandardMaterial color={ROOM_PALETTE.timber} roughness={0.78} />
        </mesh>
      ))}
      <mesh position={[0, -0.55, 0.15]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.07, 0.25]} />
        <meshStandardMaterial color="#b6ae99" roughness={0.86} />
      </mesh>
      <mesh position={[0, 0, -0.085]}>
        <planeGeometry args={[0.94, 0.97]} />
        <meshPhysicalMaterial
          color="#c9ddd3"
          roughness={0.18}
          metalness={0.08}
          transparent
          opacity={0.11}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>
      <pointLight
        position={[0, 0.24, -0.22]}
        color="#e1e6ce"
        intensity={0.34}
        distance={1.7}
        decay={2}
      />
    </group>
  );
}

export function RightWallWindows() {
  return (
    <group name="PL_RightWallWindows">
      {/* Broad exterior layers cover both sightlines through the wall. */}
      <mesh position={[7.1, 3.1, -3.5]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[30, 5]} />
        <meshBasicMaterial color="#b9cec6" side={DoubleSide} toneMapped={false} />
      </mesh>
      <mesh position={[5.5, 2.35, -2]} scale={[0.52, 0.72, 4.7]}>
        <sphereGeometry args={[1, 16, 10]} />
        <meshBasicMaterial color="#809c82" />
      </mesh>
      <mesh position={[5.05, 2.05, -1.8]} scale={[0.43, 0.4, 3.5]}>
        <sphereGeometry args={[1, 14, 8]} />
        <meshBasicMaterial color="#66866d" />
      </mesh>
      {[-2.1, 0.05].map((z) => (
        <group key={z} position={[4.95, 2.88, z]}>
          <mesh position={[0, -0.36, 0]}>
            <cylinderGeometry args={[0.045, 0.062, 0.8, 7]} />
            <meshBasicMaterial color="#6b654f" />
          </mesh>
          <mesh scale={[0.29, 0.42, 0.34]}>
            <icosahedronGeometry args={[1, 1]} />
            <meshBasicMaterial color="#587c64" />
          </mesh>
        </group>
      ))}
      {RIGHT_WINDOW_CENTERS.map((z) => (
        <WindowFrame key={z} z={z} />
      ))}
    </group>
  );
}

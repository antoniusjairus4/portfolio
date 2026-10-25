import { Line } from '@react-three/drei';
import type { ReactNode } from 'react';
import { RIGHT_NICHE_CENTERS } from './roomLayout';

function Niche({ z, children }: { z: number; children: ReactNode }) {
  return (
    <group position={[4.42, 2.75, z]} rotation={[0, -Math.PI / 2, 0]}>
      <mesh position={[0, 0, 0.006]} receiveShadow>
        <planeGeometry args={[0.82, 2.07]} />
        <meshStandardMaterial color="#252A27" roughness={0.96} />
      </mesh>
      <mesh position={[0, 1.005, 0.034]}>
        <boxGeometry args={[0.58, 0.012, 0.012]} />
        <meshStandardMaterial
          color="#8D8069"
          emissive="#C9AD83"
          emissiveIntensity={0.16}
          roughness={0.86}
        />
      </mesh>
      <pointLight
        position={[0, 0.86, 0.04]}
        color="#E9D8BD"
        intensity={0.42}
        distance={1.55}
        decay={2}
      />
      {children}
    </group>
  );
}

function ReceiptMemory() {
  return (
    <group position={[0, -0.05, 0.03]}>
      <mesh position={[-0.095, 0.13, 0]} rotation={[0, 0, 0.055]}>
        <planeGeometry args={[0.36, 0.98]} />
        <meshStandardMaterial color="#9F9A89" roughness={1} />
      </mesh>
      <mesh position={[0.105, -0.19, 0.006]} rotation={[0, 0, -0.075]}>
        <planeGeometry args={[0.24, 0.64]} />
        <meshStandardMaterial color="#657369" roughness={1} />
      </mesh>
      {[-0.21, -0.12, 0.02, 0.11, 0.25].map((y, index) => (
        <mesh key={y} position={[-0.105 + (index % 2) * 0.012, y + 0.16, 0.009]}>
          <planeGeometry args={[index === 2 ? 0.14 : 0.22, 0.009]} />
          <meshBasicMaterial color="#D5C8AC" />
        </mesh>
      ))}
      <mesh position={[0.14, -0.37, 0.013]}>
        <planeGeometry args={[0.115, 0.012]} />
        <meshBasicMaterial color="#BBAA8A" />
      </mesh>
    </group>
  );
}

function PatternMemory() {
  return (
    <group position={[0, 0, 0.025]}>
      <Line
        points={[
          [-0.29, -0.38, 0],
          [-0.21, -0.16, 0],
          [-0.12, -0.22, 0],
          [-0.035, 0.08, 0],
          [0.06, 0.02, 0],
          [0.16, 0.3, 0],
          [0.29, 0.22, 0],
        ]}
        color="#A7B19E"
        lineWidth={1.6}
      />
      <Line
        points={[
          [-0.28, -0.58, 0],
          [-0.12, -0.43, 0],
          [0.02, -0.48, 0],
          [0.15, -0.32, 0],
          [0.28, -0.33, 0],
        ]}
        color="#596D60"
        lineWidth={1}
      />
      {[
        [-0.21, -0.16],
        [-0.035, 0.08],
        [0.16, 0.3],
      ].map(([x, y]) => (
        <mesh key={x} position={[x, y, 0.006]}>
          <circleGeometry args={[0.014, 12]} />
          <meshBasicMaterial color="#D9D0BC" />
        </mesh>
      ))}
    </group>
  );
}

function IdentityMemory() {
  const strokes = [
    [-0.16, 0.01, 0.055, 0.76],
    [0.01, 0.365, 0.37, 0.055],
    [0.17, 0.19, 0.055, 0.35],
    [0.01, 0.015, 0.37, 0.055],
  ] as const;
  return (
    <group position={[0, 0, 0.035]}>
      {strokes.map(([x, y, width, height]) => (
        <mesh key={`${x}:${y}`} position={[x, y, 0]}>
          <boxGeometry args={[width, height, 0.014]} />
          <meshStandardMaterial color="#C8BEA9" roughness={0.86} metalness={0.08} />
        </mesh>
      ))}
      <mesh position={[0.07, -0.47, 0]}>
        <boxGeometry args={[0.19, 0.011, 0.012]} />
        <meshStandardMaterial color="#7F927D" roughness={0.92} />
      </mesh>
    </group>
  );
}

export function FinancialMemoryWall() {
  return (
    <group name="PL_FinancialMemoryWall">
      <Niche z={RIGHT_NICHE_CENTERS[0]}>
        <ReceiptMemory />
      </Niche>
      <Niche z={RIGHT_NICHE_CENTERS[1]}>
        <PatternMemory />
      </Niche>
      <Niche z={RIGHT_NICHE_CENTERS[2]}>
        <IdentityMemory />
      </Niche>
    </group>
  );
}

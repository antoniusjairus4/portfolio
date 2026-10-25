'use client';

import { useEffect, useMemo } from 'react';
import {
  BufferGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Line,
  LineBasicMaterial,
  PlaneGeometry,
} from 'three';

function terrainHeight(x: number, z: number) {
  return (
    Math.sin(x * 0.23 + z * 0.038) * 0.12 +
    Math.cos(x * 0.43 - z * 0.024) * 0.075 +
    Math.sin(z * 0.15) * 0.035
  );
}

export function CapabilityTerrain({ portrait }: { portrait: boolean }) {
  const geometry = useMemo(() => {
    const plane = new PlaneGeometry(portrait ? 30 : 66, 172, portrait ? 16 : 32, 86);
    const positions = plane.getAttribute('position');
    for (let index = 0; index < positions.count; index += 1) {
      const x = positions.getX(index);
      const worldZ = -62 - positions.getY(index);
      positions.setZ(index, terrainHeight(x, worldZ));
    }
    positions.needsUpdate = true;
    plane.computeVertexNormals();
    return plane;
  }, [portrait]);
  const contours = useMemo(() => {
    const count = portrait ? 7 : 15;
    const longitudinal = Array.from({ length: count }, (_, index) => {
      const strand = (index - (count - 1) / 2) * (portrait ? 2.6 : 3.1);
      const points: number[] = [];
      for (let step = 0; step <= 86; step += 1) {
        const z = 23 - step * 2;
        const x = strand + Math.sin(z * 0.036 + index * 0.63) * (portrait ? 0.2 : 0.46);
        points.push(x, -2.685 + terrainHeight(x, z), z);
      }
      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new Float32BufferAttribute(points, 3));
      const material = new LineBasicMaterial({
        color: '#304754',
        transparent: true,
        opacity: index % 3 === 0 ? 0.34 : 0.22,
        toneMapped: false,
      });
      return { key: strand, object: new Line(geometry, material) };
    });
    const transverse = Array.from({ length: portrait ? 9 : 17 }, (_, index) => {
      const z = 18 - index * (portrait ? 18 : 10);
      const width = portrait ? 15 : 32;
      const points: number[] = [];
      for (let step = 0; step <= 28; step += 1) {
        const x = -width + (step / 28) * width * 2;
        points.push(x, -2.685 + terrainHeight(x, z), z);
      }
      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new Float32BufferAttribute(points, 3));
      const material = new LineBasicMaterial({
        color: '#233441',
        transparent: true,
        opacity: index % 4 === 0 ? 0.24 : 0.13,
        toneMapped: false,
      });
      return { key: `cross-${index}`, object: new Line(geometry, material) };
    });
    return [...longitudinal, ...transverse];
  }, [portrait]);
  useEffect(
    () => () => {
      geometry.dispose();
      contours.forEach(({ object }) => {
        object.geometry.dispose();
        object.material.dispose();
      });
    },
    [geometry, contours],
  );

  return (
    <group name="capability-terrain">
      <mesh
        position={[0, -2.72, -62]}
        rotation={[-Math.PI / 2, 0, 0]}
        geometry={geometry}
        receiveShadow
      >
        <meshStandardMaterial
          color="#1b2831"
          roughness={1}
          metalness={0.06}
          side={DoubleSide}
          flatShading
        />
      </mesh>
      {contours.map(({ key, object }) => (
        <primitive key={key} object={object} />
      ))}
    </group>
  );
}

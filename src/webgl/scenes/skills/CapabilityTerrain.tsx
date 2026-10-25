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
    return Array.from({ length: count }, (_, index) => {
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
        color: '#5d7680',
        transparent: true,
        opacity: index % 3 === 0 ? 0.2 : 0.1,
      });
      return { key: strand, object: new Line(geometry, material) };
    });
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
          color="#141b1f"
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

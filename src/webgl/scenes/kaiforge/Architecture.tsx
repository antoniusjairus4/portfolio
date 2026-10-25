import { useEffect, useMemo } from 'react';
import { type BufferGeometry, Float32BufferAttribute } from 'three';
import {
  GROUND_BOXES,
  OUTER_DESKTOP_BOXES,
  OUTER_PORTRAIT_BOXES,
  WALL_BOXES,
} from './architectureLayout';
import { boxes } from './geometry';
import { useKaiForgeMaterials } from './Materials';
import { WallDesign } from './WallDesign';

/** Face and depth tint for the architectural slabs. */
function tintSlabs(geometry: BufferGeometry, kind: 'ground' | 'wall' | 'outer') {
  const positions = geometry.getAttribute('position');
  const normals = geometry.getAttribute('normal');
  const colors: number[] = [];
  const surfaceUVs: number[] = [];
  for (let i = 0; i < positions.count; i++) {
    const nx = normals.getX(i);
    const ny = normals.getY(i);
    const nz = normals.getZ(i);
    const depth = Math.min(1, Math.max(0, (-positions.getZ(i) - 1) / 9));
    const height = Math.min(1, Math.max(0, positions.getY(i) / 7));
    const face = ny > 0.5 ? 1.06 : nx < -0.5 ? 0.79 : nx > 0.5 ? 0.91 : nz > 0.5 ? 1 : 0.75;
    const distance = 1 - depth * (kind === 'ground' ? 0.24 : 0.52);
    const vertical = kind === 'ground' ? 1 : 0.89 + height * 0.11;
    const shade = face * distance * vertical;
    colors.push(shade, shade * 0.995, shade * 0.985);
    // Face-projected material coordinates keep the grain at a consistent metre
    // scale on the approved slabs, instead of stretching it across each box.
    const x = positions.getX(i),
      y = positions.getY(i),
      z = positions.getZ(i);
    if (Math.abs(ny) > 0.5) surfaceUVs.push(x * 1.25, z * 1.25);
    else if (Math.abs(nx) > 0.5) surfaceUVs.push(z * 1.25, y * 1.25);
    else surfaceUVs.push(x * 1.25, y * 1.25);
  }
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  geometry.setAttribute('uv', new Float32BufferAttribute(surfaceUVs, 2));
  return geometry;
}

/** Unequal, inhabited architectural cuts, rather than a repeated rectangle tunnel. */
export function Architecture({ portrait }: { portrait: boolean }) {
  const materials = useKaiForgeMaterials();
  const ground = useMemo(() => tintSlabs(boxes(GROUND_BOXES), 'ground'), []);
  const walls = useMemo(() => tintSlabs(boxes(WALL_BOXES), 'wall'), []);
  const outerGeometry = useMemo(
    () => tintSlabs(boxes(portrait ? OUTER_PORTRAIT_BOXES : OUTER_DESKTOP_BOXES), 'outer'),
    [portrait],
  );
  useEffect(
    () => () => {
      ground.dispose();
      walls.dispose();
      outerGeometry.dispose();
    },
    [ground, walls, outerGeometry],
  );
  return (
    <group name="KF_Architecture">
      <mesh geometry={ground} receiveShadow>
        <primitive attach="material" object={materials.ground} />
      </mesh>
      <mesh geometry={walls} receiveShadow>
        <primitive attach="material" object={materials.architecture} />
      </mesh>
      <mesh geometry={outerGeometry}>
        <primitive attach="material" object={materials.mineral} />
      </mesh>
      <WallDesign />
    </group>
  );
}

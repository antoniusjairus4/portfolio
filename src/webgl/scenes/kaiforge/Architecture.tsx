import { useFrame } from '@react-three/fiber';
import { type MutableRefObject, useEffect, useMemo, useRef } from 'react';
import { type BufferGeometry, Float32BufferAttribute, type Group } from 'three';
import { type Box, boxes } from './geometry';
import { useKaiForgeMaterials } from './Materials';
import { impactPulse, releaseProgress } from './staging';

/** Face and depth tint for the existing slabs; no new geometry or texture download. */
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
export function Architecture({
  progress,
  portrait,
}: {
  progress: MutableRefObject<number>;
  portrait: boolean;
}) {
  const materials = useKaiForgeMaterials();
  const outer = useRef<Group>(null);
  const register = useRef<Group>(null);
  const ground = useMemo(
    () =>
      tintSlabs(
        boxes([
          [
            [-0.6, -0.18, 0.1],
            [8.4, 0.36, 7.2],
          ],
          [
            [-5.7, -0.34, -3],
            [1.35, 0.68, 13],
          ],
          [
            [5.3, -0.5, -5],
            [2.4, 1, 15],
          ],
        ]),
        'ground',
      ),
    [],
  );
  const walls = useMemo(
    () =>
      tintSlabs(
        boxes([
          [
            [-4.4, 3.5, -4.3],
            [2.1, 7, 0.48],
          ],
          [
            [2.9, 3, -5.8],
            [3.4, 6, 0.65],
          ],
          [
            [-0.9, 5.8, -7.8],
            [8, 0.48, 0.8],
          ],
          [
            [-6.5, 2.6, -8],
            [0.5, 5.2, 6],
          ],
        ]),
        'wall',
      ),
    [],
  );
  const outerGeometry = useMemo(
    () =>
      tintSlabs(
        boxes(
          (portrait
            ? [
                [
                  [2.8, 2.4, -3.2],
                  [0.28, 4.8, 0.8],
                ],
                [
                  [1.2, 4.8, -3.2],
                  [3.5, 0.28, 0.8],
                ],
              ]
            : [
                [
                  [4.4, 2.6, -1.4],
                  [0.38, 5.2, 1.1],
                ],
                [
                  [2.6, 5.2, -1.4],
                  [4, 0.38, 1.1],
                ],
                [
                  [-5, 1.5, -0.6],
                  [0.35, 3, 0.8],
                ],
              ]) as Box[],
        ),
        'outer',
      ),
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
  useFrame(() => {
    const release = releaseProgress(progress.current);
    if (outer.current) {
      outer.current.position.z = -release * 4;
      outer.current.visible = release < 0.99;
    }
    // One restrained registration shift on the contact axis; no idle motion.
    if (register.current) register.current.position.x = -0.07 * impactPulse(progress.current);
  });
  return (
    <group name="KF_Architecture">
      <mesh geometry={ground} receiveShadow>
        <primitive attach="material" object={materials.ground} />
      </mesh>
      <mesh geometry={walls}>
        <primitive attach="material" object={materials.architecture} />
      </mesh>
      <group ref={outer}>
        <mesh geometry={outerGeometry}>
          <primitive attach="material" object={materials.mineral} />
        </mesh>
      </group>
      <group ref={register} position={[0, 0, 0]}>
        <mesh position={[0.08, 2.8, -5.45]}>
          <boxGeometry args={[0.13, 5.6, 0.14]} />
          <primitive attach="material" object={materials.ink} />
        </mesh>
      </group>
    </group>
  );
}

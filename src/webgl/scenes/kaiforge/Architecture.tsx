import { useKaiForgeMaterials } from './Materials';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { Float32BufferAttribute, type Group } from 'three';
import { boxes, type Box } from './geometry';
import { releaseProgress, impactPulse } from './staging';

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
    [],
  );
  const walls = useMemo(
    () =>
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
    [],
  );
  useMemo(() => {
    const positions = walls.getAttribute('position');
    const colors = [];
    for(let i=0;i<positions.count;i++) {
      const z = positions.getZ(i);
      const tone = z < -7 ? .58 : z < -5 ? .82 : 1;
      colors.push(tone,tone,tone);
    }
    walls.setAttribute('color',new Float32BufferAttribute(colors,3));
  },[walls]);
  const outerGeometry = useMemo(
    () =>
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

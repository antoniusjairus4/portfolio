import { useFrame } from '@react-three/fiber';
import { type MutableRefObject, useEffect, useMemo, useRef } from 'react';
import { Object3D, type PointLight } from 'three';
import { sampleColorDirection } from './colorDirection';
import { boxes } from './geometry';
import { useKaiForgeMaterials } from './Materials';
import { CONTACT, PALETTE } from './staging';

export function ArenaLighting({
  portrait,
  progress,
}: {
  portrait: boolean;
  progress: MutableRefObject<number>;
}) {
  const materials = useKaiForgeMaterials();
  const contactLight = useRef<PointLight>(null);
  const targets = useMemo(() => {
    const table = new Object3D();
    table.position.set(-0.35, 0.76, 0);
    const robot = new Object3D();
    robot.position.set(-1.5, 1.1, 0);
    return { table, robot };
  }, []);
  // A single dark ceiling frame surrounds an actual open void above the court.
  // Existing architectural slabs and all playing-area transforms stay untouched.
  const ceiling = useMemo(
    () =>
      boxes([
        [
          [-0.35, 3.35, -1.75],
          [6.2, 0.28, 0.7],
        ],
        [
          [-0.35, 3.35, 1.75],
          [6.2, 0.28, 0.7],
        ],
        [
          [-3.05, 3.35, 0],
          [0.8, 0.28, 2.8],
        ],
        [
          [2.35, 3.35, 0],
          [0.8, 0.28, 2.8],
        ],
      ]),
    [],
  );
  const reveal = useMemo(
    () =>
      boxes([
        [
          [-0.35, 3.24, -1.405],
          [4.6, 0.12, 0.035],
        ],
        [
          [-0.35, 3.24, 1.405],
          [4.6, 0.12, 0.035],
        ],
        [
          [-2.655, 3.24, 0],
          [0.035, 0.12, 2.8],
        ],
        [
          [1.955, 3.24, 0],
          [0.035, 0.12, 2.8],
        ],
      ]),
    [],
  );
  useEffect(
    () => () => {
      ceiling.dispose();
      reveal.dispose();
    },
    [ceiling, reveal],
  );
  useFrame(() => {
    if (contactLight.current) {
      contactLight.current.intensity = sampleColorDirection(progress.current).contact * 0.065;
    }
  });
  return (
    <group name="KF_ArenaLighting">
      <mesh geometry={ceiling} material={materials.ceiling} />
      <mesh geometry={reveal} material={materials.reveal} />
      <primitive object={targets.table} />
      <primitive object={targets.robot} />
      <hemisphereLight args={[PALETTE.parchment, '#302a21', 0.28]} />
      <spotLight
        position={[-0.35, 3.55, 0.15]}
        target={targets.table}
        color="#fff0d8"
        intensity={44}
        angle={0.79}
        penumbra={0.8}
        distance={7.8}
        decay={2}
        castShadow={!portrait}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.2}
        shadow-camera-far={10}
        shadow-radius={7}
        shadow-intensity={0.78}
        shadow-normalBias={0.002}
        shadow-bias={-0.0001}
      />
      {/* Local, unshadowed reflected light; no global wash across the distant walls. */}
      <spotLight
        position={[-2.8, 3.1, 3.4]}
        target={targets.robot}
        color={PALETTE.parchment}
        intensity={7}
        angle={0.65}
        penumbra={1}
        distance={7}
        decay={2}
      />
      {/* Restrained rear edge light separates the dark joints from the Ink recess. */}
      <spotLight
        position={[-3, 2.9, -0.8]}
        target={targets.robot}
        color="#f2e8d5"
        intensity={7.5}
        angle={0.58}
        penumbra={1}
        distance={4.5}
        decay={2}
      />
      {/* Low-energy, local floor bounce reaches lower faces without lifting the walls. */}
      <pointLight
        position={[-1.1, 0.28, 0.35]}
        color="#e8d6b6"
        intensity={0.35}
        distance={2.3}
        decay={2}
      />
      <pointLight
        ref={contactLight}
        position={[CONTACT.x - 0.13, CONTACT.y + 0.12, CONTACT.z + 0.15]}
        color={PALETTE.crimson}
        intensity={0}
        distance={0.9}
        decay={2}
      />
    </group>
  );
}

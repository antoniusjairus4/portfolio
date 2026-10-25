import { useFrame } from '@react-three/fiber';
import { type MutableRefObject, useEffect, useMemo, useRef } from 'react';
import { type Group, type HemisphereLight, Object3D, type PointLight, type SpotLight } from 'three';
import { sampleColorDirection } from './colorDirection';
import { boxes } from './geometry';
import { useKaiForgeMaterials } from './Materials';
import { CONTACT, PALETTE } from './staging';

export function ArenaLighting({
  portrait,
  progress,
  bridgeProgress,
}: {
  portrait: boolean;
  progress: MutableRefObject<number>;
  bridgeProgress?: MutableRefObject<number>;
}) {
  const materials = useKaiForgeMaterials();
  const contactLight = useRef<PointLight>(null);
  const roof = useRef<Group>(null);
  const hemisphere = useRef<HemisphereLight>(null);
  const key = useRef<SpotLight>(null);
  const roomLeft = useRef<SpotLight>(null);
  const roomRight = useRef<SpotLight>(null);
  const robotFill = useRef<SpotLight>(null);
  const rim = useRef<SpotLight>(null);
  const bounce = useRef<PointLight>(null);
  const targets = useMemo(() => {
    const table = new Object3D();
    table.position.set(-0.35, 0.76, 0);
    const robot = new Object3D();
    robot.position.set(-1.5, 1.1, 0);
    const leftWall = new Object3D();
    leftWall.position.set(-5.8, 1.7, -3.4);
    const rightWall = new Object3D();
    rightWall.position.set(5.8, 1.7, -3.4);
    return { table, robot, leftWall, rightWall };
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
    const bridge = bridgeProgress
      ? Math.min(1, Math.max(0, (bridgeProgress.current - 0.24) / 0.58))
      : 0;
    const remaining = 1 - bridge * bridge * (3 - 2 * bridge);
    if (roof.current) {
      roof.current.scale.setScalar(Math.max(0.001, remaining));
      roof.current.position.y = 3.8 * (1 - remaining);
    }
    if (hemisphere.current) hemisphere.current.intensity = 0.48 * remaining;
    if (key.current) key.current.intensity = 40 * remaining;
    if (roomLeft.current) roomLeft.current.intensity = 9 * remaining;
    if (roomRight.current) roomRight.current.intensity = 9 * remaining;
    if (robotFill.current) robotFill.current.intensity = 8 * remaining;
    if (rim.current) rim.current.intensity = 7.5 * remaining;
    if (bounce.current) bounce.current.intensity = 0.35 * remaining;
    if (contactLight.current) {
      contactLight.current.intensity = sampleColorDirection(progress.current).contact * 0.065;
    }
  });
  return (
    <group name="KF_ArenaLighting">
      <group ref={roof}>
        <mesh geometry={ceiling} material={materials.ceiling} />
        <mesh geometry={reveal} material={materials.reveal} />
      </group>
      <primitive object={targets.table} />
      <primitive object={targets.robot} />
      <primitive object={targets.leftWall} />
      <primitive object={targets.rightWall} />
      <hemisphereLight ref={hemisphere} args={[PALETTE.parchment, '#363332', 0.48]} />
      {/* Broad overhead room lights reveal the enclosure without competing with the court. */}
      <spotLight
        ref={roomLeft}
        position={[-3.5, 5.2, 1.2]}
        target={targets.leftWall}
        color="#eeeae2"
        intensity={9}
        angle={0.98}
        penumbra={1}
        distance={11}
        decay={2}
      />
      <spotLight
        ref={roomRight}
        position={[3.5, 5.2, 1.2]}
        target={targets.rightWall}
        color="#eeeae2"
        intensity={9}
        angle={0.98}
        penumbra={1}
        distance={11}
        decay={2}
      />
      <spotLight
        ref={key}
        position={[-0.35, 3.55, 0.15]}
        target={targets.table}
        color="#fff0d8"
        intensity={40}
        angle={0.9}
        penumbra={0.9}
        distance={8.5}
        decay={2}
        castShadow={!portrait}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.2}
        shadow-camera-far={10}
        shadow-radius={7}
        shadow-intensity={0.72}
        shadow-normalBias={0.002}
        shadow-bias={-0.0001}
      />
      {/* A softer local fill keeps the robot legible beside the brighter table. */}
      <spotLight
        ref={robotFill}
        position={[-2.8, 3.1, 3.4]}
        target={targets.robot}
        color={PALETTE.parchment}
        intensity={8}
        angle={0.72}
        penumbra={1}
        distance={7}
        decay={2}
      />
      {/* Restrained rear edge light separates the dark joints from the Ink recess. */}
      <spotLight
        ref={rim}
        position={[-3, 2.9, -0.8]}
        target={targets.robot}
        color="#f2e8d5"
        intensity={7.5}
        angle={0.58}
        penumbra={1}
        distance={4.5}
        decay={2}
      />
      {/* Low-energy floor bounce reaches lower faces without flattening the shadows. */}
      <pointLight
        ref={bounce}
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

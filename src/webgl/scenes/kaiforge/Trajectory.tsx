import { useKaiForgeMaterials } from './Materials';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { type Group, type Mesh, TubeGeometry } from 'three';
import {
  rangeProgress,
  smoothstep,
  getUnderstandingProgress,
} from '@/components/kaiforge/kaiforgeChoreography';
import { CONTACT, createTrajectory, releaseProgress, impactPulse } from './staging';
export function Trajectory({
  progress,
  portrait,
}: {
  progress: MutableRefObject<number>;
  portrait: boolean;
}) {
  const materials = useKaiForgeMaterials();
  const ball = useRef<Mesh>(null),
    main = useRef<Mesh>(null),
    echoes = useRef<Group>(null),
    rupture = useRef<Mesh>(null);
  const curve = useMemo(createTrajectory, []);
  const geometry = useMemo(() => new TubeGeometry(curve, 64, 0.005, 4, false), [curve]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(() => {
    const p = progress.current,
      route = smoothstep(rangeProgress(p, 0.49, 0.69)),
      understanding = getUnderstandingProgress(p),
      release = releaseProgress(p);
    geometry.setDrawRange(0, Math.floor(64 * route) * 4 * 6);
    if (main.current) main.current.visible = route > 0 && release < 0.99;
    if (ball.current) curve.getPoint(route, ball.current.position);
    if (rupture.current) {
      const pulse = impactPulse(p);
      rupture.current.visible = pulse > 0.001;
      const length = 0.15 + pulse * 0.85;
      rupture.current.scale.set(length, 1, 1);
      rupture.current.position.copy(CONTACT);
      rupture.current.position.x += length * 0.5;
      rupture.current.position.y += length * 0.08;
    }
    if (echoes.current) {
      echoes.current.visible = understanding > 0.05 && release < 0.9;
      echoes.current.children.forEach((child, index) => {
        child.visible = understanding > (index + 1) * 0.22 && release < 0.7 - index * 0.2;
        child.position.set(0, 0.07 * (index + 1), -0.14 * (index + 1));
      });
    }
  });
  return (
    <group name="KF_ConceptualTrajectory">
      <mesh ref={ball} position={CONTACT}>
        <sphereGeometry args={[0.02, 12, 8]} />
        <primitive attach="material" object={materials.parchment} />
      </mesh>
      <mesh ref={main} geometry={geometry}>
        <primitive attach="material" object={materials.trace} />
      </mesh>
      <mesh ref={rupture} position={CONTACT} rotation={[0, 0, 0.16]}>
        <boxGeometry args={[1, 0.012, 0.008]} />
        <primitive attach="material" object={materials.crimson} />
      </mesh>
      <group ref={echoes}>
        {(portrait ? ['near'] : ['near', 'middle', 'far']).map((id) => (
          <mesh key={id} geometry={geometry}>
            <primitive attach="material" object={materials.echo} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

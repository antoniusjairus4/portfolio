import { useKaiForgeMaterials } from './Materials';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { type Mesh, type Group, SphereGeometry, Vector3 } from 'three';
import { getImpactProgress } from '@/components/kaiforge/kaiforgeChoreography';
import { limb, mergeOwned, boxes } from './geometry';
import { BLADE, ROOT } from './staging';

/** Staging proxy ONLY, not a substitute for the independently reviewed athlete. */
export function ProxyAthlete({ progress }: { progress: MutableRefObject<number> }) {
  const materials = useKaiForgeMaterials();
  const upper = useRef<Mesh>(null),
    fore = useRef<Mesh>(null),
    paddle = useRef<Group>(null);
  const skin = useMemo(
    () =>
      mergeOwned([
        new SphereGeometry(0.115, 12, 10).scale(0.9, 1.15, 1).translate(0.1, 1.57, 0),
        limb([0.06, 1.36, 0], [0.1, 1.48, 0], 0.064),
        limb([0.1, 1.31, -0.19], [0.32, 1.14, -0.3], 0.055),
        limb([0.32, 1.14, -0.3], [0.5, 1.27, -0.27], 0.047),
        limb([-0.12, 0.57, 0.29], [-0.25, 0.12, 0.38], 0.065),
        limb([0.16, 0.59, -0.3], [0.2, 0.12, -0.44], 0.065),
      ]),
    [],
  );
  const kit = useMemo(
    () =>
      mergeOwned([
        new SphereGeometry(1, 12, 10)
          .scale(0.19, 0.31, 0.235)
          .rotateZ(-0.17)
          .translate(0.025, 1.14, 0),
        limb([-0.02, 0.91, 0.13], [-0.12, 0.57, 0.29], 0.11),
        limb([0.02, 0.91, -0.13], [0.16, 0.59, -0.3], 0.11),
        boxes([
          [
            [-0.19, 0.055, 0.38],
            [0.27, 0.11, 0.13],
          ],
          [
            [0.26, 0.055, -0.44],
            [0.27, 0.11, 0.13],
          ],
        ]),
      ]),
    [],
  );
  const vectors = useMemo(
    () => ({
      shoulder: new Vector3(0.09, 1.32, 0.19),
      elbow: new Vector3(),
      grip: new Vector3(),
      blade: new Vector3(),
      direction: new Vector3(),
      up: new Vector3(0, 1, 0),
    }),
    [],
  );
  useEffect(
    () => () => {
      skin.dispose();
      kit.dispose();
    },
    [skin, kit],
  );
  useFrame(() => {
    const t = getImpactProgress(progress.current);
    const { shoulder, elbow, grip, blade, direction, up } = vectors;
    // Inverse the locked root/yaw to establish exact world-space contact.
    blade.copy(BLADE).sub(ROOT).applyAxisAngle(up, -0.04);
    blade.z += (1 - t) * 0.42;
    blade.x -= (1 - t) * 0.2;
    grip.copy(blade);
    grip.x -= 0.15;
    grip.y -= 0.04;
    elbow.set(0.27, 1.09, 0.32 - t * 0.11);
    for (const [mesh, a, b] of [
      [upper.current, shoulder, elbow],
      [fore.current, elbow, grip],
    ] as const) {
      if (!mesh) continue;
      direction.copy(b).sub(a);
      mesh.position.copy(a).add(b).multiplyScalar(0.5);
      mesh.scale.set(0.052, direction.length(), 0.052);
      mesh.quaternion.setFromUnitVectors(up, direction.normalize());
    }
    if (paddle.current) paddle.current.position.copy(blade);
  });
  return (
    <group name="KF_StagingProxy_NOT_PRODUCTION" position={ROOT} rotation={[0, 0.04, 0]}>
      <mesh geometry={skin} castShadow>
        <primitive attach="material" object={materials.skin} />
      </mesh>
      <mesh geometry={kit} castShadow>
        <primitive attach="material" object={materials.ink} />
      </mesh>
      {[upper, fore].map((ref, index) => (
        <mesh key={index === 0 ? 'upper' : 'fore'} ref={ref} castShadow>
          <cylinderGeometry args={[0.85, 1, 1, 8]} />
          <primitive attach="material" object={materials.skin} />
        </mesh>
      ))}
      <group ref={paddle}>
        <mesh rotation={[0, 0, -Math.PI / 2]} position={[-0.12, -0.03, 0]}>
          <cylinderGeometry args={[0.013, 0.016, 0.1, 8]} />
          <primitive attach="material" object={materials.skin} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 1.06]}>
          <cylinderGeometry args={[0.0775, 0.0775, 0.018, 20]} />
          <primitive attach="material" object={materials.ink} />
        </mesh>
      </group>
    </group>
  );
}

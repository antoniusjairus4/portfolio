import { useFrame } from '@react-three/fiber';
import { type MutableRefObject, useEffect, useMemo, useRef } from 'react';
import { Color, type Mesh } from 'three';
import { rangeProgress, smoothstep } from '@/components/kaiforge/kaiforgeChoreography';
import {
  BALL_TIMING,
  getOutgoingProgress,
  sampleBallPosition,
  sampleOutgoingPosition,
} from './ballSequence';
import { sampleColorDirection } from './colorDirection';
import { useKaiForgeMaterials } from './Materials';
import { createMotionTrail } from './motionTrail';
import { CONTACT, PALETTE, releaseProgress } from './staging';

export function Trajectory({
  progress,
  portrait,
}: {
  progress: MutableRefObject<number>;
  portrait: boolean;
}) {
  const materials = useKaiForgeMaterials();
  const ball = useRef<Mesh>(null);
  const rupture = useRef<Mesh>(null);
  const trails = useMemo(
    () => ({
      incoming: createMotionTrail(20, 0.003, PALETTE.parchment),
      current: createMotionTrail(portrait ? 48 : 64, 0.0045, PALETTE.crimson),
      history: [
        createMotionTrail(portrait ? 24 : 32, 0.0016, '#b4aa98'),
        createMotionTrail(portrait ? 24 : 32, 0.0014, '#b4aa98'),
      ],
      neutral: new Color('#aba18e'),
      crimson: new Color(PALETTE.crimson),
    }),
    [portrait],
  );
  useEffect(
    () => () => {
      trails.incoming.dispose();
      trails.current.dispose();
      for (const trail of trails.history) trail.dispose();
    },
    [trails],
  );

  useFrame(() => {
    const p = progress.current;
    const release = releaseProgress(p);
    const color = sampleColorDirection(p);
    if (ball.current) sampleBallPosition(p, ball.current.position);

    // A short moving window, never a full incoming cable. No trail in Recognition.
    const approach = smoothstep(rangeProgress(p, BALL_TIMING.loadStart, 0.22));
    const incomingFade =
      1 - smoothstep(rangeProgress(p, BALL_TIMING.contact, BALL_TIMING.outgoing));
    const incomingHead = Math.min(p, BALL_TIMING.contact);
    trails.incoming.update(
      sampleBallPosition,
      Math.max(0, incomingHead - 0.035),
      incomingHead,
      0.65 * approach * incomingFade,
    );

    trails.current.tint(trails.neutral, trails.crimson, color.selectedPath);
    const outgoing = getOutgoingProgress(p);
    const floorTrailFade = 1 - smoothstep(rangeProgress(
      p, BALL_TIMING.firstFloorContact, BALL_TIMING.rollStart,
    ));
    trails.current.update(
      sampleOutgoingPosition,
      0,
      outgoing,
      (0.8 - release * 0.64) * smoothstep(rangeProgress(p, BALL_TIMING.outgoing, 0.51)) * floorTrailFade,
      0.12 + release * 0.12,
    );

    // Actual previous flights: net-to-bounce, then bounce-to-contact. No translated clones.
    const windows = [
      [BALL_TIMING.loadStart, BALL_TIMING.incomingBounce, 0.58, 0.65],
      [BALL_TIMING.incomingBounce, BALL_TIMING.contact, 0.68, 0.75],
    ] as const;
    windows.forEach(([start, end, revealStart, revealEnd], index) => {
      const reveal = smoothstep(rangeProgress(p, revealStart, revealEnd));
      const dissolve = 1 - smoothstep(rangeProgress(p, 0.82 + index * 0.025, 0.94 + index * 0.02));
      trails.history[index].update(
        sampleBallPosition,
        start,
        start + (end - start) * reveal,
        (0.27 - index * 0.05) * reveal * dissolve,
        0.06,
      );
    });

    if (rupture.current) {
      rupture.current.visible = p >= BALL_TIMING.contact && color.contact > 0.001;
      rupture.current.scale.setScalar(0.6 + color.contact * 0.4);
    }
  });

  return (
    <group name="KF_ConceptualTrajectory">
      <mesh ref={ball} position={[1.15, 1.12, -0.18]}>
        <sphereGeometry args={[0.02, 12, 8]} />
        <primitive attach="material" object={materials.ball} />
      </mesh>
      <mesh geometry={trails.incoming.geometry} material={trails.incoming.material} />
      <mesh geometry={trails.current.geometry} material={trails.current.material} />
      {trails.history.map((trail, index) => (
        <mesh key={index} geometry={trail.geometry} material={trail.material} />
      ))}
      <mesh ref={rupture} position={CONTACT} rotation={[0, 0, 0.16]} visible={false}>
        <boxGeometry args={[0.11, 0.008, 0.008]} />
        <primitive attach="material" object={materials.crimson} />
      </mesh>
    </group>
  );
}

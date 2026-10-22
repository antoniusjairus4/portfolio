'use client';

import { useFrame } from '@react-three/fiber';
import { createContext, type MutableRefObject, type ReactNode, useContext, useRef } from 'react';

export type SkillsWindState = {
  time: number;
  strength: number;
  gust: number;
  direction: number;
  directionX: number;
  directionZ: number;
  travel: number;
};

const SkillsWindContext = createContext<MutableRefObject<SkillsWindState> | null>(null);

export function SkillsWindProvider({
  children,
  reducedMotion,
}: {
  children: ReactNode;
  reducedMotion: boolean;
}) {
  const wind = useRef<SkillsWindState>({
    time: 0,
    strength: 0,
    gust: 0,
    direction: -0.16,
    directionX: Math.cos(-0.16),
    directionZ: Math.sin(-0.16),
    travel: 0,
  });

  useFrame((state, delta) => {
    if (reducedMotion) {
      wind.current.time = 0;
      wind.current.strength = 0;
      wind.current.gust = 0;
      wind.current.direction = -0.16;
      wind.current.directionX = Math.cos(-0.16);
      wind.current.directionZ = Math.sin(-0.16);
      wind.current.travel = 0;
      return;
    }
    const time = state.clock.elapsedTime;
    const weatherCycle = (Math.sin(time * 0.072 - Math.PI / 2) + 1) * 0.5;
    const gustSeed = Math.max(0, (Math.sin(time * 0.19 + 0.55) - 0.38) / 0.62);
    const gust = gustSeed * gustSeed * (3 - 2 * gustSeed);
    // The heading only meanders around one prevailing direction. It never flips,
    // so every flexible surface belongs to the same weather system.
    const direction = -0.16 + Math.sin(time * 0.021) * 0.045;
    const strength = Math.min(0.94, 0.13 + weatherCycle * 0.28 + gust * 0.43);
    wind.current.time = time;
    wind.current.strength = strength;
    wind.current.gust = gust;
    wind.current.direction = direction;
    wind.current.directionX = Math.cos(direction);
    wind.current.directionZ = Math.sin(direction);
    wind.current.travel += Math.min(delta, 0.1) * (0.58 + strength * 0.5);
  });

  return <SkillsWindContext.Provider value={wind}>{children}</SkillsWindContext.Provider>;
}

export function useSkillsWind() {
  const wind = useContext(SkillsWindContext);
  if (!wind) throw new Error('Skills wind requires its scene provider.');
  return wind;
}

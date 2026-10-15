'use client';

import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

export type QualityTier = 'high' | 'reduced' | 'fallback';

interface ExperienceEnvironment {
  ready: boolean;
  reducedMotion: boolean;
  finePointer: boolean;
  quality: QualityTier;
  dprCap: number;
}

const initialEnvironment: ExperienceEnvironment = {
  ready: false,
  reducedMotion: false,
  finePointer: true,
  quality: 'fallback',
  dprCap: 1,
};

const EnvironmentContext = createContext<ExperienceEnvironment>(initialEnvironment);

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true });
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return Boolean(gl);
  } catch {
    return false;
  }
}

export function ExperienceEnvironmentProvider({ children }: { children: ReactNode }) {
  const [environment, setEnvironment] = useState(initialEnvironment);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointerQuery = window.matchMedia('(pointer: fine)');
    const webglAvailable = supportsWebGL();

    const update = () => {
      const finePointer = pointerQuery.matches;
      // A small/coarse viewport gets a conservative budget. Motion preference is separate.
      const quality: QualityTier = !webglAvailable
        ? 'fallback'
        : !finePointer || window.innerWidth < 768
          ? 'reduced'
          : 'high';
      setEnvironment({
        ready: true,
        reducedMotion: motionQuery.matches,
        finePointer,
        quality,
        dprCap: quality === 'high' ? 2 : quality === 'reduced' ? 1.5 : 1,
      });
    };

    update();
    motionQuery.addEventListener('change', update);
    pointerQuery.addEventListener('change', update);
    window.addEventListener('resize', update);
    return () => {
      motionQuery.removeEventListener('change', update);
      pointerQuery.removeEventListener('change', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return <EnvironmentContext.Provider value={environment}>{children}</EnvironmentContext.Provider>;
}

export function useExperienceEnvironment() {
  return useContext(EnvironmentContext);
}

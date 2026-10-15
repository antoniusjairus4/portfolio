'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useExperienceEnvironment } from '@/experience/ExperienceEnvironment';
import { ScrollLockManager } from './ScrollLockManager';

gsap.registerPlugin(ScrollTrigger);

interface LenisContextType {
  lenis: Lenis | null;
  acquireScrollLock: () => () => void;
  refresh: () => void;
}

const LenisContext = createContext<LenisContextType>({
  lenis: null,
  acquireScrollLock: () => () => {},
  refresh: () => {},
});

export const useLenis = () => useContext(LenisContext);

export const LenisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { ready, reducedMotion } = useExperienceEnvironment();
  const lenisRef = useRef<Lenis | null>(null);
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const managerRef = useRef<ScrollLockManager | null>(null);

  if (!managerRef.current) {
    managerRef.current = new ScrollLockManager((locked) => {
      if (locked) lenisRef.current?.stop();
      else {
        lenisRef.current?.start();
        ScrollTrigger.refresh();
      }
    });
  }

  const acquireScrollLock = useCallback(() => managerRef.current?.acquire() ?? (() => {}), []);
  const refresh = useCallback(() => ScrollTrigger.refresh(), []);

  useEffect(() => {
    if (!ready) return;
    if (reducedMotion) {
      ScrollTrigger.refresh();
      return;
    }

    const instance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
    });
    lenisRef.current = instance;
    setLenis(instance);
    const tick = (time: number) => instance.raf(time * 1000);
    instance.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(tick);
    if (managerRef.current?.locked) instance.stop();
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(tick);
      instance.off('scroll', ScrollTrigger.update);
      instance.destroy();
      lenisRef.current = null;
      setLenis(null);
    };
  }, [ready, reducedMotion]);

  useEffect(() => () => managerRef.current?.dispose(), []);

  return (
    <LenisContext.Provider value={{ lenis, acquireScrollLock, refresh }}>
      {children}
    </LenisContext.Provider>
  );
};

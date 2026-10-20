'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  type ChapterProgressController,
  createChapterProgressController,
} from '@/experience/chapterProgress';
import { useExperienceEnvironment } from '@/experience/ExperienceEnvironment';
import { useGlobalEther } from '@/experience/GlobalEtherProvider';
import { useProjectSceneRegistration } from '@/experience/ProjectExperienceProvider';
import { useChapterActivity } from '@/experience/useChapterActivity';
import './palindromeNeuroShieldBridge.css';

export function PalindromeNeuroShieldBridge() {
  const sectionRef = useRef<HTMLElement>(null);
  const [controller, setController] = useState<ChapterProgressController | null>(null);
  const { ready, reducedMotion, portrait, quality, dprCap } = useExperienceEnvironment();
  const { setMode } = useGlobalEther();
  const activity = useChapterActivity(sectionRef);
  const enabled = ready && !reducedMotion && quality !== 'fallback';
  const registration = useMemo(
    () => (controller ? { controller, sectionRef, activity, enabled, portrait, dprCap } : null),
    [controller, activity, enabled, portrait, dprCap],
  );
  useProjectSceneRegistration('palindrome-neuroshield-bridge', registration);

  useEffect(() => {
    const next = createChapterProgressController(sectionRef);
    setController(next);
    const palindrome = document.getElementById('palindrome');
    const update = () => {
      const p = next.progress.current;
      const ease = (value: number) => {
        const t = Math.max(0, Math.min(1, value));
        return t * t * (3 - 2 * t);
      };
      // Brief full coverage around the scene swap; no time-based animation.
      const veil = ease(p / 0.44) * (1 - ease((p - 0.56) / 0.44));
      sectionRef.current?.style.setProperty('--handoff-veil', enabled ? String(veil) : '0');
      palindrome?.style.setProperty(
        '--palindrome-exit-opacity',
        enabled ? String(1 - ease(p / 0.44)) : '1',
      );
    };
    const unsubscribe = next.subscribe(update);
    update();
    return () => {
      unsubscribe();
      next.dispose();
      palindrome?.style.removeProperty('--palindrome-exit-opacity');
      sectionRef.current?.style.removeProperty('--handoff-veil');
    };
  }, [enabled]);

  useEffect(() => {
    if (enabled && activity !== 'inactive') setMode('disabled');
  }, [activity, enabled, setMode]);

  return (
    <section
      ref={sectionRef}
      className={`palindrome-neuroshield-bridge${enabled ? '' : ' bridge-disabled'}`}
      aria-hidden="true"
    >
      <div className="palindrome-neuroshield-bridge-sticky" />
    </section>
  );
}

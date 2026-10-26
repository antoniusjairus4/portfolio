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
    return () => {
      next.dispose();
      setController(null);
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

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  type ChapterProgressController,
  createChapterProgressController,
} from '@/experience/chapterProgress';
import { useExperienceEnvironment } from '@/experience/ExperienceEnvironment';
import { useProjectSceneRegistration } from '@/experience/ProjectExperienceProvider';
import { useChapterActivity } from '@/experience/useChapterActivity';

/** The bridge has its own scroll distance, but no second scroll container or canvas. */
export function KaiPalindromeBridge() {
  const sectionRef = useRef<HTMLElement>(null);
  const [controller, setController] = useState<ChapterProgressController | null>(null);
  const { ready, reducedMotion, portrait, quality, dprCap } = useExperienceEnvironment();
  const activity = useChapterActivity(sectionRef);
  const registration = useMemo(
    () =>
      controller
        ? {
            controller,
            sectionRef,
            activity,
            enabled: ready && !reducedMotion && quality !== 'fallback',
            portrait,
            dprCap: Math.min(dprCap, portrait ? 1.25 : 1.75),
          }
        : null,
    [activity, controller, dprCap, portrait, quality, ready, reducedMotion],
  );
  useProjectSceneRegistration('kai-palindrome-bridge', registration);

  useEffect(() => {
    const next = createChapterProgressController(sectionRef);
    setController(next);
    return () => {
      next.dispose();
      setController(null);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`kai-palindrome-bridge ${ready && !reducedMotion && quality !== 'fallback' ? '' : 'kai-palindrome-bridge-disabled'}`}
      aria-hidden="true"
    >
      <div className="kai-palindrome-bridge-sticky" />
    </section>
  );
}

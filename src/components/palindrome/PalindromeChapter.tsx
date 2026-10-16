'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { PalindromeFallback } from '@/components/palindrome/PalindromeFallback';
import { getBeatOpacity, getPalindromeBeat } from '@/components/palindrome/palindromeChoreography';
import { palindromeBeats, palindromeContent } from '@/content/palindrome';
import {
  type ChapterProgressController,
  createChapterProgressController,
} from '@/experience/chapterProgress';
import { useExperienceEnvironment } from '@/experience/ExperienceEnvironment';
import { useGlobalEther } from '@/experience/GlobalEtherProvider';
import { useProjectSceneRegistration } from '@/experience/ProjectExperienceProvider';
import { useChapterActivity } from '@/experience/useChapterActivity';

const BEAT_PRESENTATION = [
  { center: 0.08, width: 0.16 },
  { center: 0.29, width: 0.15 },
  { center: 0.515, width: 0.14 },
  { center: 0.735, width: 0.15 },
  { center: 0.92, width: 0.14 },
] as const;

export function PalindromeChapter() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const beatRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [controller, setController] = useState<ChapterProgressController | null>(null);
  const ownsEtherRef = useRef(false);
  const { ready, reducedMotion, portrait, quality, dprCap } = useExperienceEnvironment();
  const { setMode: setGlobalEtherMode } = useGlobalEther();
  const activity = useChapterActivity(sectionRef);
  const portraitComposition = ready && portrait;
  const renderWebGL = ready && !reducedMotion && quality !== 'fallback';
  const rendererActive = renderWebGL && activity !== 'inactive';
  const sceneRegistration = useMemo(
    () =>
      controller
        ? {
            controller,
            sectionRef,
            activity,
            enabled: rendererActive,
            portrait: portraitComposition,
            dprCap,
          }
        : null,
    [activity, controller, dprCap, portraitComposition, rendererActive],
  );
  useProjectSceneRegistration('palindrome', sceneRegistration);

  useEffect(() => {
    const next = createChapterProgressController(sectionRef);
    setController(next);

    const updatePresentation = () => {
      const section = sectionRef.current;
      if (!section) return;
      const progress = next.progress.current;
      section.style.setProperty('--palindrome-progress', progress.toFixed(4));
      section.dataset.palindromeBeat = getPalindromeBeat(progress);

      if (headerRef.current && !reducedMotion && quality !== 'fallback') {
        const headerOpacity = Math.max(0, Math.min(1, (0.23 - progress) / 0.09));
        headerRef.current.style.opacity = headerOpacity.toFixed(3);
        headerRef.current.style.transform = `translate3d(0, ${progress * -28}px, 0)`;
      }

      beatRefs.current.forEach((element, index) => {
        if (!element) return;
        const presentation = BEAT_PRESENTATION[index];
        const opacity = getBeatOpacity(progress, presentation.center, presentation.width);
        element.style.opacity = opacity.toFixed(3);
        element.style.transform = `translate3d(0, ${(1 - opacity) * 20}px, 0)`;
        element.style.pointerEvents = opacity > 0.6 ? 'auto' : 'none';
      });
    };

    const unsubscribe = next.subscribe(updatePresentation);
    updatePresentation();
    return () => {
      unsubscribe();
      next.dispose();
      setController(null);
    };
  }, [quality, reducedMotion]);

  useEffect(() => {
    if (activity !== 'inactive') {
      ownsEtherRef.current = true;
      setGlobalEtherMode('disabled');
    } else if (ownsEtherRef.current) {
      ownsEtherRef.current = false;
      setGlobalEtherMode('enabled');
    }
  }, [activity, setGlobalEtherMode]);

  useEffect(
    () => () => {
      if (ownsEtherRef.current) setGlobalEtherMode('enabled');
    },
    [setGlobalEtherMode],
  );

  const staticExperience = reducedMotion || quality === 'fallback';

  return (
    <section
      ref={sectionRef}
      id="palindrome"
      aria-labelledby="palindrome-title"
      data-palindrome-beat="ordinary"
      data-renderer-active={rendererActive ? 'true' : 'false'}
      className={`palindrome-chapter ${staticExperience ? 'palindrome-static' : ''}`}
    >
      <div className="palindrome-sticky">
        {!rendererActive && <div className="palindrome-render-placeholder" aria-hidden="true" />}

        {ready && staticExperience && (
          <PalindromeFallback reason={reducedMotion ? 'reduced-motion' : 'no-webgl'} />
        )}

        <header ref={headerRef} className="palindrome-semantic-header">
          <p>{palindromeContent.eyebrow}</p>
          <h2 id="palindrome-title">{palindromeContent.name}</h2>
          <p>{palindromeContent.description}</p>
          <p className="palindrome-purpose">{palindromeContent.purpose}</p>
        </header>

        {!staticExperience && (
          <div className="palindrome-beats" aria-hidden="true">
            {palindromeBeats.map((beat, index) => (
              <div
                key={beat.key}
                ref={(node) => {
                  beatRefs.current[index] = node;
                }}
                className={`palindrome-beat beat-${beat.key}`}
              >
                <span>
                  {beat.index} / {beat.label}
                </span>
                <strong>
                  {beat.headline[0]}
                  <br />
                  {beat.headline[1]}
                </strong>
                <small>{beat.detail}</small>
              </div>
            ))}
          </div>
        )}

        <div className="palindrome-chapter-index" aria-hidden="true">
          <span>02</span>
          <i />
          <span>PL</span>
        </div>

        <div className="palindrome-disclosure">
          <p>{palindromeContent.disclosure}</p>
          <a href={palindromeContent.destination} target="_blank" rel="noopener noreferrer">
            Visit Palindrome <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}

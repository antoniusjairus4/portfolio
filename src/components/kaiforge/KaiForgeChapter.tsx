'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { KaiForgeFallback } from '@/components/kaiforge/KaiForgeFallback';
import { getBeatOpacity, getKaiForgeBeat } from '@/components/kaiforge/kaiforgeChoreography';
import { kaiForgeContent } from '@/content/kaiforge';
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
  { center: 0.28, width: 0.15 },
  { center: 0.455, width: 0.12 },
  { center: 0.67, width: 0.19 },
  { center: 0.91, width: 0.14 },
] as const;

export function KaiForgeChapter() {
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
  useProjectSceneRegistration('kaiforge', sceneRegistration);

  useEffect(() => {
    const next = createChapterProgressController(sectionRef);
    setController(next);

    const updatePresentation = () => {
      const section = sectionRef.current;
      if (!section) return;
      const progress = next.progress.current;
      section.style.setProperty('--kaiforge-progress', progress.toFixed(4));
      section.dataset.kaiforgeBeat = getKaiForgeBeat(progress);
      if (headerRef.current && !reducedMotion && quality !== 'fallback') {
        const headerOpacity = Math.max(0, Math.min(1, (0.24 - progress) / 0.09));
        headerRef.current.style.opacity = headerOpacity.toFixed(3);
        headerRef.current.style.transform = `translate3d(0, ${progress * -32}px, 0)`;
      }
      beatRefs.current.forEach((element, index) => {
        if (!element) return;
        const presentation = BEAT_PRESENTATION[index];
        const opacity = getBeatOpacity(progress, presentation.center, presentation.width);
        element.style.opacity = opacity.toFixed(3);
        element.style.transform = `translate3d(0, ${(1 - opacity) * 22}px, 0)`;
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

  return (
    <section
      ref={sectionRef}
      id="kaiforge"
      aria-labelledby="kaiforge-title"
      data-kaiforge-beat="recognition"
      data-renderer-active={rendererActive ? 'true' : 'false'}
      className={`kaiforge-chapter ${reducedMotion || quality === 'fallback' ? 'kaiforge-static' : ''}`}
    >
      <div className="kaiforge-sticky">
        {!rendererActive && <div className="kaiforge-render-placeholder" aria-hidden="true" />}

        {ready && (reducedMotion || quality === 'fallback') && (
          <KaiForgeFallback reason={reducedMotion ? 'reduced-motion' : 'no-webgl'} />
        )}

        <header ref={headerRef} className="kaiforge-semantic-header">
          <p>{kaiForgeContent.eyebrow}</p>
          <h2 id="kaiforge-title">{kaiForgeContent.name}</h2>
          <p>{kaiForgeContent.description}</p>
          <p className="kaiforge-purpose">{kaiForgeContent.purpose}</p>
        </header>

        {!reducedMotion && quality !== 'fallback' && (
          <div className="kaiforge-beats" aria-hidden="true">
            <div
              ref={(node) => {
                beatRefs.current[0] = node;
              }}
              className="kaiforge-beat beat-recognition"
            >
              <span>01 / Recognition</span>
              <strong>TABLE TENNIS</strong>
            </div>
            <div
              ref={(node) => {
                beatRefs.current[1] = node;
              }}
              className="kaiforge-beat beat-approach"
            >
              <span>02 / Approach</span>
              <strong>
                READ THE MOMENT
                <br />
                BEFORE CONTACT.
              </strong>
            </div>
            <div
              ref={(node) => {
                beatRefs.current[2] = node;
              }}
              className="kaiforge-beat beat-impact"
            >
              <span>03 / Impact</span>
              <strong>
                ONE POINT.
                <br />
                ONE DECISION.
              </strong>
            </div>
            <div
              ref={(node) => {
                beatRefs.current[3] = node;
              }}
              className="kaiforge-beat beat-understanding"
            >
              <span>04 / Understanding</span>
              <strong>
                THE POINT,
                <br />
                UNDERSTOOD.
              </strong>
              <small>{kaiForgeContent.traceNote}</small>
            </div>
            <div
              ref={(node) => {
                beatRefs.current[4] = node;
              }}
              className="kaiforge-beat beat-release"
            >
              <span>05 / Release</span>
              <strong>
                FROM MOTION
                <br />
                TO PATTERN.
              </strong>
            </div>
          </div>
        )}

        <div className="kaiforge-chapter-index" aria-hidden="true">
          <span>01</span>
          <i />
          <span>KF</span>
        </div>

        <a
          className="kaiforge-destination"
          href={kaiForgeContent.destination}
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit KaiForge <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  );
}

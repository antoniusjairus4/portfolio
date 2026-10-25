'use client';

import './kaiforgeProduction.css';

import { useEffect, useMemo, useRef, useState } from 'react';
import { KaiForgeFallback } from '@/components/kaiforge/KaiForgeFallback';
import {
  getBeatOpacity,
  getKaiForgeBeat,
  rangeProgress,
  smoothstep,
} from '@/components/kaiforge/kaiforgeChoreography';
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
  { center: 0.08, width: 0.16, hold: 0.055 },
  { center: 0.28, width: 0.15, hold: 0.025 },
  { center: 0.455, width: 0.12, hold: 0.04 },
  { center: 0.67, width: 0.19, hold: 0.035 },
  { center: 0.91, width: 0.14, hold: 0.03 },
] as const;

function BrandWordmark() {
  return (
    <>
      <span className="kaiforge-tone-ivory">Kai</span>
      <span className="kaiforge-tone-green">Forge</span>
    </>
  );
}

function BeatLabel({ number, name }: { number: string; name: string }) {
  return (
    <span>
      <span className="kaiforge-tone-grey">{number} /</span>{' '}
      <span className="kaiforge-tone-soft">{name}</span>
    </span>
  );
}

export function KaiForgeChapter() {
  const sectionRef = useRef<HTMLElement>(null);
  const beatRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [controller, setController] = useState<ChapterProgressController | null>(null);
  const ownsEtherRef = useRef(false);
  const { ready, reducedMotion, portrait, quality, dprCap } = useExperienceEnvironment();
  const { setMode: setGlobalEtherMode } = useGlobalEther();
  const activity = useChapterActivity(sectionRef);
  const portraitComposition = ready && portrait;
  const staticPresentation = reducedMotion || quality === 'fallback';
  const renderWebGL = ready && !reducedMotion && quality !== 'fallback';
  const rendererActive = renderWebGL && activity !== 'inactive';
  const sceneRegistration = useMemo(
    () =>
      controller
        ? {
            controller,
            sectionRef,
            activity,
            // Eligibility is separate from viewport activity so the shared renderer can
            // prepare Recognition behind the opaque Hero before its curtains open.
            enabled: renderWebGL,
            portrait: portraitComposition,
            dprCap: Math.min(dprCap, portraitComposition ? 1.25 : 1.75),
          }
        : null,
    [activity, controller, dprCap, portraitComposition, renderWebGL],
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
      const titleArrival = staticPresentation ? 1 : smoothstep(rangeProgress(progress, 0, 0.075));
      section.style.setProperty('--kaiforge-title-arrival', titleArrival.toFixed(4));
      section.style.setProperty(
        '--kaiforge-title-offset',
        `${(-8 * (1 - titleArrival)).toFixed(3)}vh`,
      );
      section.dataset.kaiforgeBeat = getKaiForgeBeat(progress);
      beatRefs.current.forEach((element, index) => {
        if (!element) return;
        if (staticPresentation) {
          element.style.opacity = index === 0 ? '1' : '0';
          element.style.pointerEvents = 'none';
          return;
        }
        const presentation = BEAT_PRESENTATION[index];
        const opacity = getBeatOpacity(
          progress,
          presentation.center,
          presentation.width,
          presentation.hold,
        );
        element.style.opacity = opacity.toFixed(3);
        element.style.removeProperty('transform');
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
  }, [staticPresentation]);

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

        <div className="kaiforge-beats">
          <div
            ref={(node) => {
              beatRefs.current[0] = node;
            }}
            className="kaiforge-beat beat-recognition"
          >
            <BeatLabel number="01" name="Recognition" />
            <h2 id="kaiforge-title" className="kaiforge-recognition-title">
              <BrandWordmark />
            </h2>
          </div>
          {!staticPresentation && (
            <>
              <div
                ref={(node) => {
                  beatRefs.current[1] = node;
                }}
                className="kaiforge-beat beat-approach"
                aria-hidden="true"
              >
                <BeatLabel number="02" name="Approach" />
                <strong>
                  <span className="kaiforge-tone-ivory">READ</span>{' '}
                  <span className="kaiforge-tone-soft">THE</span>{' '}
                  <span className="kaiforge-tone-ivory">MOMENT</span>
                  <br />
                  <span className="kaiforge-tone-soft">BEFORE</span>{' '}
                  <span className="kaiforge-tone-green">CONTACT.</span>
                </strong>
              </div>
              <div
                ref={(node) => {
                  beatRefs.current[2] = node;
                }}
                className="kaiforge-beat beat-impact"
                aria-hidden="true"
              >
                <BeatLabel number="03" name="Impact" />
                <strong>
                  <span className="kaiforge-tone-soft">ONE</span>{' '}
                  <span className="kaiforge-tone-ivory">POINT.</span>
                  <br />
                  <span className="kaiforge-tone-soft">ONE</span>{' '}
                  <span className="kaiforge-tone-green">DECISION.</span>
                </strong>
              </div>
              <div
                ref={(node) => {
                  beatRefs.current[3] = node;
                }}
                className="kaiforge-beat beat-understanding"
                aria-hidden="true"
              >
                <BeatLabel number="04" name="Understanding" />
                <strong>
                  <span className="kaiforge-tone-soft">THE</span>{' '}
                  <span className="kaiforge-tone-green">POINT,</span>
                  <br />
                  <span className="kaiforge-tone-ivory">UNDERSTOOD.</span>
                </strong>
                <small>{kaiForgeContent.traceNote}</small>
              </div>
              <div
                ref={(node) => {
                  beatRefs.current[4] = node;
                }}
                className="kaiforge-beat beat-release"
                aria-hidden="true"
              >
                <BeatLabel number="05" name="Release" />
                <strong>
                  <span className="kaiforge-tone-soft">FROM</span>{' '}
                  <span className="kaiforge-tone-ivory">MOTION</span>
                  <br />
                  <span className="kaiforge-tone-soft">TO</span>{' '}
                  <span className="kaiforge-tone-green">PATTERN.</span>
                </strong>
              </div>
            </>
          )}
        </div>

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
          <span className="kaiforge-destination-copy">
            <span className="kaiforge-tone-grey">Visit</span>{' '}
            <BrandWordmark />
          </span>
          <span className="kaiforge-destination-arrow kaiforge-tone-green" aria-hidden="true">
            ↗
          </span>
        </a>
      </div>
    </section>
  );
}

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { NeuroShieldFallback } from '@/components/neuroshield/NeuroShieldFallback';
import {
  getBeatOpacity,
  getNeuroShieldBeat,
  rangeProgress,
  smoothstep,
} from '@/components/neuroshield/neuroShieldChoreography';
import { neuroShieldBeats, neuroShieldContent } from '@/content/neuroshield';
import {
  type ChapterProgressController,
  createChapterProgressController,
} from '@/experience/chapterProgress';
import { useExperienceEnvironment } from '@/experience/ExperienceEnvironment';
import { useGlobalEther } from '@/experience/GlobalEtherProvider';
import { useProjectSceneRegistration } from '@/experience/ProjectExperienceProvider';
import { useChapterActivity } from '@/experience/useChapterActivity';
import './neuroShieldImaging.css';

const BEAT_PRESENTATION = [
  { center: 0.08, width: 0.16 },
  { center: 0.29, width: 0.15 },
  { center: 0.52, width: 0.14 },
  { center: 0.74, width: 0.15 },
  { center: 0.92, width: 0.14 },
] as const;
const ANNOTATIONS = [
  { label: 'CEREBRAL FORM', center: 0.14, width: 0.09 },
  { label: 'TEMPORAL REGION', center: 0.24, width: 0.1 },
  { label: 'INTERNAL SECTION', center: 0.32, width: 0.085 },
  { label: 'SELECTED REGION', center: 0.36, width: 0.065 },
] as const;

export function NeuroShieldChapter() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const presentationRef = useRef<HTMLDivElement>(null);
  const beatRefs = useRef<(HTMLDivElement | null)[]>([]);
  const annotationRefs = useRef<(HTMLSpanElement | null)[]>([]);
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
  useProjectSceneRegistration('neuroshield', sceneRegistration);

  useEffect(() => {
    const next = createChapterProgressController(sectionRef);
    setController(next);

    const updatePresentation = () => {
      const section = sectionRef.current;
      if (!section) return;
      const progress = next.progress.current;
      section.style.setProperty('--neuroshield-progress', progress.toFixed(4));
      const imagingFocus =
        smoothstep(rangeProgress(progress, 0.3, 0.38)) *
        (1 - smoothstep(rangeProgress(progress, 0.65, 0.72)));
      section.style.setProperty('--neuro-imaging-focus', imagingFocus.toFixed(4));
      section.dataset.neuroshieldBeat = getNeuroShieldBeat(progress);
      if (presentationRef.current) {
        const t = Math.min(1, progress / 0.035);
        const entry = section.getBoundingClientRect().top > 0 ? 0 : t * t * (3 - 2 * t);
        presentationRef.current.style.opacity =
          reducedMotion || quality === 'fallback' ? '1' : entry.toFixed(3);
      }

      if (headerRef.current && !reducedMotion && quality !== 'fallback') {
        const headerOpacity = Math.max(0, Math.min(1, (0.23 - progress) / 0.09));
        headerRef.current.style.opacity = headerOpacity.toFixed(3);
        headerRef.current.style.transform = `translate3d(0, ${progress * -26}px, 0)`;
      }

      beatRefs.current.forEach((element, index) => {
        if (!element) return;
        const presentation = BEAT_PRESENTATION[index];
        const opacity = getBeatOpacity(progress, presentation.center, presentation.width);
        element.style.opacity = opacity.toFixed(3);
        element.style.transform = `translate3d(0, ${(1 - opacity) * 18}px, 0)`;
        element.style.pointerEvents = opacity > 0.6 ? 'auto' : 'none';
      });
      annotationRefs.current.forEach((element, index) => {
        if (!element) return;
        const annotation = ANNOTATIONS[index];
        element.style.opacity = getBeatOpacity(
          progress,
          annotation.center,
          annotation.width,
        ).toFixed(3);
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
      id="neuroshield"
      aria-labelledby="neuroshield-title"
      data-neuroshield-beat="observation"
      data-renderer-active={rendererActive ? 'true' : 'false'}
      className={`neuroshield-chapter ${staticExperience ? 'neuroshield-static' : ''}`}
    >
      <div ref={presentationRef} className="neuroshield-sticky">
        {!rendererActive && <div className="neuroshield-render-placeholder" aria-hidden="true" />}

        {ready && staticExperience && (
          <NeuroShieldFallback reason={reducedMotion ? 'reduced-motion' : 'no-webgl'} />
        )}

        <header ref={headerRef} className="neuroshield-semantic-header">
          <p>{neuroShieldContent.eyebrow}</p>
          <h2 id="neuroshield-title">{neuroShieldContent.name}</h2>
          <p>{neuroShieldContent.description}</p>
          <p className="neuroshield-role">{neuroShieldContent.role}</p>
        </header>

        {!staticExperience && (
          <div className="neuroshield-beats" aria-hidden="true">
            {neuroShieldBeats.map((beat, index) => (
              <div
                key={beat.key}
                ref={(node) => {
                  beatRefs.current[index] = node;
                }}
                className={`neuroshield-beat beat-${beat.key}`}
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

        {!staticExperience && (
          <div className="neuroshield-annotations" aria-hidden="true">
            {ANNOTATIONS.map((annotation, index) => (
              <span
                key={annotation.label}
                ref={(node) => {
                  annotationRefs.current[index] = node;
                }}
                className={`neuroshield-annotation annotation-${index + 1}`}
              >
                {annotation.label}
              </span>
            ))}
          </div>
        )}

        <div className="neuroshield-metadata" aria-hidden="true">
          <span>ANATOMY</span>
          <span>IMAGING</span>
          <span>RESEARCH</span>
        </div>

        <div className="neuroshield-chapter-index" aria-hidden="true">
          <span>03</span>
          <i />
          <span>NS</span>
        </div>

        <div className="neuroshield-disclosure">
          <p>{neuroShieldContent.disclosure}</p>
          <div className="neuroshield-disclosure-links">
            <a href={neuroShieldContent.workPdf} target="_blank" rel="noopener noreferrer">
              View work <span aria-hidden="true">↗</span>
            </a>
            <a href={neuroShieldContent.destination} target="_blank" rel="noopener noreferrer">
              View research project <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

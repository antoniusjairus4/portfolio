'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { rangeProgress, smoothstep } from '@/components/neuroshield/neuroShieldChoreography';
import { neuroShieldBeats, neuroShieldContent } from '@/content/neuroshield';
import { NEURO_IMAGE_URLS } from '@/experience/assets/manifest';
import {
  type ChapterProgressController,
  createChapterProgressController,
} from '@/experience/chapterProgress';
import { useExperienceEnvironment } from '@/experience/ExperienceEnvironment';
import { useGlobalEther } from '@/experience/GlobalEtherProvider';
import { useProjectSceneRegistration } from '@/experience/ProjectExperienceProvider';
import { useChapterActivity } from '@/experience/useChapterActivity';
import { useLenis } from '@/motion/lenis/LenisProvider';
import './neuroShieldImaging.css';

const RESEARCH_START = 0.59;
const RESEARCH_END = 0.995;
const PANEL_COUNT = neuroShieldBeats.length;

function inverseSmoothstep(value: number) {
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  let low = 0;
  let high = 1;
  for (let iteration = 0; iteration < 24; iteration += 1) {
    const middle = (low + high) / 2;
    if (smoothstep(middle) < value) low = middle;
    else high = middle;
  }
  return (low + high) / 2;
}

const PANEL_STOPS = neuroShieldBeats.map(
  (_, index) =>
    RESEARCH_START + (RESEARCH_END - RESEARCH_START) * inverseSmoothstep(index / (PANEL_COUNT - 1)),
);

const SCANS = [
  { src: NEURO_IMAGE_URLS[0], width: 702, height: 706, alt: 'Axial brain MRI slice' },
  { src: NEURO_IMAGE_URLS[1], width: 538, height: 625, alt: 'Grid of axial brain scan slices' },
  { src: NEURO_IMAGE_URLS[2], width: 652, height: 705, alt: 'Annotated lower brain MRI slice' },
  { src: NEURO_IMAGE_URLS[3], width: 673, height: 465, alt: 'Six coronal brain MRI slices' },
] as const;

function Scan({
  index,
  caption,
  className = '',
}: {
  index: number;
  caption: string;
  className?: string;
}) {
  const scan = SCANS[index];
  return (
    <figure className={`ns-scan ${className}`}>
      <div className="ns-scan-image">
        <Image
          src={scan.src}
          width={scan.width}
          height={scan.height}
          alt={scan.alt}
          sizes="(max-width: 720px) 72vw, 38vw"
          loading="eager"
        />
        <span className="ns-scan-corner ns-scan-corner-tl" />
        <span className="ns-scan-corner ns-scan-corner-br" />
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

function ResearchPanel({ index }: { index: number }) {
  const beat = neuroShieldBeats[index];
  return (
    <article
      className={`ns-panel ns-panel-${beat.key}`}
      aria-label={`${beat.index}: ${beat.label}`}
    >
      <div className="ns-panel-copy">
        <p className="ns-panel-kicker">
          {beat.index} / {beat.label}
        </p>
        <h3>
          {beat.headline[0]}
          <br />
          {beat.headline[1]}
        </h3>
        <p className="ns-panel-detail">
          {index === 0 ? neuroShieldContent.description : beat.detail}
        </p>
        <span className="ns-panel-rule" />
        <p className="ns-panel-index">NEUROSHIELD / RESEARCH NOTE {beat.index}</p>
      </div>

      {index === 0 && (
        <div className="ns-panel-visual ns-visual-observation">
          <Scan index={0} caption="AXIAL VIEW / SOURCE IMAGING" className="ns-scan-primary" />
          <span className="ns-visual-coordinate">OBSERVATION 001 / UNCLASSIFIED</span>
        </div>
      )}
      {index === 1 && (
        <div className="ns-panel-visual ns-visual-hypothesis">
          <Scan index={1} caption="SERIES A / MULTIPLE SLICES" />
          <span className="ns-relationship-line" aria-hidden="true" />
          <Scan index={2} caption="SERIES B / ANNOTATED VIEW" />
          <span className="ns-visual-coordinate">CORRELATION IS A QUESTION, NOT A CONCLUSION</span>
        </div>
      )}
      {index === 2 && (
        <div className="ns-panel-visual ns-visual-experiment">
          <Scan index={2} caption="ANATOMICAL REFERENCE / COMPARISON" />
          <div className="ns-experiment-traces" aria-hidden="true">
            <span>MODEL RUN / 01</span>
            <i />
            <i />
            <i />
            <i />
            <i />
            <span>MODEL RUN / 02</span>
            <i />
            <i />
            <i className="ns-trace-short" />
            <i className="ns-trace-short" />
            <i className="ns-trace-short" />
            <span>COMPARE / REVISE / REPEAT</span>
          </div>
        </div>
      )}
      {index === 3 && (
        <div className="ns-panel-visual ns-visual-evidence">
          <Scan index={0} caption="01 / AXIAL" />
          <Scan index={1} caption="02 / SERIES" />
          <Scan index={2} caption="03 / ANNOTATED" />
          <Scan index={3} caption="04 / CORONAL" />
        </div>
      )}
      {index === 4 && (
        <div className="ns-panel-visual ns-visual-uncertainty">
          <Scan index={3} caption="CORONAL SERIES / ONGOING INTERPRETATION" />
          <div className="ns-research-note">
            <span>ONGOING / SIX-PERSON TEAM</span>
            <p>{neuroShieldContent.role}</p>
          </div>
        </div>
      )}
      {index === 4 && (
        <div className="ns-panel-disclosure">
          <p>{neuroShieldContent.disclosure}</p>
          <div>
            <a href={neuroShieldContent.workPdf} target="_blank" rel="noopener noreferrer">
              View work ↗
            </a>
            <a href={neuroShieldContent.destination} target="_blank" rel="noopener noreferrer">
              View research project ↗
            </a>
            <a
              href="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              Anatomy: BodyParts3D / DBCLS · CC BY-SA 2.1 JP ↗
            </a>
          </div>
        </div>
      )}
    </article>
  );
}

export function NeuroShieldChapter() {
  const sectionRef = useRef<HTMLElement>(null);
  const identityRef = useRef<HTMLHeadingElement>(null);
  const researchRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [controller, setController] = useState<ChapterProgressController | null>(null);
  const ownsEtherRef = useRef(false);
  const { ready, reducedMotion, portrait, quality, dprCap } = useExperienceEnvironment();
  const { setMode: setGlobalEtherMode } = useGlobalEther();
  const { lenis } = useLenis();
  const activity = useChapterActivity(sectionRef);
  const staticExperience = ready && (reducedMotion || quality === 'fallback');
  const rendererActive = ready && !staticExperience && activity !== 'inactive';
  const sceneRegistration = useMemo(
    () =>
      controller
        ? {
            controller,
            sectionRef,
            activity,
            enabled: rendererActive,
            portrait: ready && portrait,
            dprCap,
          }
        : null,
    [activity, controller, dprCap, portrait, ready, rendererActive],
  );
  useProjectSceneRegistration('neuroshield', sceneRegistration);

  useEffect(() => {
    const next = createChapterProgressController(sectionRef);
    setController(next);
    const update = () => {
      if (staticExperience) return;
      const p = next.progress.current;
      const titleIn = smoothstep(rangeProgress(p, 0.31, 0.41));
      const titleOut = 1 - smoothstep(rangeProgress(p, 0.49, 0.57));
      const title = titleIn * titleOut;
      const research = smoothstep(rangeProgress(p, 0.5, 0.59));
      const horizontal = smoothstep(rangeProgress(p, RESEARCH_START, RESEARCH_END));
      if (identityRef.current) {
        identityRef.current.style.opacity = title.toFixed(3);
        identityRef.current.style.transform = `translate(-50%, -50%) scale(${(0.94 + titleIn * 0.06).toFixed(3)})`;
      }
      if (researchRef.current) {
        researchRef.current.style.opacity = research.toFixed(3);
        researchRef.current.style.pointerEvents = research > 0.94 ? 'auto' : 'none';
        researchRef.current.inert = research <= 0.94;
        researchRef.current.style.setProperty('--ns-horizontal', horizontal.toFixed(4));
        researchRef.current.dataset.activePanel = String(Math.min(4, Math.round(horizontal * 4)));
        researchRef.current.querySelectorAll('a').forEach((link) => {
          link.tabIndex = horizontal > 0.92 ? 0 : -1;
        });
      }
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${(-80 * horizontal).toFixed(4)}%, 0, 0)`;
      }
      sectionRef.current?.style.setProperty('--neuroshield-progress', p.toFixed(4));
    };
    const unsubscribe = next.subscribe(update);
    update();
    return () => {
      unsubscribe();
      next.dispose();
      setController(null);
    };
  }, [staticExperience]);

  useEffect(() => {
    if (staticExperience || !controller) return;
    let settleTimer = 0;
    let touchMoved = false;
    let touchStartY = 0;
    let gestureOrigin: number | null = null;
    let gestureDirection = 0;

    const noteGesture = (direction: number) => {
      if (gestureOrigin === null) gestureOrigin = window.scrollY;
      if (direction !== 0) gestureDirection = Math.sign(direction);
    };

    const settle = () => {
      settleTimer = 0;
      const origin = gestureOrigin;
      const direction = gestureDirection;
      gestureOrigin = null;
      gestureDirection = 0;
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, rect.height - window.innerHeight);
      const sectionTop = window.scrollY + rect.top;
      const intendedScroll = lenis?.targetScroll ?? window.scrollY;
      const intendedProgress = (intendedScroll - sectionTop) / distance;
      if (intendedProgress < RESEARCH_START || intendedProgress >= RESEARCH_END) return;

      const horizontal = smoothstep(rangeProgress(intendedProgress, RESEARCH_START, RESEARCH_END));
      let panelIndex = Math.round(horizontal * (PANEL_COUNT - 1));
      if (origin !== null && direction !== 0) {
        const originProgress = (origin - sectionTop) / distance;
        const originHorizontal = smoothstep(
          rangeProgress(originProgress, RESEARCH_START, RESEARCH_END),
        );
        const originIndex = Math.round(originHorizontal * (PANEL_COUNT - 1));
        const originStop = sectionTop + PANEL_STOPS[originIndex] * distance;
        if (Math.abs(origin - originStop) < Math.max(32, window.innerHeight * 0.045)) {
          panelIndex = Math.max(0, Math.min(PANEL_COUNT - 1, originIndex + direction));
        }
      }
      const destination = sectionTop + PANEL_STOPS[panelIndex] * distance;
      if (Math.abs(destination - intendedScroll) < 3) return;

      if (lenis) {
        lenis.scrollTo(destination, {
          duration: 0.75,
          easing: (time) => 1 - (1 - time) ** 3,
        });
      } else {
        window.scrollTo({ top: destination, behavior: 'smooth' });
      }
    };

    const scheduleSettle = (delay = 180) => {
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(settle, delay);
    };
    const onWheel = (event: WheelEvent) => {
      if (event.deltaY === 0) return;
      noteGesture(event.deltaY);
      scheduleSettle();
    };
    const onScrollEnd = () => {
      if (!settleTimer) scheduleSettle(0);
    };
    const onTouchStart = (event: TouchEvent) => {
      touchMoved = false;
      touchStartY = event.touches[0]?.clientY ?? 0;
      gestureOrigin = window.scrollY;
    };
    const onTouchMove = () => {
      touchMoved = true;
    };
    const onTouchEnd = (event: TouchEvent) => {
      if (touchMoved) {
        noteGesture(touchStartY - (event.changedTouches[0]?.clientY ?? touchStartY));
        scheduleSettle(280);
      } else {
        gestureOrigin = null;
      }
    };
    const isScrollKey = (event: KeyboardEvent) =>
      ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' '].includes(event.key);
    const isEditable = (event: KeyboardEvent) =>
      event.target instanceof HTMLElement &&
      Boolean(event.target.closest('input, textarea, select, [contenteditable]'));
    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditable(event) || !isScrollKey(event)) return;
      noteGesture(event.key === 'ArrowUp' || event.key === 'PageUp' ? -1 : 1);
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (isEditable(event) || !isScrollKey(event)) return;
      scheduleSettle();
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('scrollend', onScrollEnd);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.clearTimeout(settleTimer);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scrollend', onScrollEnd);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [controller, lenis, staticExperience]);

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
      id="neuroshield"
      aria-labelledby="neuroshield-title"
      className={`neuroshield-chapter ns-redesign ${staticExperience ? 'neuroshield-static' : ''}`}
    >
      <div className="neuroshield-sticky">
        <div className="ns-opening">
          {staticExperience && (
            <Image
              className="ns-static-brain-preview"
              src="/models/neuroshield/anatomical-preview.png"
              width={900}
              height={780}
              alt="Lateral anatomical model of a human brain showing its sculpted folds, cerebellum, and brainstem"
              priority={false}
            />
          )}
          <h2 id="neuroshield-title" ref={identityRef} className="ns-identity">
            NEUROSHIELD
          </h2>
        </div>
        <section
          ref={researchRef}
          className="ns-research"
          aria-label="NeuroShield research sequence"
          inert={!staticExperience}
        >
          <div className="ns-research-background" aria-hidden="true">
            <div className="ns-bg-light ns-bg-light-primary" />
            <div className="ns-bg-light ns-bg-light-secondary" />
            <div className="ns-bg-ghost ns-bg-ghost-axial">
              <Image src={NEURO_IMAGE_URLS[0]} width={702} height={706} alt="" sizes="65vw" />
            </div>
            <div className="ns-bg-ghost ns-bg-ghost-series">
              <Image src={NEURO_IMAGE_URLS[1]} width={538} height={625} alt="" sizes="56vw" />
            </div>
            <div className="ns-bg-ghost ns-bg-ghost-coronal">
              <Image src={NEURO_IMAGE_URLS[3]} width={673} height={465} alt="" sizes="62vw" />
            </div>
            <div className="ns-bg-grid" />
            <div className="ns-bg-guides">
              <span className="ns-bg-mark ns-bg-mark-one" />
              <span className="ns-bg-mark ns-bg-mark-two" />
              <span className="ns-bg-mark ns-bg-mark-three" />
            </div>
            <div className="ns-bg-grain" />
          </div>
          <div className="ns-research-topline" aria-hidden="true">
            <span>NS / RESEARCH SEQUENCE</span>
            <span>OBSERVE · TEST · REVISE</span>
          </div>
          <div ref={trackRef} className="ns-research-track">
            {neuroShieldBeats.map((beat, index) => (
              <ResearchPanel key={beat.key} index={index} />
            ))}
          </div>
          <div className="ns-research-progress" aria-hidden="true">
            {neuroShieldBeats.map((beat) => (
              <span key={beat.key} />
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

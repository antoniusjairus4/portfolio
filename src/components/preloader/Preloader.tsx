'use client';

import type { CSSProperties } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useExperienceEnvironment } from '@/experience/ExperienceEnvironment';
import { useLenis } from '@/motion/lenis/LenisProvider';
import { PRELOADER_TIMINGS } from '@/motion/tokens';
import styles from './Preloader.module.css';
import {
  type CriticalResource,
  type ResourceStatus,
  useCriticalReadiness,
} from './useCriticalReadiness';

interface PreloaderProps {
  onCriticalReady?: () => void;
  onComplete: () => void;
}

type LoaderPhase = 'loading' | 'ready' | 'exiting' | 'dismissed';

const READY_HOLD_MS = 360;
const EXIT_DURATION_MS = 760;
const REDUCED_EXIT_DURATION_MS = 320;
const DISPLAY_FRAME_INTERVAL_MS = 42;
const MILESTONES = new Set([25, 50, 75, 100]);
const COUNTER_COLUMNS = ['hundreds', 'tens', 'ones'] as const;
const BLUEPRINT_TICKS = Array.from({ length: 25 }, (_, index) => 64 + index * 62);
const STATUS_ROWS: Array<[string, CriticalResource]> = [
  ['SCENES', 'scenes'],
  ['IMAGES', 'images'],
  ['TYPE', 'type'],
  ['MOTION', 'motion'],
];

function stageFor(progress: number, phase: LoaderPhase) {
  if (phase === 'ready' || phase === 'exiting') return 'SYSTEM CALIBRATION COMPLETE';
  if (progress < 20) return 'INITIALIZING SYSTEM';
  if (progress < 40) return 'LOADING ASSETS';
  if (progress < 60) return 'PREPARING TYPE';
  if (progress < 80) return 'BUILDING SCENES';
  if (progress < 95) return 'PREPARING MOTION';
  return 'FINALIZING EXPERIENCE';
}

function resourceValue(resource: CriticalResource, status: ResourceStatus) {
  if (status === 'deferred') return 'SAFE';
  if (resource === 'motion') return status === 'ready' ? 'READY' : 'INIT';
  if (resource === 'scenes') return status === 'ready' ? '06 / 06' : '00 / 06';
  if (resource === 'type') return status === 'ready' ? '03 / 03' : '00 / 03';
  return status === 'ready' ? '01 / 01' : '00 / 01';
}

function progressReveal(progress: number, start: number, end: number) {
  return Math.min(1, Math.max(0, (progress - start) / (end - start)));
}

function MechanicalCounter({ value, major }: { value: string; major: boolean }) {
  return (
    <div className={styles.mechanicalCounter} data-major={major || undefined} aria-hidden="true">
      {value.split('').map((digit, index) => (
        <span className={styles.digitViewport} key={COUNTER_COLUMNS[index]}>
          <span
            className={styles.digit}
            key={`${COUNTER_COLUMNS[index]}-${digit}`}
            style={{ '--digit-delay': `${index * 24}ms` } as CSSProperties}
          >
            {digit}
          </span>
        </span>
      ))}
    </div>
  );
}

export function Preloader({ onCriticalReady, onComplete }: PreloaderProps) {
  const { ready: environmentReady, reducedMotion } = useExperienceEnvironment();
  const { acquireScrollLock } = useLenis();
  const readiness = useCriticalReadiness({ environmentReady });
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const [phase, setPhase] = useState<LoaderPhase>('loading');
  const rootRef = useRef<HTMLDivElement>(null);
  const displayedRef = useRef(0);
  const lastDisplayFrameRef = useRef(0);
  const mountedAtRef = useRef(0);
  const releaseRef = useRef<(() => void) | null>(null);
  const completedRef = useRef(false);
  const criticalReadyRef = useRef(false);
  const completeRef = useRef(onComplete);
  const criticalCompleteRef = useRef(onCriticalReady);
  const timersRef = useRef<number[]>([]);
  completeRef.current = onComplete;
  criticalCompleteRef.current = onCriticalReady;

  useEffect(() => {
    mountedAtRef.current = performance.now();
    releaseRef.current = acquireScrollLock();

    return () => {
      timersRef.current.forEach((timer) => {
        window.clearTimeout(timer);
      });
      releaseRef.current?.();
      releaseRef.current = null;
    };
  }, [acquireScrollLock]);

  useEffect(() => {
    if (readiness.status === 'loading' || criticalReadyRef.current) return;
    criticalReadyRef.current = true;
    criticalCompleteRef.current?.();
  }, [readiness.status]);

  useEffect(() => {
    if (phase !== 'loading') return;

    let frame = 0;
    const animate = (now: number) => {
      const elapsed = Math.max(0, now - mountedAtRef.current);
      const timelineProgress =
        elapsed >= PRELOADER_TIMINGS.targetMs
          ? 100
          : Math.min(99.4, (elapsed / PRELOADER_TIMINGS.targetMs) * 100);
      const realProgress = readiness.status === 'loading' ? readiness.progress : 100;
      const next = Math.min(timelineProgress, realProgress);

      if (
        next > displayedRef.current &&
        (now - lastDisplayFrameRef.current >= DISPLAY_FRAME_INTERVAL_MS || next >= 100)
      ) {
        lastDisplayFrameRef.current = now;
        displayedRef.current = next;
        setDisplayedProgress(next);
      }

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [phase, readiness.progress, readiness.status]);

  useEffect(() => {
    if (
      completedRef.current ||
      phase !== 'loading' ||
      readiness.status === 'loading' ||
      displayedProgress < 99.95
    )
      return;

    completedRef.current = true;
    displayedRef.current = 100;
    setDisplayedProgress(100);
    setPhase('ready');

    const exitDuration = reducedMotion ? REDUCED_EXIT_DURATION_MS : EXIT_DURATION_MS;
    const exitTimer = window.setTimeout(() => setPhase('exiting'), READY_HOLD_MS);
    const dismissTimer = window.setTimeout(() => {
      releaseRef.current?.();
      releaseRef.current = null;
      setPhase('dismissed');
      completeRef.current();
    }, READY_HOLD_MS + exitDuration);

    timersRef.current.push(exitTimer, dismissTimer);
  }, [displayedProgress, phase, readiness.status, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    const root = rootRef.current;
    if (!root) return;

    const handlePointerMove = (event: PointerEvent) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      root.style.setProperty('--pointer-x', x.toFixed(3));
      root.style.setProperty('--pointer-y', y.toFixed(3));
    };
    const settlePointer = () => {
      root.style.setProperty('--pointer-x', '0');
      root.style.setProperty('--pointer-y', '0');
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', settlePointer);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', settlePointer);
    };
  }, [reducedMotion]);

  const progress = Math.min(100, Math.floor(displayedProgress));
  const counter = String(progress).padStart(3, '0');
  const stage = stageFor(progress, phase);
  const frame = String(Math.max(1, Math.round(displayedProgress * 2.4))).padStart(3, '0');
  const major = MILESTONES.has(progress);
  const crosshairX = 18 + displayedProgress * 0.62;
  const crosshairY = 24 + displayedProgress * 0.48;
  const coordinateX = (124.04 + displayedProgress * 0.61).toFixed(2);
  const coordinateY = (81.22 + displayedProgress * 0.37).toFixed(2);
  const rootStyle = useMemo(
    () =>
      ({
        '--loader-progress': displayedProgress / 100,
        '--measurement-reveal': progressReveal(displayedProgress, 20, 40),
        '--crosshair-reveal': progressReveal(displayedProgress, 38, 55),
        '--metadata-reveal': progressReveal(displayedProgress, 55, 72),
        '--nodes-reveal': progressReveal(displayedProgress, 76, 90),
        '--precision-reveal': progressReveal(displayedProgress, 45, 78),
        '--crosshair-x': `${crosshairX}%`,
        '--crosshair-y': `${crosshairY}%`,
      }) as CSSProperties,
    [crosshairX, crosshairY, displayedProgress],
  );

  if (phase === 'dismissed') return null;

  return (
    <div
      ref={rootRef}
      className={styles.preloader}
      data-phase={phase}
      data-progress-band={Math.min(4, Math.floor(progress / 25))}
      style={rootStyle}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      aria-label="Site preloader"
    >
      <div className={styles.majorGrid} aria-hidden="true" />
      <div className={styles.minorGrid} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />
      <div className={styles.scanLine} aria-hidden="true" />

      <svg
        className={styles.blueprint}
        viewBox="0 0 1600 900"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <g className={styles.primaryConstruction}>
          <path d="M64 178 H510 L642 316 H1084 L1238 148 H1528" />
          <path d="M138 718 H472 L618 574 H1136 L1284 724 H1498" />
          <path d="M308 74 V224 M1294 676 V832" />
          <circle cx="308" cy="224" r="42" />
          <circle cx="1294" cy="676" r="42" />
        </g>
        <g className={styles.measurementGeometry}>
          <path d="M202 286 H622 M590 250 V548 M232 550 H804" />
          <path d="M906 292 H1338 M1002 262 V610 M898 614 H1380" />
          <path d="M206 278 v16 M310 278 v16 M414 278 v16 M518 278 v16 M622 278 v16" />
        </g>
        <path
          className={styles.dottedPath}
          d="M104 442 C384 302 542 626 808 440 S1262 272 1494 446"
        />
        <g className={styles.registrationMarks}>
          <path d="M74 68 h52 M100 42 v52 M1474 806 h52 M1500 780 v52" />
          <path d="M780 450 h40 M800 430 v40" />
          <path d="M84 810 h78 v-16 M1438 90 h78 v16" />
        </g>
        <g className={styles.blueprintTicks}>
          {BLUEPRINT_TICKS.map((x, index) => (
            <path key={`tick-${x}`} d={`M${x} 874 v${index % 5 === 0 ? -18 : -9}`} />
          ))}
        </g>
      </svg>

      <div className={styles.nodeField} aria-hidden="true">
        <span className={`${styles.pathNode} ${styles.nodeOne}`} />
        <span className={`${styles.pathNode} ${styles.nodeTwo}`} />
        <span className={`${styles.pathNode} ${styles.nodeThree}`} />
        <span className={`${styles.pathNode} ${styles.nodeFour}`} />
      </div>

      <header className={styles.topRail}>
        <span>FRAME / {frame}</span>
        <span className={styles.topRule} aria-hidden="true" />
        <span>SYSTEM / PORTFOLIO</span>
      </header>

      <div className={styles.coordinateLeft}>
        X {coordinateX}
        <br />Y {coordinateY}
      </div>
      <div className={styles.coordinateRight}>
        NODE / ACTIVE
        <br />
        INIT / 2026
      </div>

      <div className={styles.crosshair} aria-hidden="true">
        <span className={styles.crosshairRing} />
        <span className={styles.crosshairHorizontal} />
        <span className={styles.crosshairVertical} />
        <span className={styles.crosshairLabel}>
          X {coordinateX}
          <br />Y {coordinateY}
        </span>
      </div>

      <main className={styles.primary}>
        <div className={styles.counterWrap}>
          <div className={styles.outlineCounter} aria-hidden="true">
            {counter}
          </div>
          <span className={styles.counterReference} aria-hidden="true" />
          <MechanicalCounter value={counter} major={major} />
          <div className={styles.counterMeasure} aria-hidden="true">
            <span>000</span>
            <span>100</span>
          </div>
          <div className={styles.loadLabel}>LOAD / {counter}</div>
          <div className={styles.stage}>{stage}</div>
        </div>

        <section className={styles.statusPanel} aria-label="System status">
          <div className={styles.statusHeading}>SYSTEM STATUS</div>
          {STATUS_ROWS.map(([label, resource]) => (
            <div className={styles.statusRow} data-status-resource={resource} key={resource}>
              <span>{label}</span>
              <span data-resource-state={readiness.resources[resource]}>
                {resourceValue(resource, readiness.resources[resource])}
              </span>
            </div>
          ))}
          <div className={styles.statusFrame}>
            <span>FRAME</span>
            <span>{frame}</span>
          </div>
        </section>
      </main>

      <footer className={styles.dataRail}>
        <div className={styles.dataRailMeta}>
          <span>SYS / AJ26</span>
          <span>FRAME / {frame}</span>
          <span>LOAD / {counter}</span>
          <span>BUILD / {phase === 'loading' ? 'CALIBRATING' : 'READY'}</span>
        </div>
        <div className={styles.progressRail} aria-hidden="true">
          <span className={styles.progressFill} />
          <span className={styles.progressCursor} />
          <div className={styles.progressTicks} />
        </div>
      </footer>

      <div className={styles.sweep} aria-hidden="true" />
      <div className="sr-only" aria-live="polite">
        {stage}. {progress} percent.
      </div>
    </div>
  );
}

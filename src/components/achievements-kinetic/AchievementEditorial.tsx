'use client';

import Image from 'next/image';
import type { CSSProperties, ReactNode, PointerEvent as ReactPointerEvent } from 'react';
import { useRef } from 'react';
import styles from '@/components/achievements-kinetic/AchievementEditorial.module.css';
import { achievementHighlights, chessPeakRatings } from '@/content/achievementsKinetic';

interface EditorialProps {
  reducedMotion: boolean;
  galleryFocus?: string | null;
}

interface EditorialFactsProps {
  eyebrow: string;
  items: readonly { label: string; value: string }[];
  className?: string;
}

const TRAJECTORY_GHOSTS = Array.from({ length: 7 }, (_, index) => index);
const IMPACT_RAYS = Array.from({ length: 18 }, (_, index) => index);
const TREE_VERTICALS = Array.from({ length: 9 }, (_, index) => 100 + index * 100);
const TREE_HORIZONTALS = Array.from({ length: 6 }, (_, index) => 70 + index * 95);
const SOUND_BARS = Array.from({ length: 42 }, (_, index) => {
  const wave = Math.abs(Math.sin(index * 0.58) * 0.72 + Math.sin(index * 0.19) * 0.28);
  return { id: `sound-${index}`, height: 12 + wave * 78, delay: index * 0.018 };
});

function InteractiveField({
  className,
  reducedMotion,
  children,
}: {
  className: string;
  reducedMotion: boolean;
  children: ReactNode;
}) {
  const fieldRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reducedMotion || !fieldRef.current) return;
    const rect = fieldRef.current.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    fieldRef.current.style.setProperty('--pointer-x', `${x * 100}%`);
    fieldRef.current.style.setProperty('--pointer-y', `${y * 100}%`);
    fieldRef.current.style.setProperty('--pointer-shift-x', `${(x - 0.5) * 14}px`);
    fieldRef.current.style.setProperty('--pointer-shift-y', `${(y - 0.5) * 10}px`);
  };

  const handlePointerLeave = () => {
    if (!fieldRef.current) return;
    fieldRef.current.style.setProperty('--pointer-x', '50%');
    fieldRef.current.style.setProperty('--pointer-y', '50%');
    fieldRef.current.style.setProperty('--pointer-shift-x', '0px');
    fieldRef.current.style.setProperty('--pointer-shift-y', '0px');
  };

  return (
    <div
      ref={fieldRef}
      className={`${styles.editorial} ${className}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {children}
    </div>
  );
}

function EditorialFacts({ eyebrow, items, className = '' }: EditorialFactsProps) {
  return (
    <section className={`${styles.facts} ${className}`} aria-label={eyebrow}>
      <p>{eyebrow}</p>
      <dl>
        {items.map((item) => (
          <div key={`${item.label}-${item.value}`}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function GallerySignal({ label }: { label?: string | null }) {
  return (
    <div className={styles.gallerySignal} aria-live="polite" data-visible={Boolean(label)}>
      <span>ARCHIVE FOCUS</span>
      <b>{label ?? 'PHOTOGRAPHIC RECORD'}</b>
    </div>
  );
}

function TableTennisPaddle({ reducedMotion }: { reducedMotion: boolean }) {
  const paddleRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reducedMotion || !paddleRef.current) return;

    const rect = paddleRef.current.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));

    paddleRef.current.style.setProperty('--paddle-x', `${(x - 0.5) * 30}px`);
    paddleRef.current.style.setProperty('--paddle-y', `${(y - 0.5) * 22}px`);
    paddleRef.current.style.setProperty('--paddle-rotate-x', `${(0.5 - y) * 8}deg`);
    paddleRef.current.style.setProperty('--paddle-rotate-y', `${(x - 0.5) * 10}deg`);
  };

  const handlePointerLeave = () => {
    if (!paddleRef.current) return;

    paddleRef.current.style.setProperty('--paddle-x', '0px');
    paddleRef.current.style.setProperty('--paddle-y', '0px');
    paddleRef.current.style.setProperty('--paddle-rotate-x', '0deg');
    paddleRef.current.style.setProperty('--paddle-rotate-y', '0deg');
  };

  return (
    <div
      ref={paddleRef}
      className={styles.tablePaddle}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <Image
        src="/images/achievements/table-tennis/black-rubber-racket.png"
        alt="Black table tennis paddle"
        width={1199}
        height={1312}
        sizes="(max-width: 860px) 42vw, 25vw"
        draggable={false}
      />
    </div>
  );
}

export function TableTennisEditorial({ reducedMotion, galleryFocus }: EditorialProps) {
  return (
    <InteractiveField className={styles.tableTennis} reducedMotion={reducedMotion}>
      <div className={styles.coordinateGrid} aria-hidden="true" />
      <div className={styles.tableHeading}>
        <span>TABLE</span>
        <span>TENNIS</span>
      </div>

      <TableTennisPaddle reducedMotion={reducedMotion} />

      <svg
        className={styles.trajectorySystem}
        viewBox="0 0 1000 680"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <g className={styles.courtFragments}>
          <path d="M86 540 L490 382 L914 538" />
          <path d="M490 382 L490 612" />
          <path d="M206 494 L778 494" />
          <path d="M118 554 L874 554" />
        </g>
        <g className={styles.trajectoryPaths}>
          <path d="M74 432 C218 74 310 614 472 312 S736 94 938 330" pathLength="1" />
          <path d="M62 454 C215 112 306 594 468 332 S744 122 952 350" pathLength="1" />
          <path d="M82 408 C224 48 324 602 482 292 S724 70 922 306" pathLength="1" />
        </g>
        <g className={styles.velocityVectors}>
          <path d="M258 262 L338 192 M338 192 L322 228 M338 192 L300 204" />
          <path d="M654 238 L742 202 M742 202 L708 198 M742 202 L716 224" />
          <path d="M478 315 L554 380 M554 380 L538 348 M554 380 L519 373" />
        </g>
        <g className={styles.contactMarks}>
          <circle cx="257" cy="263" r="9" />
          <circle cx="478" cy="315" r="11" />
          <circle cx="742" cy="202" r="8" />
        </g>
      </svg>

      <div className={styles.ballTrack} aria-hidden="true">
        <b className={styles.liveBall} />
        {TRAJECTORY_GHOSTS.map((ghost) => (
          <i key={ghost} style={{ '--ghost-index': ghost } as CSSProperties} />
        ))}
      </div>

      <div className={styles.spinTarget} aria-hidden="true">
        <i />
        <i />
        <i />
        <span>CONTACT / 02</span>
      </div>

      <ul className={styles.metricRail} aria-label="Table tennis motion concepts">
        {['VELOCITY', 'SPIN', 'TRAJECTORY', 'CONTACT', 'ARC'].map((item, index) => (
          <li key={item}>
            <i>{String(index + 1).padStart(2, '0')}</i>
            {item}
          </li>
        ))}
      </ul>

      <div className={styles.tableVictory}>
        <strong>2×</strong>
        <p>
          STATE
          <br />
          CHAMPION
        </p>
      </div>

      <EditorialFacts
        eyebrow="TABLE TENNIS HONORS"
        items={achievementHighlights.tableTennis}
        className={styles.tableFacts}
      />
      <GallerySignal label={galleryFocus} />
    </InteractiveField>
  );
}

export function KarateEditorial({ reducedMotion, galleryFocus }: EditorialProps) {
  return (
    <InteractiveField className={styles.karate} reducedMotion={reducedMotion}>
      <div className={styles.karateGrid} aria-hidden="true" />
      <div className={styles.danMark} aria-hidden="true">
        01 DAN
      </div>
      <div className={styles.karateHeading}>
        <span>BLACK</span>
        <span>BELT</span>
      </div>
      <div className={styles.impactAxis} aria-hidden="true" />
      <div className={styles.impactCore} aria-hidden="true">
        <b />
        <i />
        <span />
        {IMPACT_RAYS.map((ray) => (
          <em key={ray} style={{ '--ray-index': ray } as CSSProperties} />
        ))}
      </div>
      <p className={styles.stillnessLabel}>STILLNESS → IMPACT → STILLNESS</p>
      <EditorialFacts
        eyebrow="KARATE HONORS"
        items={achievementHighlights.karate}
        className={styles.karateFacts}
      />
      <ul className={styles.karatePrinciples} aria-label="Karate principles">
        <li>CONTROL</li>
        <li>POWER</li>
        <li>DISCIPLINE</li>
      </ul>
      <GallerySignal label={galleryFocus} />
    </InteractiveField>
  );
}

const TREE_NODES = [
  [500, 98, 'A0'],
  [360, 208, 'B1'],
  [640, 208, 'B2'],
  [252, 330, 'C1'],
  [420, 330, 'C2'],
  [578, 330, 'C3'],
  [758, 330, 'C4'],
  [170, 468, 'D1'],
  [310, 468, 'D2'],
  [506, 468, 'D3'],
  [676, 468, 'D4'],
  [842, 468, 'D5'],
] as const;

const TREE_PATHS = [
  'M500 98 L360 208',
  'M500 98 L640 208',
  'M360 208 L252 330',
  'M360 208 L420 330',
  'M640 208 L578 330',
  'M640 208 L758 330',
  'M252 330 L170 468',
  'M252 330 L310 468',
  'M420 330 L506 468',
  'M578 330 L506 468',
  'M578 330 L676 468',
  'M758 330 L842 468',
] as const;

export function ChessEditorial({ reducedMotion, galleryFocus }: EditorialProps) {
  return (
    <InteractiveField className={styles.chess} reducedMotion={reducedMotion}>
      <div className={styles.chessCoordinates} aria-hidden="true" />
      <div className={styles.chessHeading}>
        <p>CALCULATION / PRECISION / DECISION</p>
        <h3>CHESS</h3>
      </div>

      <svg
        className={styles.decisionTree}
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid meet"
        aria-label="Abstract branching chess decision tree"
      >
        <g className={styles.treeGrid}>
          {TREE_VERTICALS.map((coordinate) => (
            <path key={`v-${coordinate}`} d={`M${coordinate} 40 V560`} />
          ))}
          {TREE_HORIZONTALS.map((coordinate) => (
            <path key={`h-${coordinate}`} d={`M70 ${coordinate} H930`} />
          ))}
        </g>
        <g className={styles.treeBranches}>
          {TREE_PATHS.map((path, index) => (
            <path
              key={path}
              d={path}
              pathLength="1"
              style={{ '--branch': index } as CSSProperties}
            />
          ))}
        </g>
        <g className={styles.treeNodes}>
          {TREE_NODES.map(([x, y, label], index) => (
            <g
              key={label}
              transform={`translate(${x} ${y})`}
              style={{ '--node': index } as CSSProperties}
            >
              <circle r={index === 0 ? 13 : 8} />
              <circle className={styles.nodeHalo} r={index === 0 ? 29 : 20} />
              <text x="15" y="-13">
                {label}
              </text>
            </g>
          ))}
        </g>
        <path
          className={styles.evaluationLine}
          d="M500 98 L360 208 L420 330 L506 468"
          pathLength="1"
        />
      </svg>

      <div className={styles.analysisLabels} aria-hidden="true">
        <span>DEPTH / 18</span>
        <span>POSITION / ACTIVE</span>
        <span>CALCULATING</span>
        <span>EVALUATION / +0.42</span>
        <span>SEQUENCE / 04</span>
      </div>

      <dl className={styles.ratingField}>
        {chessPeakRatings.map((rating, index) => (
          <div key={rating.label} style={{ '--rating-index': index } as CSSProperties}>
            <dd>{rating.value}</dd>
            <dt>{rating.label}</dt>
          </div>
        ))}
      </dl>
      <GallerySignal label={galleryFocus} />
    </InteractiveField>
  );
}

export function PublicSpeakingEditorial({ reducedMotion, galleryFocus }: EditorialProps) {
  return (
    <InteractiveField className={styles.speaking} reducedMotion={reducedMotion}>
      <div className={styles.speakingGlow} aria-hidden="true" />
      <div className={styles.speakingHeading}>
        <p>PUBLIC SPEAKING</p>
        <div>
          <strong>15+</strong>
          <h3>
            SUCCESSFUL
            <br />
            SPEECHES
          </h3>
        </div>
      </div>
      <div className={styles.reachMetric}>
        <strong>15,000</strong>
        <span>PEOPLE ADDRESSED</span>
      </div>

      <div className={styles.soundField} aria-hidden="true">
        <div className={styles.soundRings}>
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className={styles.waveform}>
          {SOUND_BARS.map((bar) => (
            <i
              key={bar.id}
              style={
                {
                  '--bar-height': `${bar.height}%`,
                  '--bar-delay': bar.delay,
                } as CSSProperties
              }
            />
          ))}
        </div>
        <svg
          className={styles.amplitudeCurve}
          viewBox="0 0 1000 240"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0 126 C120 126 160 124 220 126 C302 130 316 72 380 126 C438 175 480 38 540 126 C602 218 650 42 708 126 C770 214 822 84 876 126 C918 159 956 126 1000 126" />
        </svg>
      </div>

      <ul className={styles.voiceProgression} aria-label="Voice amplification progression">
        {['VOICE', 'ROOM', 'AUDIENCE', 'PRESENCE'].map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div className={styles.speakingMotifs} aria-hidden="true">
        <span>PRESENCE</span>
        <span>CLARITY</span>
        <span>PAUSE</span>
        <span>DELIVERY</span>
        <span>AMPLIFICATION</span>
      </div>

      <div className={styles.speakingFacts}>
        <EditorialFacts eyebrow="MUSIC" items={achievementHighlights.music} />
        <EditorialFacts eyebrow="SPEAKING" items={achievementHighlights.speeches} />
      </div>
      <GallerySignal label={galleryFocus} />
    </InteractiveField>
  );
}

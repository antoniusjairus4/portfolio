'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import type { CSSProperties, ReactNode, PointerEvent as ReactPointerEvent } from 'react';
import { useRef } from 'react';
import styles from '@/components/achievements-kinetic/AchievementEditorial.module.css';
import { achievementHighlights } from '@/content/achievementsKinetic';

const ChessHero3D = dynamic(() => import('@/components/achievements-kinetic/ChessHero3D'), {
  ssr: false,
});

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
        sizes="(max-width: 860px) 60vw, 36vw"
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

function TiedBlackBeltSVG() {
  return (
    <svg
      className={styles.abstractBeltSvg}
      viewBox="0 0 1000 680"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <filter id="beltPageShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="18" stdDeviation="22" floodColor="#080705" floodOpacity="0.36" />
          <feDropShadow dx="0" dy="5" stdDeviation="7" floodColor="#020101" floodOpacity="0.52" />
        </filter>

        <filter id="creaseShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow
            dx="-1"
            dy="3.5"
            stdDeviation="3.5"
            floodColor="#000000"
            floodOpacity="0.95"
          />
        </filter>

        <filter id="patchShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow
            dx="0.8"
            dy="1.6"
            stdDeviation="2"
            floodColor="#000000"
            floodOpacity="0.65"
          />
        </filter>

        <pattern
          id="beltCanvasTwill"
          width="4"
          height="4"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="4" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.85" />
          <line x1="0" y1="0" x2="4" y2="0" stroke="rgba(0, 0, 0, 0.7)" strokeWidth="0.85" />
        </pattern>

        <linearGradient id="waistGrad" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#24211e" />
          <stop offset="25%" stopColor="#171513" />
          <stop offset="70%" stopColor="#0d0c0a" />
          <stop offset="100%" stopColor="#050403" />
        </linearGradient>

        <linearGradient id="tail1Grad" x1="0.9" y1="0.1" x2="0.1" y2="0.9">
          <stop offset="0%" stopColor="#282522" />
          <stop offset="15%" stopColor="#191715" />
          <stop offset="60%" stopColor="#0d0c0a" />
          <stop offset="100%" stopColor="#040302" />
        </linearGradient>

        <linearGradient id="tail2Grad" x1="0.1" y1="0.1" x2="0.9" y2="0.9">
          <stop offset="0%" stopColor="#2a2724" />
          <stop offset="20%" stopColor="#1a1816" />
          <stop offset="70%" stopColor="#0d0c0a" />
          <stop offset="100%" stopColor="#040302" />
        </linearGradient>

        <linearGradient id="knotBaseLoopGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#262320" />
          <stop offset="35%" stopColor="#181613" />
          <stop offset="100%" stopColor="#070605" />
        </linearGradient>

        <linearGradient id="cinchCollarGrad" x1="0" y1="0" x2="1" y2="0.9">
          <stop offset="0%" stopColor="#151311" />
          <stop offset="22%" stopColor="#322d27" />
          <stop offset="55%" stopColor="#1e1b18" />
          <stop offset="85%" stopColor="#0d0c0a" />
          <stop offset="100%" stopColor="#040302" />
        </linearGradient>

        <linearGradient id="cinchTopLipGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3d372e" />
          <stop offset="50%" stopColor="#24201b" />
          <stop offset="100%" stopColor="#090807" />
        </linearGradient>

        <linearGradient id="patchGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8a1e2b" />
          <stop offset="55%" stopColor="#741520" />
          <stop offset="100%" stopColor="#5a0d16" />
        </linearGradient>

        <linearGradient id="goldStripeGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#deb448" />
          <stop offset="45%" stopColor="#fced9d" />
          <stop offset="100%" stopColor="#b28822" />
        </linearGradient>
      </defs>

      <g filter="url(#beltPageShadow)">
        {/* 1. Continuous Waist Band */}
        <g>
          <path
            d="M -30 190 C 130 198, 360 224, 560 254 L 554 304 C 352 274, 125 248, -30 240 Z"
            fill="url(#waistGrad)"
          />
          <path
            d="M -30 190 C 130 198, 360 224, 560 254 L 554 304 C 352 274, 125 248, -30 240 Z"
            fill="url(#beltCanvasTwill)"
          />
          <path
            d="M -30 190 C 130 198, 360 224, 560 254"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={0.8}
            fill="none"
          />
          <path
            d="M -30 202 C 130 210, 360 236, 558 266"
            stroke="rgba(44,40,36,0.72)"
            strokeWidth={0.75}
            strokeDasharray="6 3"
            fill="none"
          />
          <path
            d="M -30 215 C 128 223, 358 249, 556 279"
            stroke="rgba(44,40,36,0.72)"
            strokeWidth={0.75}
            strokeDasharray="6 3"
            fill="none"
          />
          <path
            d="M -30 227 C 126 235, 355 261, 554 292"
            stroke="rgba(44,40,36,0.72)"
            strokeWidth={0.75}
            strokeDasharray="6 3"
            fill="none"
          />
          <path
            d="M -30 240 C 125 248, 352 274, 554 304"
            stroke="rgba(0,0,0,0.65)"
            strokeWidth={1.2}
            fill="none"
          />
        </g>

        {/* 2. Tail 1 (Major Diagonal Tail Sweeping Down-Left) */}
        <g>
          <path
            d="M 548 286 C 485 362, 396 450, 282 516 C 228 546, 172 568, 108 584 L 126 634 C 190 618, 248 594, 306 560 C 424 492, 516 394, 594 322 Z"
            fill="url(#tail1Grad)"
          />
          <path
            d="M 548 286 C 485 362, 396 450, 282 516 C 228 546, 172 568, 108 584 L 126 634 C 190 618, 248 594, 306 560 C 424 492, 516 394, 594 322 Z"
            fill="url(#beltCanvasTwill)"
          />
          <path
            d="M 548 286 C 485 362, 396 450, 282 516 C 228 546, 172 568, 108 584"
            stroke="rgba(255,255,255,0.09)"
            strokeWidth={0.85}
            fill="none"
          />
          <path
            d="M 126 634 C 190 618, 248 594, 306 560 C 424 492, 516 394, 594 322"
            stroke="rgba(0,0,0,0.75)"
            strokeWidth={1.3}
            fill="none"
          />
          <path
            d="M 108 584 Q 112 587 114 597 L 121 621 Q 123 631 126 634"
            stroke="rgba(50,45,41,0.85)"
            strokeWidth={1.2}
            fill="none"
          />
          <path
            d="M 556 296 C 493 372, 404 460, 289 527 C 236 557, 180 580, 113 596"
            stroke="rgba(44,40,36,0.75)"
            strokeWidth={0.8}
            strokeDasharray="7 3"
            fill="none"
          />
          <path
            d="M 564 306 C 501 382, 412 470, 297 538 C 243 569, 188 592, 118 608"
            stroke="rgba(44,40,36,0.75)"
            strokeWidth={0.8}
            strokeDasharray="7 3"
            fill="none"
          />
          <path
            d="M 572 316 C 509 392, 420 480, 304 549 C 251 580, 196 604, 123 621"
            stroke="rgba(44,40,36,0.75)"
            strokeWidth={0.8}
            strokeDasharray="7 3"
            fill="none"
          />
        </g>

        {/* 3. Tail 2 (Right Tail with 01 DAN Rank Patch) */}
        <g>
          <path
            d="M 622 258 C 686 254, 764 274, 826 312 C 870 335, 908 364, 938 396 L 910 442 C 882 413, 844 386, 802 363 C 742 328, 674 310, 612 312 Z"
            fill="url(#tail2Grad)"
          />
          <path
            d="M 622 258 C 686 254, 764 274, 826 312 C 870 335, 908 364, 938 396 L 910 442 C 882 413, 844 386, 802 363 C 742 328, 674 310, 612 312 Z"
            fill="url(#beltCanvasTwill)"
          />
          <path
            d="M 622 258 C 686 254, 764 274, 826 312 C 870 335, 908 364, 938 396"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={0.8}
            fill="none"
          />
          <path
            d="M 910 442 C 882 413, 844 386, 802 363 C 742 328, 674 310, 612 312"
            stroke="rgba(0,0,0,0.72)"
            strokeWidth={1.3}
            fill="none"
          />
          <path
            d="M 938 396 Q 933 403 929 415 L 918 435 Q 913 440 910 442"
            stroke="rgba(50,45,41,0.85)"
            strokeWidth={1.2}
            fill="none"
          />
          <path
            d="M 620 270 C 682 266, 758 287, 819 325 C 862 348, 899 376, 931 407"
            stroke="rgba(44,40,36,0.75)"
            strokeWidth={0.8}
            strokeDasharray="7 3"
            fill="none"
          />
          <path
            d="M 617 283 C 677 278, 752 299, 813 338 C 854 361, 891 389, 924 419"
            stroke="rgba(44,40,36,0.75)"
            strokeWidth={0.8}
            strokeDasharray="7 3"
            fill="none"
          />
          <path
            d="M 614 296 C 672 291, 745 311, 807 350 C 846 373, 883 401, 916 431"
            stroke="rgba(44,40,36,0.75)"
            strokeWidth={0.8}
            strokeDasharray="7 3"
            fill="none"
          />

          {/* 01 DAN Embroidered Crimson Rank Patch */}
          <g
            transform="translate(856, 380) rotate(26) translate(-32, -22)"
            filter="url(#patchShadow)"
          >
            <rect x="0" y="0" width="64" height="44" rx="2.5" fill="url(#patchGrad)" />
            <rect
              x="0"
              y="0"
              width="64"
              height="44"
              rx="2.5"
              fill="url(#beltCanvasTwill)"
              opacity={0.4}
            />
            <rect
              x="2.5"
              y="2.5"
              width="59"
              height="39"
              rx="1.5"
              fill="none"
              stroke="#440d12"
              strokeWidth={0.9}
              strokeDasharray="3 1.5"
            />
            <rect
              x="10"
              y="7"
              width="4.5"
              height="30"
              rx="1"
              fill="url(#goldStripeGrad)"
              stroke="#8e6819"
              strokeWidth={0.5}
            />
            <text
              x="21"
              y="27"
              fontFamily="'JetBrains Mono Variable', monospace"
              fontSize="11"
              fontWeight="700"
              letterSpacing="0.12em"
              fill="#f4ede1"
              filter="drop-shadow(0 1px 1px rgba(0,0,0,0.6))"
            >
              01 DAN
            </text>
          </g>
        </g>

        {/* 4. Obi Square Knot Core */}
        <ellipse
          cx="592"
          cy="274"
          rx="54"
          ry="36"
          fill="#010101"
          opacity={0.9}
          filter="blur(6px)"
        />

        <path
          d="M 536 248 C 548 238, 580 236, 612 242 C 614 260, 608 282, 596 298 C 572 306, 544 300, 530 284 C 522 270, 526 254, 536 248 Z"
          fill="url(#knotBaseLoopGrad)"
        />
        <path
          d="M 536 248 C 548 238, 580 236, 612 242 C 614 260, 608 282, 596 298 C 572 306, 544 300, 530 284 C 522 270, 526 254, 536 248 Z"
          fill="url(#beltCanvasTwill)"
        />
        <path
          d="M 530 284 C 522 270, 526 254, 536 248"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth={0.9}
          fill="none"
        />

        <path
          d="M 602 238 C 630 234, 662 242, 678 260 C 684 278, 676 298, 656 310 C 634 316, 606 310, 594 296 Z"
          fill="url(#knotBaseLoopGrad)"
        />
        <path
          d="M 602 238 C 630 234, 662 242, 678 260 C 684 278, 676 298, 656 310 C 634 316, 606 310, 594 296 Z"
          fill="url(#beltCanvasTwill)"
        />
        <path
          d="M 662 242 C 678 260, 684 278, 676 298"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth={0.9}
          fill="none"
        />

        <g transform="rotate(11, 592, 274)" filter="url(#creaseShadow)">
          <path
            d="M 564 220 C 586 212, 616 214, 632 222 C 640 244, 636 288, 628 312 C 612 320, 584 320, 566 312 C 556 290, 558 244, 564 220 Z"
            fill="url(#cinchCollarGrad)"
          />
          <path
            d="M 564 220 C 586 212, 616 214, 632 222 C 640 244, 636 288, 628 312 C 612 320, 584 320, 566 312 C 556 290, 558 244, 564 220 Z"
            fill="url(#beltCanvasTwill)"
          />
          <path
            d="M 564 220 C 584 213, 614 215, 632 222 C 630 228, 604 231, 574 227 Z"
            fill="url(#cinchTopLipGrad)"
          />
          <path
            d="M 564 220 C 584 213, 614 215, 632 222"
            stroke="rgba(255,255,255,0.24)"
            strokeWidth={1}
            fill="none"
          />
          <path
            d="M 566 312 C 586 320, 612 320, 628 312 C 626 305, 602 303, 574 305 Z"
            fill="#040302"
          />
          <path
            d="M 566 312 C 586 320, 612 320, 628 312"
            stroke="rgba(0,0,0,0.95)"
            strokeWidth={1.3}
            fill="none"
          />
          <path
            d="M 572 225 L 570 308"
            stroke="rgba(44,40,36,0.72)"
            strokeWidth={0.75}
            strokeDasharray="5 2.5"
            fill="none"
          />
          <path
            d="M 622 226 L 620 308"
            stroke="rgba(44,40,36,0.72)"
            strokeWidth={0.75}
            strokeDasharray="5 2.5"
            fill="none"
          />
          <path
            d="M 558 230 C 556 258, 554 286, 558 308"
            stroke="#000000"
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
            opacity={0.95}
          />
          <path
            d="M 636 228 C 640 256, 638 286, 634 306"
            stroke="#000000"
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
            opacity={0.95}
          />
          <path
            d="M 590 226 C 595 250, 594 280, 589 304"
            stroke="rgba(255,255,255,0.14)"
            strokeWidth={0.95}
            strokeLinecap="round"
            fill="none"
          />
        </g>
      </g>
    </svg>
  );
}

export function KarateEditorial({ reducedMotion, galleryFocus }: EditorialProps) {
  return (
    <InteractiveField className={styles.karate} reducedMotion={reducedMotion}>
      {/* Layer 1: Warm bone/ivory atmosphere with micro-texture */}
      <div className={styles.karateAtmosphere} aria-hidden="true" />

      {/* Layer 2: Architectural construction grid & registration ticks */}
      <div className={styles.karateGrid} aria-hidden="true">
        <span className={styles.gridCrosshairTL}>+</span>
        <span className={styles.gridCrosshairTR}>+</span>
        <span className={styles.gridCrosshairBL}>+</span>
        <span className={styles.gridCrosshairBR}>+</span>
        <div className={styles.gridHorizontalRule} />
        <div className={styles.gridVerticalRule} />
      </div>

      {/* Layer 3: Giant Architectural "01 DAN" background typography */}
      <div className={styles.danArchitecture} aria-hidden="true">
        <span className={styles.danNumeral}>01</span>
        <span className={styles.danWord}>DAN</span>
      </div>

      {/* Layer 4: Precision Technical SVG Environment (Rings, Strike Vectors, Measurement) */}
      <svg
        className={styles.karateVectorSystem}
        viewBox="0 0 1000 680"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* Subtle structural construction lines */}
        <g className={styles.karateConstructionLines}>
          <line x1="60" y1="210" x2="940" y2="210" />
          <line x1="60" y1="470" x2="940" y2="470" />
          <line x1="360" y1="50" x2="360" y2="630" />
          <line x1="640" y1="50" x2="640" y2="630" />
        </g>

        {/* Dynamic Strike Vectors & Diagonal Tension Line */}
        <g className={styles.karateStrikeVectors}>
          <line x1="40" y1="560" x2="920" y2="130" className={styles.strikePrimaryRed} />
          <line x1="180" y1="120" x2="820" y2="580" className={styles.strikeSecondaryLine} />
          <path d="M880 150 L920 130 L900 170" className={styles.strikeVectorArrow} />
          <path
            d="M240 460 L270 460 M320 460 L350 460 M400 460 L430 460"
            className={styles.strikeDashTicks}
          />
        </g>

        {/* Impact System: Concentric Calibration Rings */}
        <g className={styles.karateImpactRings}>
          <circle cx="500" cy="360" r="34" className={styles.ringInner} />
          <circle cx="500" cy="360" r="82" className={styles.ringMid} />
          <circle cx="500" cy="360" r="156" className={styles.ringOuter} />
          <circle cx="500" cy="360" r="248" className={styles.ringPerimeter} />
          <line x1="500" y1="180" x2="500" y2="540" className={styles.impactAxisY} />
          <line x1="320" y1="360" x2="680" y2="360" className={styles.impactAxisX} />
        </g>

        {/* Technical Coordinate Annotations */}
        <g className={styles.karateTechMarks}>
          <circle cx="500" cy="360" r="4.5" className={styles.impactCenterPoint} />
          <circle cx="180" cy="120" r="3" className={styles.vectorPoint} />
          <circle cx="820" cy="580" r="3" className={styles.vectorPoint} />
          <text x="516" y="352" className={styles.techText}>
            IMPACT {'//'} 0.42s
          </text>
          <text x="76" y="202" className={styles.techText}>
            AXIS {'//'} KATA DYNAMICS
          </text>
          <text x="760" y="122" className={styles.techText}>
            STRIKE ANGLE 26.2°
          </text>
        </g>
      </svg>

      {/* Layer 5: Central Visual Motif — Master Tied Black Belt */}
      <div className={styles.abstractBeltGroup} aria-hidden="true">
        <TiedBlackBeltSVG />
      </div>

      {/* Layer 6A: Subordinate Achievement Title (Top-Left) */}
      <div className={styles.subordinateBeltTitle}>
        <span className={styles.beltTitlePrefix}>01 {'//'} DAN RANK</span>
        <div className={styles.beltWordsStack}>
          <span>BLACK</span>
          <span>BELT</span>
        </div>
      </div>

      {/* Layer 6B: Dominant Hero Typography (Bottom-Right) */}
      <div className={styles.heroKarateWrapper}>
        <h3 className={styles.heroKarate}>KARATE</h3>
      </div>

      {/* Layer 7: Integrated Karate Honors (upper-right) */}
      <EditorialFacts
        eyebrow="KARATE HONORS"
        items={achievementHighlights.karate}
        className={styles.karateFacts}
      />

      {/* Atmospheric Micro-Annotations */}
      <div className={styles.karateAnnotations} aria-hidden="true">
        <span>IMPACT / PRECISION / STILLNESS</span>
        <span className={styles.annotationDot}>•</span>
        <span>KATA & KUMITE</span>
      </div>

      {/* Bottom Structural Labels Rail */}
      <ul className={styles.karatePrinciplesRail} aria-label="Karate structural principles">
        <li>
          <i>01</i>
          <span>CONTROL</span>
        </li>
        <li className={styles.principleDivider} aria-hidden="true">
          /
        </li>
        <li>
          <i>02</i>
          <span>POWER</span>
        </li>
        <li className={styles.principleDivider} aria-hidden="true">
          /
        </li>
        <li>
          <i>03</i>
          <span>DISCIPLINE</span>
        </li>
      </ul>

      <GallerySignal label={galleryFocus} />
    </InteractiveField>
  );
}

export function ChessEditorial({ reducedMotion, galleryFocus }: EditorialProps) {
  return (
    <InteractiveField className={styles.chess} reducedMotion={reducedMotion}>
      {/* Layer 3: Monumental Hero Heading (Left-Top) */}
      <div className={styles.chessHeading}>
        <span className={styles.chessPrefix}>03 {'//'} CALCULATION / PRECISION / DECISION</span>
        <h3 className={styles.heroChess}>CHESS</h3>
        <p className={styles.chessConcept}>TACTICAL CALCULATION / DEPTH 18</p>
      </div>

      {/* Layer 4: Tactical Calculation Tree (Behind and around pieces) */}
      <svg
        className={styles.chessCalculationSystem}
        viewBox="0 0 1000 680"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <filter id="crimsonGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#c42838" floodOpacity="0.85" />
          </filter>
        </defs>

        {/* Alternative variations (rejected calculation branches in faint warm grey) */}
        <g className={styles.alternativeBranches}>
          <path d="M 340 220 L 440 145 L 560 120" />
          <path d="M 440 145 L 520 85" />
          <path d="M 500 280 L 600 215 L 740 185" />
          <path d="M 500 280 L 580 395 L 700 445" />
          <path d="M 670 345 L 780 275 L 890 250" />
          <path d="M 670 345 L 750 425" />
        </g>

        {/* Primary calculated line (Crimson variation: A0 -> B1 -> C2 -> D3) */}
        <path
          className={styles.primaryVariationPath}
          d="M 340 220 L 500 280 L 670 345 L 830 395"
          filter="url(#crimsonGlow)"
        />

        {/* Crimson decision splits: the active calculation explores both sides */}
        <g className={styles.primaryVariationBranches} filter="url(#crimsonGlow)">
          <path d="M 340 220 L 440 145 L 560 120" />
          <path d="M 440 145 L 520 85" />
          <path d="M 500 280 L 600 215 L 740 185" />
          <path d="M 500 280 L 580 395 L 700 445" />
          <path d="M 670 345 L 780 275 L 890 250" />
          <path d="M 670 345 L 750 425" />
        </g>

        <g className={styles.primaryBranchTerminals}>
          <circle cx="560" cy="120" r="4" />
          <circle cx="520" cy="85" r="4" />
          <circle cx="740" cy="185" r="4" />
          <circle cx="700" cy="445" r="4" />
          <circle cx="890" cy="250" r="4" />
          <circle cx="750" cy="425" r="4" />
        </g>

        {/* Alternative node markers */}
        <g className={styles.alternativeNodes}>
          <circle cx="440" cy="145" r="3.5" />
          <circle cx="560" cy="120" r="3" />
          <circle cx="600" cy="215" r="3.5" />
          <circle cx="740" cy="185" r="3" />
          <circle cx="580" cy="395" r="3.5" />
          <circle cx="700" cy="445" r="3" />
          <circle cx="780" cy="275" r="3.5" />
          <text x="448" y="141">
            B0 {'//'} e5
          </text>
          <text x="608" y="211">
            C1 {'//'} Nc3
          </text>
          <text x="588" y="407">
            C3 {'//'} c3
          </text>
        </g>

        {/* Primary variation nodes */}
        <g className={styles.primaryNodes}>
          {/* A0 */}
          <g transform="translate(340, 220)">
            <circle r="6" className={styles.nodeCore} />
            <circle r="14" className={styles.nodeRing} />
            <text x="14" y="-8">
              A0 {'//'} 1. e4
            </text>
          </g>

          {/* B1 */}
          <g transform="translate(500, 280)">
            <circle r="6.5" className={styles.nodeCore} />
            <circle r="16" className={styles.nodeRing} />
            <text x="14" y="-8">
              B1 {'//'} 1... c5
            </text>
          </g>

          {/* C2 */}
          <g transform="translate(670, 345)">
            <circle r="7" className={styles.nodeCore} />
            <circle r="18" className={styles.nodeRing} />
            <text x="14" y="-8">
              C2 {'//'} 2. Nf3
            </text>
          </g>

          {/* D3 (Active Target Node) */}
          <g transform="translate(830, 395)">
            <circle r="8" className={styles.activeNodeCore} />
            <circle r="24" className={styles.activeTerminalHalo} />
            <circle r="36" className={styles.activeTerminalWave} />
            <text x="16" y="-10" className={styles.activeNodeLabel}>
              D3 {'//'} 2... d6 [ACTIVE]
            </text>
          </g>
        </g>
      </svg>

      {/* Layer 5: Dedicated 3D Hero Composition (Oversized King, Queen, Knight, Board) */}
      <div className={styles.chessHeroContainer} aria-hidden="true">
        <ChessHero3D reducedMotion={reducedMotion} />
      </div>

      {/* Layer 6: Floating Tactical Micro-Readouts */}
      <div className={styles.chessTechReadout} aria-hidden="true">
        <span>DEPTH / 18 PLY</span>
        <span className={styles.readoutDot}>•</span>
        <span>POSITION / ACTIVE</span>
        <span className={styles.readoutDot}>•</span>
        <span>EVAL / +0.42</span>
        <span className={styles.readoutDot}>•</span>
        <span>SEQUENCE / 04</span>
      </div>

      {/* Layer 7: Reworked Dominant Rating Blocks (Visual Triangle Anchor) */}
      <section className={styles.chessRatingsSystem} aria-label="Peak competitive chess ratings">
        <div className={styles.ratingBlock} style={{ '--rating-order': 0 } as CSSProperties}>
          <span className={styles.ratingIndex}>01 {'//'} RAPID</span>
          <strong className={styles.ratingValue}>1984</strong>
          <span className={styles.ratingLabel}>PEAK RATING</span>
        </div>

        <div className={styles.ratingSeparator} aria-hidden="true" />

        <div className={styles.ratingBlock} style={{ '--rating-order': 1 } as CSSProperties}>
          <span className={styles.ratingIndex}>02 {'//'} BLITZ</span>
          <strong className={styles.ratingValue}>2010</strong>
          <span className={styles.ratingLabel}>PEAK RATING</span>
        </div>

        <div className={styles.ratingSeparator} aria-hidden="true" />

        <div className={styles.ratingBlock} style={{ '--rating-order': 2 } as CSSProperties}>
          <span className={styles.ratingIndex}>03 {'//'} BULLET</span>
          <strong className={styles.ratingValue}>2198</strong>
          <span className={styles.ratingLabel}>PEAK RATING</span>
        </div>
      </section>

      {/* Layer 8: Bottom Structural Principles Rail */}
      <ul className={styles.chessPrinciplesRail} aria-label="Chess strategic principles">
        <li>
          <i>01</i>
          <span>CALCULATION</span>
        </li>
        <li className={styles.principleDivider} aria-hidden="true">
          /
        </li>
        <li>
          <i>02</i>
          <span>PRESSURE</span>
        </li>
        <li className={styles.principleDivider} aria-hidden="true">
          /
        </li>
        <li>
          <i>03</i>
          <span>DECISION</span>
        </li>
      </ul>

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

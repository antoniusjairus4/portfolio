'use client';

import type { ReactNode, RefObject } from 'react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import styles from '@/components/achievements-kinetic/AchievementsChapter.module.css';
import {
  type AchievementPanelKey,
  getAchievementBeat,
  getAchievementMotion,
} from '@/components/achievements-kinetic/achievementsChoreography';
import ChromaGrid, { type ChromaItem } from '@/components/achievements-kinetic/ChromaGrid';
import LiquidChrome from '@/components/backgrounds/LiquidChrome';
import {
  type AchievementDisciplineKey,
  achievementDisciplines,
  chessPeakRatings,
} from '@/content/achievementsKinetic';
import {
  type ChapterProgressController,
  createChapterProgressController,
} from '@/experience/chapterProgress';
import { useExperienceEnvironment } from '@/experience/ExperienceEnvironment';
import { useGlobalEther } from '@/experience/GlobalEtherProvider';
import { useProjectSceneRegistration } from '@/experience/ProjectExperienceProvider';
import { useChapterActivity } from '@/experience/useChapterActivity';

const CHESS_CELLS = Array.from({ length: 64 }, (_, index) => `square-${index + 1}`);
const CHESS_PIECES = [
  { piece: '♜', square: 'rook' },
  { piece: '♞', square: 'knight' },
  { piece: '♛', square: 'queen' },
  { piece: '♚', square: 'king' },
  { piece: '♝', square: 'bishop' },
  { piece: '♟', square: 'pawn' },
] as const;
const ARCHIVE_TILES: ChromaItem[] = [
  {
    image: '/images/achievements/table-tennis/photo-1-640.webp',
    alt: 'Jairus holding a table tennis trophy, certificate, and medals',
    accent: '#c6a66e',
  },
  {
    image: '/images/achievements/karate/photo-1-640.webp',
    alt: 'Jairus competing in a karate match',
    accent: '#987454',
  },
  {
    image: '/images/achievements/table-tennis/kissing-cup.png',
    alt: 'Jairus kissing a table tennis trophy',
    accent: '#9c8a73',
  },
  {
    image: '/images/achievements/music/photo-1-640.webp',
    alt: 'Jairus speaking at a microphone in a suit',
    accent: '#c6a66e',
  },
  {
    image: '/images/achievements/public-speaking/photo-1-640.webp',
    alt: 'Jairus addressing an audience on stage',
    accent: '#98856c',
  },
  {
    image: '/images/achievements/public-speaking/photo-2-640.webp',
    alt: 'Jairus speaking from a lectern at an event',
    accent: '#bdaf94',
  },
];

interface KineticPanelProps {
  panel: AchievementPanelKey;
  reducedMotion: boolean;
  children: ReactNode;
}

function usePanelProgress(
  sectionRef: RefObject<HTMLElement | null>,
  panel: AchievementPanelKey,
  reducedMotion: boolean,
) {
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || reducedMotion) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const viewport = window.innerHeight;
      const start = window.innerWidth <= 860 && panel !== 'intro' ? viewport * 0.4 : 0;
      const distance = Math.max(1, rect.height - viewport + start);
      const progress = Math.min(1, Math.max(0, (start - rect.top) / distance));
      for (const [property, value] of Object.entries(getAchievementMotion(panel, progress))) {
        section.style.setProperty(property, String(value));
      }
      section.dataset.achievementBeat = getAchievementBeat(panel, progress);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(section);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    update();
    return () => {
      if (frame) cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [panel, reducedMotion, sectionRef]);
}

function KineticPanel({ panel, reducedMotion, children }: KineticPanelProps) {
  const sectionRef = useRef<HTMLElement>(null);
  usePanelProgress(sectionRef, panel, reducedMotion);

  return (
    <article
      ref={sectionRef}
      className={`${styles.panel} ${styles[panel]}`}
      data-achievement-panel={panel}
      data-achievement-beat={reducedMotion ? 'static' : getAchievementBeat(panel, 0)}
    >
      <div className={styles.stage}>{children}</div>
    </article>
  );
}

function DisciplineMeta({ discipline }: { discipline: AchievementDisciplineKey }) {
  const item = achievementDisciplines.find((entry) => entry.key === discipline);
  if (!item) return null;
  return (
    <div className={styles.meta}>
      <span>{item.index}</span>
      <i aria-hidden="true" />
      <span>{item.principle}</span>
    </div>
  );
}

export function AchievementsChapter() {
  const chapterRef = useRef<HTMLElement>(null);
  const [controller, setController] = useState<ChapterProgressController | null>(null);
  const { ready, reducedMotion, portrait, quality, dprCap } = useExperienceEnvironment();
  const activity = useChapterActivity(chapterRef);
  const { setMode: setGlobalEtherMode } = useGlobalEther();
  const rendererActive =
    ready && !reducedMotion && quality !== 'fallback' && activity !== 'inactive';
  const sceneRegistration = useMemo(
    () =>
      controller
        ? {
            controller,
            sectionRef: chapterRef,
            activity,
            enabled: rendererActive,
            portrait: ready && portrait,
            dprCap,
          }
        : null,
    [activity, controller, dprCap, portrait, ready, rendererActive],
  );
  useProjectSceneRegistration('achievements', sceneRegistration);

  useEffect(() => {
    const next = createChapterProgressController(chapterRef);
    setController(next);
    return () => next.dispose();
  }, []);

  useEffect(() => {
    const chapter = chapterRef.current;
    if (!chapter) return;
    const isBeforeChapter = chapter.getBoundingClientRect().top > window.innerHeight;
    if (activity === 'inactive' && isBeforeChapter) setGlobalEtherMode('enabled');
    else setGlobalEtherMode('disabled');
  }, [activity, setGlobalEtherMode]);

  useEffect(() => () => setGlobalEtherMode('enabled'), [setGlobalEtherMode]);

  return (
    <section
      ref={chapterRef}
      id="achievements-section"
      aria-labelledby="achievements-title"
      className={`${styles.chapter} ${reducedMotion ? styles.static : ''} ${rendererActive ? styles.webgl : ''}`}
      data-achievements-mode={reducedMotion ? 'static' : 'performance-archive'}
    >
      <h2 id="achievements-title" className={styles.srOnly}>
        Achievements
      </h2>

      <KineticPanel panel="intro" reducedMotion={reducedMotion}>
        <div className={styles.meta}>
          <span>00 / 06</span>
          <i aria-hidden="true" />
          <span>THE PERFORMANCE ARCHIVE</span>
        </div>
        <div className={styles.introStatement}>
          <p>BEYOND THE CODE.</p>
          <h3>ACHIEVEMENTS</h3>
        </div>
        <div className={styles.disciplineIndex}>
          {achievementDisciplines.map((discipline) => (
            <span key={discipline.key}>{discipline.title}</span>
          ))}
        </div>
      </KineticPanel>

      <div className={styles.layout}>
        <aside className={styles.showcase} aria-label="Achievement image archive">
          {activity !== 'inactive' && !reducedMotion && (
            <LiquidChrome
              className={styles.showcaseChrome}
              color="#ac8656"
              speed={0.07}
              amplitude={0.26}
              frequencyX={2.1}
              frequencyY={2.4}
              detail={3}
              thickness={1.35}
              depth={0.82}
              roughness={0.65}
              exposure={0.78}
              interactive
              rippleStrength={0.72}
              rippleSize={0.9}
              intro={false}
              tilt={0.48}
              maxDevicePixelRatio={1}
            />
          )}
          <div className={styles.showcaseInner}>
            <ChromaGrid
              items={ARCHIVE_TILES}
              columns={3}
              minCardWidth={100}
              gap={30}
              aspectRatio="1 / 1"
              radius={220}
              softness={0.7}
              grayscale={0.9}
              dim={0.1}
              glow={0.3}
              borderGlow={0.7}
              showInfo={false}
              cardRadius={10}
              className="achievement-chroma-grid"
            />
          </div>
        </aside>
        <div className={styles.narrative}>
          <KineticPanel panel="table-tennis" reducedMotion={reducedMotion}>
            <DisciplineMeta discipline="table-tennis" />
            <div className={styles.tableCourt} aria-hidden="true">
              <div className={styles.tableTop}>
                <i className={styles.tableCenterLine} />
                <i className={styles.tableEdgeLine} />
                <span className={styles.tableNet} />
              </div>
              <i className={`${styles.tableLeg} ${styles.tableLegNear}`} />
              <i className={`${styles.tableLeg} ${styles.tableLegFar}`} />
              <span className={styles.tableUnderlight} />
            </div>
            <div className={styles.tableTrajectory} aria-hidden="true">
              <i />
              <b />
              <em />
              <span />
            </div>
            <div className={styles.tableTelemetry} aria-hidden="true">
              <span>VELOCITY</span>
              <span>SPIN</span>
              <span>TRAJECTORY</span>
            </div>
            <div className={styles.tableTitle} aria-hidden="true">
              <span>TABLE</span>
              <span>TENNIS</span>
            </div>
            <div className={styles.tableStatement}>
              <strong>2×</strong>
              <h3>
                STATE
                <br />
                CHAMPION
              </h3>
            </div>
          </KineticPanel>

          <KineticPanel panel="karate" reducedMotion={reducedMotion}>
            <DisciplineMeta discipline="karate" />
            <div className={styles.karateDivisions} aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            <div className={styles.karateBelt} aria-hidden="true">
              <div className={styles.beltSweep}>
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
              <b className={styles.beltKnot} />
              <span className={styles.beltTailOne} />
              <span className={styles.beltTailTwo} />
            </div>
            <div className={styles.karateStatement}>
              <p>KARATE</p>
              <h3>
                <span>BLACK</span>
                <span>BELT</span>
              </h3>
            </div>
            <div className={styles.karatePrinciples}>
              <span>CONTROL</span>
              <span>POWER</span>
              <span>DISCIPLINE</span>
            </div>
          </KineticPanel>

          <KineticPanel panel="chess" reducedMotion={reducedMotion}>
            <DisciplineMeta discipline="chess" />
            <div className={styles.chessGrid} aria-hidden="true">
              {CHESS_CELLS.map((cell) => (
                <i key={cell} />
              ))}
              <div className={styles.chessPieces}>
                {CHESS_PIECES.map(({ piece, square }) => (
                  <span key={square} className={styles[square]}>
                    {piece}
                  </span>
                ))}
              </div>
            </div>
            <div className={styles.chessPath} aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            <div className={styles.chessStatement}>
              <div className={styles.chessTitle}>
                <p>CALCULATION / PRECISION / DECISION</p>
                <h3>CHESS</h3>
              </div>
              <dl className={styles.ratings}>
                {chessPeakRatings.map((rating) => (
                  <div key={rating.label}>
                    <dt>{rating.label}</dt>
                    <dd>{rating.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </KineticPanel>

          <KineticPanel panel="public-speaking" reducedMotion={reducedMotion}>
            <DisciplineMeta discipline="public-speaking" />
            <div className={styles.audienceField} aria-hidden="true" />
            <div className={styles.speakingScene} aria-hidden="true">
              <div className={styles.stagePlatform}>
                <i />
                <i />
              </div>
              <div className={styles.microphone}>
                <b />
                <i />
                <span />
              </div>
              <div className={styles.stageSpeaker}>
                <i />
                <i />
                <span />
              </div>
            </div>
            <div className={styles.speakingStatement}>
              <p>PUBLIC SPEAKING</p>
              <div className={styles.speeches}>
                <strong>15+</strong>
                <h3>
                  SUCCESSFUL
                  <br />
                  SPEECHES
                </h3>
              </div>
              <div className={styles.audienceReach}>
                <strong>15,000</strong>
                <span>PEOPLE ADDRESSED</span>
              </div>
            </div>
            <div className={styles.speakingLight} aria-hidden="true" />
          </KineticPanel>

          <KineticPanel panel="finale" reducedMotion={reducedMotion}>
            <div className={styles.meta}>
              <span>06 / 06</span>
              <i aria-hidden="true" />
              <span>ONE PRACTICE</span>
            </div>
            <div className={styles.finalDisciplines} aria-hidden="true">
              {achievementDisciplines.map((discipline) => (
                <span key={discipline.key}>{discipline.title}</span>
              ))}
            </div>
            <div className={styles.finalConcepts} aria-hidden="true">
              <span>SPEED</span>
              <span>DISCIPLINE</span>
              <span>PRECISION</span>
              <span>PRESENCE</span>
            </div>
            <div className={styles.finalStatement}>
              <p>BUILT BEYOND</p>
              <p>THE SCREEN.</p>
            </div>
          </KineticPanel>
        </div>
      </div>
    </section>
  );
}

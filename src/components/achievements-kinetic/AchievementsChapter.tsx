'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { ReactNode, RefObject } from 'react';
import { useEffect, useLayoutEffect, useRef } from 'react';
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
import { useExperienceEnvironment } from '@/experience/ExperienceEnvironment';
import { useGlobalEther } from '@/experience/GlobalEtherProvider';
import { useChapterActivity } from '@/experience/useChapterActivity';

gsap.registerPlugin(ScrollTrigger);

const CHESS_CELLS = ['a1', 'b1', 'c1', 'd1', 'a2', 'b2', 'c2', 'd2', 'a3', 'b3', 'c3', 'd3'];
const ARCHIVE_TILES: ChromaItem[] = [
  {
    image: '/images/achievements/table-tennis/photo-1-1280.webp',
    alt: 'Jairus holding a table tennis trophy, certificate, and medals',
    accent: '#c6a66e',
  },
  { accent: '#987454' },
  { accent: '#9c8a73' },
  { accent: '#c6a66e' },
  { accent: '#98856c' },
  { accent: '#bdaf94' },
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

    const context = gsap.context(() => {
      const update = (progress: number) => {
        gsap.set(section, getAchievementMotion(panel, progress));
        section.dataset.achievementBeat = getAchievementBeat(panel, progress);
      };
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        invalidateOnRefresh: true,
        onRefresh: (self) => update(self.progress),
        onUpdate: (self) => update(self.progress),
      });
      update(trigger.progress);
    }, section);

    return () => context.revert();
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
  const { reducedMotion } = useExperienceEnvironment();
  const activity = useChapterActivity(chapterRef);
  const { setMode: setGlobalEtherMode } = useGlobalEther();

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
      className={`${styles.chapter} ${reducedMotion ? styles.static : ''}`}
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
              speed={0.08}
              amplitude={0.2}
              frequencyX={2.1}
              frequencyY={2.4}
              detail={3}
              thickness={1.2}
              depth={0.7}
              roughness={0.65}
              exposure={0.55}
              interactive={false}
              intro={false}
              tilt={0.2}
              maxDevicePixelRatio={1}
            />
          )}
          <div className={styles.showcaseInner}>
            <ChromaGrid
              items={ARCHIVE_TILES}
              columns={2}
              minCardWidth={120}
              gap={12}
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
              <i />
              <i />
              <i />
            </div>
            <div className={styles.tableTrajectory} aria-hidden="true">
              <i />
              <b />
              <em />
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

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
      const bounds = section.getBoundingClientRect();
      const distance = Math.max(1, bounds.height + window.innerHeight);
      const progress = Math.min(1, Math.max(0, (window.innerHeight - bounds.top) / distance));
      gsap.set(section, getAchievementMotion(panel, progress));
      section.dataset.achievementBeat = getAchievementBeat(panel, progress);
      section.dataset.achievementProgress = progress.toFixed(4);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const context = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        // Drive the handoff across the complete viewport crossing. The outgoing
        // stage stays visible until the incoming stage already occupies the gap.
        start: 'top bottom',
        end: 'bottom top',
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          section.dataset.achievementStart = self.start.toFixed(2);
          section.dataset.achievementEnd = self.end.toFixed(2);
          schedule();
        },
        onUpdate: schedule,
      });
    }, section);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    update();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      context.revert();
    };
  }, [panel, reducedMotion, sectionRef]);
}

function KineticPanel({ panel, reducedMotion, children }: KineticPanelProps) {
  const sectionRef = useRef<HTMLElement>(null);
  usePanelProgress(sectionRef, panel, reducedMotion);
  const discipline = panel === 'intro' || panel === 'finale' ? undefined : panel;
  const staticBeat = discipline ? 'static' : `${panel}-static`;

  return (
    <article
      ref={sectionRef}
      className={`${styles.panel} ${styles[panel]}`}
      data-achievement-panel={panel}
      data-achievement-discipline={discipline}
      data-achievement-beat={reducedMotion ? staticBeat : getAchievementBeat(panel, 0)}
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

  useLayoutEffect(() => {
    if (reducedMotion) return;
    const chapter = chapterRef.current;
    if (!chapter) return;
    let frame = 0;
    let disposed = false;
    const refresh = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!disposed) ScrollTrigger.refresh();
      });
    };
    const observer = new ResizeObserver(refresh);
    observer.observe(document.documentElement);
    observer.observe(document.body);
    const intersection = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) refresh();
      },
      { rootMargin: '150% 0px' },
    );
    intersection.observe(chapter);
    window.addEventListener('load', refresh);
    document.fonts?.ready.then(refresh);
    refresh();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      window.removeEventListener('load', refresh);
    };
  }, [reducedMotion]);

  return (
    <section
      ref={chapterRef}
      id="achievements-section"
      aria-labelledby="achievements-title"
      className={`${styles.chapter} ${reducedMotion ? styles.static : ''}`}
      data-achievements-mode={reducedMotion ? 'static' : 'kinetic'}
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
    </section>
  );
}

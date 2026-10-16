'use client';

import type { ReactNode, RefObject } from 'react';
import { useEffect, useRef } from 'react';
import styles from '@/components/achievements-kinetic/AchievementsChapter.module.css';
import {
  getAchievementBeat,
  getDisciplineMotion,
} from '@/components/achievements-kinetic/achievementsChoreography';
import {
  type AchievementDisciplineKey,
  achievementDisciplines,
  chessPeakRatings,
} from '@/content/achievementsKinetic';
import { createChapterProgressController } from '@/experience/chapterProgress';
import { useExperienceEnvironment } from '@/experience/ExperienceEnvironment';
import { useGlobalEther } from '@/experience/GlobalEtherProvider';
import { useChapterActivity } from '@/experience/useChapterActivity';

interface KineticPanelProps {
  discipline: AchievementDisciplineKey;
  reducedMotion: boolean;
  children: ReactNode;
}

function useDisciplineProgress(
  sectionRef: RefObject<HTMLElement | null>,
  discipline: AchievementDisciplineKey,
  reducedMotion: boolean,
) {
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reducedMotion) return;

    const controller = createChapterProgressController(sectionRef);
    const update = () => {
      const progress = controller.progress.current;
      section.style.setProperty('--achievement-progress', progress.toFixed(4));
      section.dataset.achievementBeat = getAchievementBeat(discipline, progress);
      const motion = getDisciplineMotion(discipline, progress);
      for (const [property, value] of Object.entries(motion)) {
        section.style.setProperty(property, String(value));
      }
    };

    const unsubscribe = controller.subscribe(update);
    update();
    return () => {
      unsubscribe();
      controller.dispose();
    };
  }, [discipline, reducedMotion, sectionRef]);
}

function KineticPanel({ discipline, reducedMotion, children }: KineticPanelProps) {
  const sectionRef = useRef<HTMLElement>(null);
  useDisciplineProgress(sectionRef, discipline, reducedMotion);

  return (
    <article
      ref={sectionRef}
      className={`${styles.panel} ${styles[discipline]}`}
      data-achievement-discipline={discipline}
      data-achievement-beat={reducedMotion ? 'static' : getAchievementBeat(discipline, 0)}
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
      data-achievements-mode={reducedMotion ? 'static' : 'kinetic'}
    >
      <h2 id="achievements-title" className={styles.srOnly}>
        Achievements
      </h2>
      <div className={styles.inheritedRule} aria-hidden="true" />

      <KineticPanel discipline="table-tennis" reducedMotion={reducedMotion}>
        <DisciplineMeta discipline="table-tennis" />
        <div className={styles.tableTrajectory} aria-hidden="true">
          <i />
          <b />
        </div>
        <div className={styles.tableStatement}>
          <p className={styles.eyebrow}>TABLE TENNIS</p>
          <div className={styles.tableMass}>
            <strong>2×</strong>
            <h3>
              STATE
              <br />
              CHAMPION
            </h3>
          </div>
        </div>
      </KineticPanel>

      <KineticPanel discipline="karate" reducedMotion={reducedMotion}>
        <DisciplineMeta discipline="karate" />
        <div className={styles.karateRule} aria-hidden="true" />
        <div className={styles.karateStatement}>
          <p className={styles.eyebrow}>KARATE</p>
          <h3>
            <span>BLACK</span>
            <span>BELT</span>
          </h3>
          <p className={styles.karateClaim} data-publication-status="pending-confirmation">
            <strong>3×</strong>
            <span>NATIONAL CHAMPION</span>
          </p>
          <p className={styles.verificationNote}>
            National-title wording pending final confirmation.
          </p>
        </div>
      </KineticPanel>

      <KineticPanel discipline="chess" reducedMotion={reducedMotion}>
        <DisciplineMeta discipline="chess" />
        <div className={styles.chessGrid} aria-hidden="true" />
        <div className={styles.chessStatement}>
          <div>
            <p className={styles.eyebrow}>CHESS</p>
            <h3>
              PEAK
              <br />
              RATINGS
            </h3>
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

      <KineticPanel discipline="public-speaking" reducedMotion={reducedMotion}>
        <DisciplineMeta discipline="public-speaking" />
        <div className={styles.speakingBaseline} aria-hidden="true" />
        <div className={styles.speakingStatement}>
          <p className={styles.eyebrow}>PUBLIC SPEAKING / LEADERSHIP</p>
          <div className={styles.speeches}>
            <strong>15+</strong>
            <h3>
              SUCCESSFUL
              <br />
              SPEECHES
            </h3>
          </div>
          <div className={styles.audience}>
            <strong>15,000+</strong>
            <p>AUDIENCE</p>
          </div>
        </div>
        <div className={styles.silence} aria-hidden="true">
          <i />
        </div>
      </KineticPanel>
    </section>
  );
}

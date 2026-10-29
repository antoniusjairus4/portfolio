'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { ReactNode, RefObject } from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ChessEditorial,
  KarateEditorial,
  PublicSpeakingEditorial,
  TableTennisEditorial,
} from '@/components/achievements-kinetic/AchievementEditorial';
import styles from '@/components/achievements-kinetic/AchievementsChapter.module.css';
import {
  type AchievementPanelKey,
  getAchievementBeat,
  getAchievementMotion,
} from '@/components/achievements-kinetic/achievementsChoreography';
import Masonry, { type MasonryItem } from '@/components/achievements-kinetic/Masonry';
import LiquidChrome from '@/components/backgrounds/LiquidChrome';
import EchoText from '@/components/ui/EchoText';
import {
  type AchievementDisciplineKey,
  achievementDisciplines,
} from '@/content/achievementsKinetic';
import { useExperienceEnvironment } from '@/experience/ExperienceEnvironment';
import { useGlobalEther } from '@/experience/GlobalEtherProvider';
import { useChapterActivity } from '@/experience/useChapterActivity';

gsap.registerPlugin(ScrollTrigger);

const ARCHIVE_ITEMS: MasonryItem[] = [
  {
    id: 'school-captain',
    img: '/images/achievements/leadership/school-captain.webp',
    width: 1080,
    height: 1356,
    title: 'School Captain',
    description: 'Flag Bearer & Student Leadership',
    alt: 'Antonius Jairus in blazer with School Captain sash holding the school flag',
  },
  {
    id: 'tt-action',
    img: '/images/achievements/table-tennis/match-action.webp',
    width: 1079,
    height: 679,
    title: 'Match Point',
    description: 'State Championship in Action',
    alt: 'Jairus serving at a table tennis tournament',
  },
  {
    id: 'montfort-cups',
    img: '/images/achievements/table-tennis/montfort-trophies.webp',
    width: 1079,
    height: 1390,
    title: 'Montfort Tournaments',
    description: 'Winner & Doubles Runner',
    alt: 'Montfort School Table Tennis Winner trophies and certificates',
  },
  {
    id: 'tt-trophy',
    img: '/images/achievements/table-tennis/photo-1-640.webp',
    width: 349,
    height: 396,
    title: 'Table Tennis Championship',
    description: 'State Championship & Trophies',
    alt: 'Jairus holding a table tennis trophy, certificate, and medals',
  },
  {
    id: 'karate-bout',
    img: '/images/achievements/karate/photo-1-640.webp',
    width: 640,
    height: 547,
    title: 'Karate Black Belt',
    description: 'Impact / Precision / Stillness',
    alt: 'Jairus competing in a karate match',
  },
  {
    id: 'kissing-cup',
    img: '/images/achievements/table-tennis/kissing-cup.png',
    width: 436,
    height: 425,
    title: 'State Champion',
    description: '2× State Champion Victory',
    alt: 'Jairus kissing a table tennis trophy',
  },
  {
    id: 'medals-collection',
    img: '/images/achievements/karate/medals-collection.webp',
    width: 963,
    height: 1600,
    title: 'Championship Medals',
    description: 'Karate & State Tournament Medals',
    alt: 'Collection of gold, silver, and bronze tournament medals',
  },
  {
    id: 'championship-cups',
    img: '/images/achievements/table-tennis/championship-cups.webp',
    width: 926,
    height: 1600,
    title: 'Trophy Honors',
    description: 'Tournament Cups & Certificates',
    alt: 'Championship trophies with crystal toppers and medals',
  },
  {
    id: 'music-stage',
    img: '/images/achievements/music/photo-1-640.webp',
    width: 380,
    height: 518,
    title: 'Keyboards & Music',
    description: 'Discipline & Composition',
    alt: 'Jairus speaking at a microphone in a suit',
  },
  {
    id: 'speaking-stage',
    img: '/images/achievements/public-speaking/photo-1-640.webp',
    width: 640,
    height: 1033,
    title: 'Public Speaking',
    description: '15+ Speeches across venues',
    alt: 'Jairus addressing an audience on stage',
  },
  {
    id: 'speaking-podium',
    img: '/images/achievements/public-speaking/photo-2-640.webp',
    width: 640,
    height: 954,
    title: 'Guardian of the Grid',
    description: '15,000 People Addressed',
    alt: 'Jairus speaking from a lectern at an event',
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

    const media = gsap.matchMedia();
    media.add('(max-width: 768px)', () => {
      const state = { progress: 0 };
      const render = () => {
        const progress = state.progress;
        for (const [property, value] of Object.entries(getAchievementMotion(panel, progress))) {
          if (property !== '--achievement-exit') section.style.setProperty(property, String(value));
        }
        section.style.setProperty('--achievement-exit', '0');
        section.dataset.achievementBeat = getAchievementBeat(panel, progress);
      };
      const animation = gsap.to(state, {
        progress: 0.78,
        ease: 'none',
        onUpdate: render,
        scrollTrigger: {
          trigger: section,
          start: 'top 95%',
          end: 'top 12%',
          scrub: 0.25,
          invalidateOnRefresh: true,
        },
      });
      render();
      return () => {
        animation.scrollTrigger?.kill();
        animation.kill();
        for (const property of Object.keys(getAchievementMotion(panel, 0))) {
          section.style.removeProperty(property);
        }
        section.style.removeProperty('--achievement-exit');
      };
    });

    media.add('(min-width: 769px)', () => {
      let frame = 0;
      const update = () => {
        frame = 0;
        const rect = section.getBoundingClientRect();
        const viewport = window.innerHeight;
        const start = window.innerWidth <= 860 && panel !== 'intro' ? viewport * 0.4 : 0;
        const entryDistance = Math.max(1, viewport - start);
        const entryProgress = Math.min(1, Math.max(0, (viewport - rect.top) / entryDistance));
        const handoffProgress = entryProgress * entryProgress * (3 - 2 * entryProgress);
        const entryOffset =
          rect.top > start && rect.top < viewport
            ? start - rect.top
            : rect.top >= viewport
              ? start - viewport
              : 0;
        const exitHold = Math.min(viewport, Math.max(0, viewport - rect.bottom));
        const distance = Math.max(1, rect.height - viewport + start);
        const progress = Math.min(1, Math.max(0, (start - rect.top) / distance));
        section.style.setProperty('--panel-entry', String(entryProgress));
        section.style.setProperty('--panel-entry-y', `${entryOffset}px`);
        section.style.setProperty('--panel-exit-hold-y', `${exitHold}px`);
        for (const [property, value] of Object.entries(getAchievementMotion(panel, progress))) {
          section.style.setProperty(property, String(value));
        }
        const previousPanel = section.previousElementSibling as HTMLElement | null;
        if (previousPanel?.hasAttribute('data-achievement-panel')) {
          // The incoming panel owns the outgoing panel's retirement. This keeps
          // one complete composition visible throughout the handoff without
          // leaving both scenes fully drawn on top of one another.
          previousPanel.style.setProperty('--achievement-exit', String(handoffProgress));
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
    });

    return () => media.revert();
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

function useDesktopAchievementVisuals() {
  // Start without visual assets so mobile never mounts them during hydration.
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 861px)');
    const update = () => setEnabled(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return enabled;
}

export function AchievementsChapter() {
  const chapterRef = useRef<HTMLElement>(null);
  const [galleryFocus, setGalleryFocus] = useState<string | null>(null);
  const { reducedMotion } = useExperienceEnvironment();
  const desktopVisuals = useDesktopAchievementVisuals();
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
        {desktopVisuals && <div className={styles.introBackdrop} aria-hidden="true" />}
        <div className={styles.meta}>
          <span>00 / 06</span>
          <i aria-hidden="true" />
          <span>THE PERFORMANCE ARCHIVE</span>
        </div>
        <div className={styles.introStatement}>
          <h3>
            <EchoText
              text="ACHIEVEMENTS"
              echoes={18}
              lag={0.26}
              offset={62}
              direction="diagonal"
              fade={0.78}
              blur={4}
              echoColors={['#e5dac7', '#8b1e2d']}
              echoScale={1.045}
              mode="both"
              trail="scroll"
              clickBurst
              duration={1100}
              ease="snappy"
              fontSize="inherit"
              fontWeight="inherit"
              color="currentColor"
              className={styles.achievementEcho}
            />
          </h3>
          <p>BEYOND THE CODE.</p>
          <div className={styles.disciplineIndex}>
            <span>Table Tennis</span>
            <span>Karate</span>
            <span>Chess</span>
            <span>Speeches</span>
          </div>
        </div>
      </KineticPanel>

      <div className={styles.layout}>
        {desktopVisuals && (
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
                maxDevicePixelRatio={1.75}
              />
            )}
            <div className={styles.showcaseInner}>
              <Masonry
                items={ARCHIVE_ITEMS}
                columns="auto"
                columnWidth={270}
                gap={16}
                radius={14}
                animateFrom="bottom"
                hoverEffect="zoom"
                captions="hover"
                lightbox
                draggable
                onItemHover={(item) => setGalleryFocus(item?.title ?? null)}
                className="achievement-masonry"
              />
            </div>
          </aside>
        )}
        <div className={styles.narrative}>
          <KineticPanel panel="table-tennis" reducedMotion={reducedMotion}>
            <DisciplineMeta discipline="table-tennis" />
            <TableTennisEditorial
              reducedMotion={reducedMotion}
              galleryFocus={galleryFocus}
              visualsEnabled={desktopVisuals}
            />
          </KineticPanel>

          <KineticPanel panel="karate" reducedMotion={reducedMotion}>
            <DisciplineMeta discipline="karate" />
            <KarateEditorial reducedMotion={reducedMotion} galleryFocus={galleryFocus} />
          </KineticPanel>

          <KineticPanel panel="chess" reducedMotion={reducedMotion}>
            <DisciplineMeta discipline="chess" />
            <ChessEditorial
              reducedMotion={reducedMotion}
              galleryFocus={galleryFocus}
              visualsEnabled={desktopVisuals}
            />
          </KineticPanel>

          <KineticPanel panel="public-speaking" reducedMotion={reducedMotion}>
            <DisciplineMeta discipline="public-speaking" />
            <PublicSpeakingEditorial reducedMotion={reducedMotion} galleryFocus={galleryFocus} />
          </KineticPanel>
        </div>
      </div>
    </section>
  );
}

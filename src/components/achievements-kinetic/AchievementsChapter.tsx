'use client';

import Image from 'next/image';
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import styles from '@/components/achievements-kinetic/AchievementsChapter.module.css';
import { AchievementVisual } from '@/components/achievements-kinetic/AchievementVisual';
import { type AchievementExhibit, achievementExhibits } from '@/content/achievementsKinetic';
import { useExperienceEnvironment } from '@/experience/ExperienceEnvironment';
import { useGlobalEther } from '@/experience/GlobalEtherProvider';
import { useChapterActivity } from '@/experience/useChapterActivity';

function AchievementStory({
  item,
  active = false,
  mobile = false,
}: {
  item: AchievementExhibit;
  active?: boolean;
  mobile?: boolean;
}) {
  return (
    <article
      className={mobile ? styles.mobileStory : styles.story}
      data-active={active ? 'true' : 'false'}
      aria-hidden={mobile ? undefined : !active}
    >
      <div className={styles.storyBody}>
        <p className={styles.storyIndex}>
          <span>{item.index}</span>
          <span>{item.title}</span>
        </p>
        <h3 className={`${styles.headline} ${mobile ? styles.mobileHeadline : ''}`}>
          {item.headline.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h3>
        <p className={styles.principle}>{item.principle}</p>
        <dl className={`${styles.details} ${mobile ? styles.mobileDetails : ''}`}>
          {item.details.map((detail) => (
            <div key={`${detail.value}-${detail.label}`}>
              <dt>{detail.label}</dt>
              <dd>{detail.value}</dd>
            </div>
          ))}
        </dl>
        {item.key === 'public-speaking' && (
          <p className={styles.closingLine}>BUILT BEYOND THE SCREEN.</p>
        )}
      </div>
      {mobile && (
        <figure className={styles.mobileMedia}>
          <Image
            src={item.image.src}
            alt={item.image.alt}
            fill
            unoptimized
            loading="lazy"
            sizes="100vw"
            style={{ objectPosition: item.image.position }}
          />
        </figure>
      )}
    </article>
  );
}

export function AchievementsChapter() {
  const chapterRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
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

  useEffect(() => {
    if (reducedMotion) return;
    const steps = stepRefs.current.filter((step): step is HTMLDivElement => step !== null);
    let observer: IntersectionObserver | null = null;
    const observe = () => {
      observer?.disconnect();
      const inset = Math.round(window.innerHeight * 0.45);
      observer = new IntersectionObserver(
        (entries) => {
          const viewportMiddle = window.innerHeight / 2;
          const centered = entries
            .filter((entry) => entry.isIntersecting)
            .sort(
              (first, second) =>
                Math.abs(
                  first.boundingClientRect.top +
                    first.boundingClientRect.height / 2 -
                    viewportMiddle,
                ) -
                Math.abs(
                  second.boundingClientRect.top +
                    second.boundingClientRect.height / 2 -
                    viewportMiddle,
                ),
            )[0];
          if (!centered) return;
          const index = Number((centered.target as HTMLElement).dataset.achievementStep);
          if (Number.isInteger(index)) setActiveIndex(index);
        },
        { rootMargin: `-${inset}px 0px -${inset}px 0px`, threshold: 0 },
      );
      steps.forEach((step) => {
        observer?.observe(step);
      });
    };
    observe();
    window.addEventListener('resize', observe);
    return () => {
      window.removeEventListener('resize', observe);
      observer?.disconnect();
    };
  }, [reducedMotion]);

  return (
    <section
      ref={chapterRef}
      id="achievements-section"
      aria-labelledby="achievements-title"
      className={`${styles.chapter} ${reducedMotion ? styles.static : ''}`}
      style={
        {
          '--achievement-scroll-height': `${(achievementExhibits.length + 1) * 100}svh`,
        } as CSSProperties
      }
    >
      <h2 id="achievements-title" className={styles.srOnly}>
        Achievements
      </h2>

      <div className={styles.experience}>
        <div className={styles.sticky}>
          <div className={styles.topBar}>
            <span>05 / ACHIEVEMENTS</span>
            <span>THE PERFORMANCE ARCHIVE</span>
          </div>

          <div className={styles.split}>
            <div className={styles.content}>
              <p className={styles.chapterKicker}>BEYOND THE CODE.</p>
              <div className={styles.storyStack}>
                {achievementExhibits.map((item, index) => (
                  <AchievementStory key={item.key} item={item} active={index === activeIndex} />
                ))}
              </div>
              <div className={styles.progress}>
                <span>
                  {String(activeIndex + 1).padStart(2, '0')} /{' '}
                  {String(achievementExhibits.length).padStart(2, '0')}
                </span>
                <span className={styles.progressTrack} aria-hidden="true">
                  <span
                    style={{ width: `${((activeIndex + 1) / achievementExhibits.length) * 100}%` }}
                  />
                </span>
                <span>
                  {activeIndex === achievementExhibits.length - 1
                    ? 'CONTINUE TO CONTACT'
                    : 'SCROLL TO EXPLORE'}
                </span>
              </div>
            </div>
            <AchievementVisual items={achievementExhibits} activeIndex={activeIndex} />
          </div>
        </div>

        <div className={styles.steps} aria-hidden="true">
          {achievementExhibits.map((item, index) => (
            <div
              key={item.key}
              ref={(node) => {
                stepRefs.current[index] = node;
              }}
              data-achievement-step={index}
              className={styles.step}
            />
          ))}
        </div>
      </div>

      <div className={styles.mobileList}>
        <header className={styles.mobileIntro}>
          <span>05 / ACHIEVEMENTS</span>
          <p>BEYOND THE CODE.</p>
          <strong>ACHIEVEMENTS</strong>
        </header>
        {achievementExhibits.map((item) => (
          <AchievementStory key={item.key} item={item} mobile />
        ))}
      </div>
    </section>
  );
}

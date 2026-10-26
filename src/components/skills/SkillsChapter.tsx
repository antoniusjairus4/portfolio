'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { BounceSkillsCards } from '@/components/skills/BounceSkillsCards';
import ParticleText from '@/components/skills/ParticleText';
import { SkillsFallback } from '@/components/skills/SkillsFallback';
import { skillCategories } from '@/content/skills';
import {
  type ChapterProgressController,
  createChapterProgressController,
} from '@/experience/chapterProgress';
import { useExperienceEnvironment } from '@/experience/ExperienceEnvironment';
import { useGlobalEther } from '@/experience/GlobalEtherProvider';
import { useProjectSceneRegistration } from '@/experience/ProjectExperienceProvider';
import { useChapterActivity } from '@/experience/useChapterActivity';
import './skills.css';

function smooth(value: number) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}

export function SkillsChapter() {
  const sectionRef = useRef<HTMLElement>(null);
  const introWordRef = useRef<HTMLDivElement>(null);
  const ownsEtherRef = useRef(false);
  const [controller, setController] = useState<ChapterProgressController | null>(null);
  const [rendererReleased, setRendererReleased] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);
  const [titleInView, setTitleInView] = useState(false);
  const { ready, reducedMotion, portrait, quality, dprCap, finePointer } =
    useExperienceEnvironment();
  const { setMode: setGlobalEtherMode } = useGlobalEther();
  const activity = useChapterActivity(sectionRef);
  const staticExperience = reducedMotion || quality === 'fallback';
  const rendererActive = ready && !staticExperience && activity !== 'inactive' && !rendererReleased;
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
            finePointer,
          }
        : null,
    [activity, controller, dprCap, finePointer, portrait, ready, rendererActive],
  );
  useProjectSceneRegistration('skills', sceneRegistration);

  useEffect(() => {
    const next = createChapterProgressController(sectionRef);
    setController(next);
    const update = () => {
      const progress = next.progress.current;
      const section = sectionRef.current;
      section?.style.setProperty('--skills-progress', progress.toFixed(4));
      section?.style.setProperty(
        '--skills-entry-opacity',
        Math.max(0, 0.28 - progress * 8).toFixed(4),
      );
      if (section) {
        const opening = smooth((progress + 0.04) / 0.065);
        const departure = smooth((progress - 0.15) / 0.1);

        // Smooth card stage entrance and graceful upward scroll departure
        const cardIn = smooth((progress - 0.27) / 0.06);
        const cardOut = 1 - smooth((progress - 0.78) / 0.16);
        const cardStageOpacity = cardIn * cardOut;
        const cardStageY = (1 - cardOut) * -70;

        section.style.setProperty(
          '--skills-card-stage-opacity',
          cardStageOpacity.toFixed(4),
        );
        section.style.setProperty('--skills-card-stage-y', `${cardStageY.toFixed(1)}px`);
        section.style.setProperty(
          '--skills-card-pointer',
          cardStageOpacity > 0.05 ? 'auto' : 'none',
        );

        section.style.setProperty(
          '--skills-stage-opacity',
          (1 - smooth((progress - 0.18) / 0.1)).toFixed(4),
        );
        section.style.setProperty(
          '--skills-intro-copy-opacity',
          (opening * (1 - departure)).toFixed(4),
        );
        section.style.setProperty('--skills-intro-rule-scale', opening.toFixed(4));

        // Fade out chapter mark and explore cue smoothly
        const cueOpacity = 1 - smooth((progress - 0.78) / 0.14);
        section.style.setProperty('--skills-cue-opacity', cueOpacity.toFixed(4));

        // Smoothly dissolve liquid chrome backdrop into #0b0908 for seamless merge into achievements
        const chromeFade = 1 - smooth((progress - 0.80) / 0.16);
        document.documentElement.style.setProperty(
          '--skills-chrome-fade',
          chromeFade.toFixed(4),
        );
      }
      setCardsVisible((current) => {
        const visible = progress >= 0.24 && progress <= 1.05;
        return current === visible ? current : visible;
      });
      setRendererReleased((current) => {
        const release = progress >= 1.05;
        return current === release ? current : release;
      });
    };
    const unsubscribe = next.subscribe(update);
    update();
    return () => {
      unsubscribe();
      next.dispose();
      setController(null);
      document.documentElement.style.removeProperty('--skills-chrome-fade');
    };
  }, []);

  useEffect(() => {
    const title = introWordRef.current;
    if (!title || staticExperience) return;
    const observer = new IntersectionObserver(([entry]) => setTitleInView(entry.isIntersecting), {
      threshold: 0.2,
    });
    observer.observe(title);
    return () => observer.disconnect();
  }, [staticExperience]);

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
      id="skills"
      aria-labelledby="skills-title"
      data-renderer-active={rendererActive ? 'true' : 'false'}
      className={`skills-chapter capability-landscape ${staticExperience ? 'skills-static' : ''}`}
    >
      <div className="skills-sticky">
        {!rendererActive && !staticExperience && (
          <div className="skills-render-placeholder" aria-hidden="true" />
        )}
        {ready && staticExperience ? (
          <SkillsFallback reason={reducedMotion ? 'reduced-motion' : 'no-webgl'} />
        ) : (
          <div className="capability-semantic">
            <h2 id="skills-title">SKILLS — CAPABILITY LANDSCAPE</h2>
            <p>Different disciplines. One connected system.</p>
            {skillCategories.map((category) => (
              <section key={category.key} aria-label={category.name}>
                <h3>{category.name}</h3>
                <ul>
                  {category.skills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
        {!staticExperience && (
          <>
            {cardsVisible && (
              <div className="skills-bounce-stage">
                <BounceSkillsCards />
              </div>
            )}
            <div className="skills-intro-stage" aria-hidden="true">
              <div className="skills-intro-content">
                <div className="skills-intro-eyebrow">
                  <span>04 / CAPABILITY LANDSCAPE</span>
                  <span>ANTONIUS JAIRUS</span>
                </div>
                <div ref={introWordRef} className="skills-intro-word" role="presentation">
                  {titleInView && (
                    <ParticleText
                      text="SKILLS"
                      className="skills-particle-title"
                      color="#f0eee7"
                      highlightColor="#d7a1aa"
                      highlightMode="motion"
                      intro="gather"
                      gatherDuration={1000}
                      stagger={130}
                      scatter={130}
                      particleSize={2.3}
                      density={4}
                      trigger="mount"
                      clickBurst={false}
                      pointerRepel={0}
                      idleDrift={0}
                      glow={false}
                      fontSize="clamp(4.6rem, 16.3vw, 17rem)"
                      fontWeight={600}
                      fontFamily="'Clash Display', system-ui, sans-serif"
                    />
                  )}
                </div>
                <div className="skills-intro-rule" />
                <p>Different disciplines. One connected system.</p>
                <div className="skills-intro-next">
                  SCROLL TO ENTER THE LANDSCAPE <span>↘</span>
                </div>
              </div>
            </div>
            <div className="capability-entry-veil" aria-hidden="true" />
            <div className="capability-chapter-mark" aria-hidden="true">
              <span>04 / SKILLS</span>
              <span>CAPABILITY LANDSCAPE</span>
            </div>
            <div className="capability-scroll-cue" aria-hidden="true">
              HOVER OR TAP TO EXPLORE ↗
            </div>
          </>
        )}
      </div>
    </section>
  );
}

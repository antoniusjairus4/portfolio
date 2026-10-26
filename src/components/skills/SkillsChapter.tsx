'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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

const TITLE_LETTERS = [
  { id: 'first-s', letter: 'S' },
  { id: 'k', letter: 'K' },
  { id: 'i', letter: 'I' },
  { id: 'first-l', letter: 'L' },
  { id: 'second-l', letter: 'L' },
  { id: 'last-s', letter: 'S' },
] as const;

export function SkillsChapter() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleLetters = useRef<(HTMLSpanElement | null)[]>([]);
  const ownsEtherRef = useRef(false);
  const [controller, setController] = useState<ChapterProgressController | null>(null);
  const [rendererReleased, setRendererReleased] = useState(false);
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
      section?.style.setProperty(
        '--skills-exit-opacity',
        Math.max(0, Math.min(1, (progress - 0.982) * 55)).toFixed(4),
      );
      if (section) {
        const opening = smooth((progress + 0.04) / 0.065);
        const departure = smooth((progress - 0.15) / 0.1);
        section.style.setProperty(
          '--skills-stage-opacity',
          (1 - smooth((progress - 0.18) / 0.1)).toFixed(4),
        );
        section.style.setProperty(
          '--skills-intro-copy-opacity',
          (opening * (1 - departure)).toFixed(4),
        );
        section.style.setProperty('--skills-intro-rule-scale', opening.toFixed(4));
        titleLetters.current.forEach((letter, index) => {
          if (!letter) return;
          const arrive = smooth((progress + 0.04 - index * 0.003) / 0.055);
          const leave = smooth((progress - 0.145 - index * 0.002) / 0.09);
          letter.style.opacity = (arrive * (1 - leave)).toFixed(4);
          letter.style.transform = `translate3d(${((index - 2.5) * leave * 18).toFixed(1)}px, ${((1 - arrive) * (58 + (index % 2) * 18) - leave * 88).toFixed(1)}px, ${((1 - arrive) * -95 + leave * 120).toFixed(1)}px) rotateX(${((1 - arrive) * 26 - leave * 12).toFixed(1)}deg)`;
        });
      }
      setRendererReleased((current) => {
        const release = progress >= 0.999;
        return current === release ? current : release;
      });
    };
    const unsubscribe = next.subscribe(update);
    update();
    return () => {
      unsubscribe();
      next.dispose();
      setController(null);
    };
  }, []);

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
            <div className="skills-intro-stage" aria-hidden="true">
              <div className="skills-intro-content">
                <div className="skills-intro-eyebrow">
                  <span>04 / CAPABILITY LANDSCAPE</span>
                  <span>ANTONIUS JAIRUS</span>
                </div>
                <div className="skills-intro-word" role="presentation">
                  {TITLE_LETTERS.map(({ id, letter }, index) => (
                    <span
                      key={id}
                      ref={(node) => {
                        titleLetters.current[index] = node;
                      }}
                      className="skills-intro-letter"
                    >
                      {letter}
                    </span>
                  ))}
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
              SCROLL TO TRAVERSE ↘
            </div>
          </>
        )}
      </div>
    </section>
  );
}

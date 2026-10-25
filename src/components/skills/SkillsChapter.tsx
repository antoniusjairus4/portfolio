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

export function SkillsChapter() {
  const sectionRef = useRef<HTMLElement>(null);
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
        Math.max(0, 1 - progress * 18).toFixed(4),
      );
      section?.style.setProperty(
        '--skills-exit-opacity',
        Math.max(0, Math.min(1, (progress - 0.982) * 55)).toFixed(4),
      );
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

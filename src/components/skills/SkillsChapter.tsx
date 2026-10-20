'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { SkillsFallback } from '@/components/skills/SkillsFallback';
import { getCategoryOpacity, getSkillsCategory } from '@/components/skills/skillsChoreography';
import { bindSkillLabel, skillLabelId } from '@/components/skills/skillsLabels';
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
  const introRef = useRef<HTMLElement>(null);
  const categoryRefs = useRef<(HTMLElement | null)[]>([]);
  const ownsEtherRef = useRef(false);
  const [controller, setController] = useState<ChapterProgressController | null>(null);
  const [rendererReleased, setRendererReleased] = useState(false);
  const { ready, reducedMotion, portrait, quality, dprCap, finePointer } =
    useExperienceEnvironment();
  const { setMode: setGlobalEtherMode } = useGlobalEther();
  const activity = useChapterActivity(sectionRef);
  const staticExperience = reducedMotion || quality === 'fallback';
  const renderWebGL = ready && !staticExperience;
  const rendererActive = renderWebGL && activity !== 'inactive' && !rendererReleased;
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

    const updatePresentation = () => {
      const section = sectionRef.current;
      if (!section) return;
      const progress = next.progress.current;
      section.style.setProperty('--skills-progress', progress.toFixed(4));
      section.dataset.skillsCategory = getSkillsCategory(progress);
      setRendererReleased((current) => {
        const release = progress >= 0.995;
        return current === release ? current : release;
      });

      if (introRef.current && !staticExperience) {
        const opacity = Math.max(0, Math.min(1, (0.03 - progress) / 0.025));
        introRef.current.style.opacity = opacity.toFixed(3);
        introRef.current.style.transform = `translate3d(0, ${progress * -24}px, 0)`;
      }

      categoryRefs.current.forEach((element, index) => {
        if (!element || staticExperience) return;
        const opacity = getCategoryOpacity(progress, index);
        element.style.opacity = opacity.toFixed(3);
        element.style.transform = `translate3d(0, ${(1 - opacity) * 20}px, 0)`;
        element.style.pointerEvents = opacity > 0.6 ? 'auto' : 'none';
      });
    };

    const unsubscribe = next.subscribe(updatePresentation);
    updatePresentation();
    return () => {
      unsubscribe();
      next.dispose();
      setController(null);
    };
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
      data-skills-category="programming"
      data-renderer-active={rendererActive ? 'true' : 'false'}
      className={`skills-chapter ${staticExperience ? 'skills-static' : ''}`}
    >
      <div className="skills-sticky">
        {!rendererActive && !staticExperience && (
          <div className="skills-render-placeholder" aria-hidden="true" />
        )}

        <header ref={introRef} className="skills-intro">
          <p>CAPABILITY LANDSCAPE · SIX CONNECTED SYSTEMS</p>
          <h2 id="skills-title">SKILLS</h2>
          <p>
            One continuous system of foundations, surfaces, services, boundaries, tools, and
            augmentation.
          </p>
        </header>

        {ready && staticExperience ? (
          <SkillsFallback reason={reducedMotion ? 'reduced-motion' : 'no-webgl'} />
        ) : (
          <>
            <div className="skills-category-presentations">
              {skillCategories.map((category, index) => (
                <section
                  key={category.key}
                  ref={(node) => {
                    categoryRefs.current[index] = node;
                  }}
                  className={`skills-category skills-category-${category.key}`}
                >
                  <span>{category.index} / 06</span>
                  <h3>{category.name}</h3>
                  <p>{category.statement}</p>
                  <ul className="skills-semantic-list" aria-label={`${category.name} skills`}>
                    {category.skills.map((skill) => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
            <div className="skills-spatial-labels" aria-hidden="true">
              {skillCategories.flatMap((category, domain) =>
                category.skills.map((skill, index) => (
                  <span
                    key={`${category.key}-${skill}`}
                    ref={(node) => bindSkillLabel(skillLabelId(domain, index), node)}
                    className={`skills-inscription ${domain === 0 && index === 0 ? 'skills-inscription-foundation' : ''}`}
                  >
                    <i />
                    {skill}
                  </span>
                )),
              )}
            </div>
          </>
        )}

        <div className="skills-chapter-index" aria-hidden="true">
          <span>04</span>
          <i />
          <span>SK</span>
        </div>
        <div className="skills-travel-note" aria-hidden="true">
          SCROLL / TRAVERSE
        </div>
        <div className="skills-exit-axis" aria-hidden="true" />
      </div>
    </section>
  );
}

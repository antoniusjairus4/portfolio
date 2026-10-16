'use client';

import dynamic from 'next/dynamic';
import {
  createContext,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ChapterProgressController } from '@/experience/chapterProgress';
import type { ChapterActivity } from '@/experience/useChapterActivity';

const ExperienceCanvas = dynamic(
  () => import('@/experience/ExperienceCanvas').then((module) => module.ExperienceCanvas),
  { ssr: false },
);

export type ProjectSceneKey = 'kaiforge' | 'palindrome';

interface SceneRegistration {
  controller: ChapterProgressController;
  sectionRef: RefObject<HTMLElement | null>;
  activity: ChapterActivity;
  enabled: boolean;
  portrait: boolean;
  dprCap: number;
}

interface ProjectExperienceContextValue {
  registerScene: (key: ProjectSceneKey, registration: SceneRegistration) => () => void;
}

const ProjectExperienceContext = createContext<ProjectExperienceContextValue | null>(null);

export function ProjectExperienceProvider({ children }: { children: ReactNode }) {
  const [registrations, setRegistrations] = useState<
    Partial<Record<ProjectSceneKey, SceneRegistration>>
  >({});
  const [activeKey, setActiveKey] = useState<ProjectSceneKey | null>(null);
  const frameRef = useRef(0);

  const registerScene = useCallback((key: ProjectSceneKey, registration: SceneRegistration) => {
    setRegistrations((current) => ({ ...current, [key]: registration }));
    return () => {
      setRegistrations((current) => {
        if (current[key] !== registration) return current;
        const next = { ...current };
        delete next[key];
        return next;
      });
    };
  }, []);

  useEffect(() => {
    const selectScene = () => {
      frameRef.current = 0;
      const kaiForge = registrations.kaiforge;
      const palindrome = registrations.palindrome;
      const palindromeTop = palindrome?.sectionRef.current?.getBoundingClientRect().top;
      const palindromeOwnsFrame =
        palindrome?.enabled &&
        palindrome.activity !== 'inactive' &&
        palindromeTop !== undefined &&
        palindromeTop <= window.innerHeight * 0.45;

      const nextKey = palindromeOwnsFrame
        ? 'palindrome'
        : kaiForge?.enabled && kaiForge.activity !== 'inactive'
          ? 'kaiforge'
          : palindrome?.enabled && palindrome.activity !== 'inactive'
            ? 'palindrome'
            : null;
      setActiveKey((current) => (current === nextKey ? current : nextKey));
    };
    const schedule = () => {
      if (!frameRef.current) frameRef.current = requestAnimationFrame(selectScene);
    };

    selectScene();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    };
  }, [registrations]);

  const activeRegistration = activeKey ? registrations[activeKey] : null;
  const contextValue = useMemo(() => ({ registerScene }), [registerScene]);

  return (
    <ProjectExperienceContext.Provider value={contextValue}>
      <div className="project-experience-root">
        {activeKey && activeRegistration?.enabled && (
          <div
            className="project-experience-layer"
            data-project-scene={activeKey}
            aria-hidden="true"
          >
            <ExperienceCanvas
              scene={activeKey}
              controller={activeRegistration.controller}
              dprCap={activeRegistration.dprCap}
              portrait={activeRegistration.portrait}
            />
          </div>
        )}
        {children}
      </div>
    </ProjectExperienceContext.Provider>
  );
}

export function useProjectSceneRegistration(
  key: ProjectSceneKey,
  registration: SceneRegistration | null,
) {
  const context = useContext(ProjectExperienceContext);
  if (!context) throw new Error('Project scenes must be inside ProjectExperienceProvider.');

  useEffect(() => {
    if (!registration) return;
    return context.registerScene(key, registration);
  }, [context, key, registration]);
}

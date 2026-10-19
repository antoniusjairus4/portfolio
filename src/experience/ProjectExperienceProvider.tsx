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
import { AssetLifecycleManager } from '@/experience/assets/AssetLifecycleManager';
import { coordinateProductionAssets } from '@/experience/assets/coordinator';
import { lifecycleTestFixture, lifecycleTestFixtureDriver } from '@/experience/assets/fixture';
import type { KaiForgeGLTF, KaiForgeGLTFContext } from '@/experience/assets/kaiforgeGLTF';
import { productionAssetManifest } from '@/experience/assets/manifest';
import type { ProductionAssetSnapshot } from '@/experience/assets/types';
import type { ChapterProgressController } from '@/experience/chapterProgress';
import { useExperienceEnvironment } from '@/experience/ExperienceEnvironment';
import type { ChapterActivity } from '@/experience/useChapterActivity';

const ExperienceCanvas = dynamic(
  () => import('@/experience/ExperienceCanvas').then((module) => module.ExperienceCanvas),
  { ssr: false },
);

export type ProjectSceneKey =
  | 'kaiforge'
  | 'kai-palindrome-bridge'
  | 'palindrome'
  | 'neuroshield'
  | 'skills';

interface SceneRegistration {
  controller: ChapterProgressController;
  sectionRef: RefObject<HTMLElement | null>;
  activity: ChapterActivity;
  enabled: boolean;
  portrait: boolean;
  dprCap: number;
  finePointer?: boolean;
}

interface ProjectExperienceContextValue {
  registerScene: (key: ProjectSceneKey, registration: SceneRegistration) => () => void;
  assetManager: AssetLifecycleManager | null;
}

const ProjectExperienceContext = createContext<ProjectExperienceContextValue | null>(null);

declare global {
  interface Window {
    __portfolioAssetLifecycle?: {
      snapshot: () => readonly ProductionAssetSnapshot[];
    };
  }
}

export function ProjectExperienceProvider({
  children,
  criticalReady = false,
}: {
  children: ReactNode;
  criticalReady?: boolean;
}) {
  const environment = useExperienceEnvironment();
  const [registrations, setRegistrations] = useState<
    Partial<Record<ProjectSceneKey, SceneRegistration>>
  >({});
  const [activeKey, setActiveKey] = useState<ProjectSceneKey | null>(null);
  const [assetManager, setAssetManager] = useState<AssetLifecycleManager | null>(null);
  const assetManagerRef = useRef<AssetLifecycleManager | null>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    if (!environment.ready || assetManagerRef.current) return;
    const manager = new AssetLifecycleManager(
      { quality: environment.quality, portrait: environment.portrait },
      productionAssetManifest,
    );
    // Loader code is deferred until preparation; it shares the session manager and renderer.
    const driver = () =>
      import('@/experience/assets/kaiforgeGLTF').then((module) => module.kaiForgeGLTFDriver);
    manager.registerDriver<KaiForgeGLTF, KaiForgeGLTF, KaiForgeGLTFContext>('kaiforge-glb', {
      prepare: async (bytes, definition, variant) =>
        (await driver()).prepare(bytes, definition, variant),
      makeResident: async (prepared, context, definition, variant) =>
        (await driver()).makeResident(prepared, context, definition, variant),
      disposePrepared: (resource) => resource.dispose(),
      disposeResident: (resource) => resource.dispose(),
    });
    const fixtureEnabled =
      process.env.NODE_ENV !== 'production' &&
      new URLSearchParams(window.location.search).has('assetLifecycleFixture');
    if (fixtureEnabled) {
      manager.register(lifecycleTestFixture);
      manager.registerDriver('test-fixture', lifecycleTestFixtureDriver);
    }
    assetManagerRef.current = manager;
    setAssetManager(manager);
  }, [environment.portrait, environment.quality, environment.ready]);

  useEffect(
    () => () => {
      assetManagerRef.current?.disposeAll();
      assetManagerRef.current = null;
    },
    [],
  );

  useEffect(() => {
    if (!assetManager || process.env.NODE_ENV === 'production') return;
    window.__portfolioAssetLifecycle = { snapshot: () => assetManager.getSnapshot() };
    return () => {
      delete window.__portfolioAssetLifecycle;
    };
  }, [assetManager]);

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
      const bridge = registrations['kai-palindrome-bridge'];
      const palindrome = registrations.palindrome;
      const bridgeTop = bridge?.sectionRef.current?.getBoundingClientRect().top;
      const neuroShield = registrations.neuroshield;
      const skills = registrations.skills;
      const palindromeTop = palindrome?.sectionRef.current?.getBoundingClientRect().top;
      const neuroShieldTop = neuroShield?.sectionRef.current?.getBoundingClientRect().top;
      const skillsTop = skills?.sectionRef.current?.getBoundingClientRect().top;
      const viewportHeight = window.innerHeight;
      // The Hero exposes Recognition before the chapter enters the viewport.
      // Prepare its first frame after critical content is ready, while the Hero
      // still covers it. Demand rendering keeps this idle preparation to one frame.
      const heroBottom = document.getElementById('hero')?.getBoundingClientRect().bottom;
      const prepareKaiForge = criticalReady && heroBottom !== undefined && heroBottom > 0;
      const chapterSignals = Object.fromEntries(
        (['kaiforge', 'palindrome', 'neuroshield', 'skills'] as const).flatMap((key) => {
          const registration = registrations[key];
          const rect = registration?.sectionRef.current?.getBoundingClientRect();
          return registration && rect
            ? [
                [
                  key,
                  {
                    progress: registration.controller.progress.current,
                    top: rect.top,
                    bottom: rect.bottom,
                  },
                ],
              ]
            : [];
        }),
      );
      if (assetManager) {
        coordinateProductionAssets(assetManager, {
          eligible:
            environment.ready && !environment.reducedMotion && environment.quality !== 'fallback',
          criticalReady,
          viewportHeight: window.innerHeight,
          chapters: chapterSignals,
        });
      }
      // Both boundaries are geometrically exact: the bridge starts on KaiForge's
      // Release frame and ends on Palindrome's Ordinary room frame.
      const bridgeOwnsFrame =
        bridge?.enabled &&
        bridge.activity !== 'inactive' &&
        bridgeTop !== undefined &&
        bridgeTop <= viewportHeight &&
        (palindromeTop === undefined || palindromeTop > viewportHeight);
      const palindromeOwnsFrame =
        palindrome?.enabled &&
        palindrome.activity !== 'inactive' &&
        palindromeTop !== undefined &&
        palindromeTop <= viewportHeight;
      const neuroShieldOwnsFrame =
        neuroShield?.enabled &&
        neuroShield.activity !== 'inactive' &&
        neuroShieldTop !== undefined &&
        neuroShieldTop <= window.innerHeight * 0.45;
      const skillsOwnsFrame =
        skills?.enabled &&
        skills.activity !== 'inactive' &&
        skillsTop !== undefined &&
        skillsTop <= window.innerHeight * 0.45;

      const nextKey = skillsOwnsFrame
        ? 'skills'
        : neuroShieldOwnsFrame
          ? 'neuroshield'
          : palindromeOwnsFrame
            ? 'palindrome'
            : bridgeOwnsFrame
              ? 'kai-palindrome-bridge'
              : kaiForge?.enabled && (prepareKaiForge || kaiForge.activity !== 'inactive')
                ? 'kaiforge'
                : neuroShield?.enabled && neuroShield.activity !== 'inactive'
                  ? 'neuroshield'
                  : skills?.enabled && skills.activity !== 'inactive'
                    ? 'skills'
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
  }, [
    assetManager,
    criticalReady,
    environment.quality,
    environment.ready,
    environment.reducedMotion,
    registrations,
  ]);

  const activeRegistration = activeKey ? registrations[activeKey] : null;
  const contextValue = useMemo(
    () => ({ registerScene, assetManager }),
    [assetManager, registerScene],
  );

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
              finePointer={activeRegistration.finePointer ?? false}
            />
          </div>
        )}
        {children}
      </div>
    </ProjectExperienceContext.Provider>
  );
}

export function useProductionAssetManager() {
  const context = useContext(ProjectExperienceContext);
  if (!context) throw new Error('Production assets must be inside ProjectExperienceProvider.');
  return context.assetManager;
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

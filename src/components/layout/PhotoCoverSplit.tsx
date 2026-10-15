'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { BakeResult, LetterBox } from '@/components/layout/collapse/bakePhysics';
import { PhysicsDebugOverlay } from '@/components/layout/collapse/PhysicsDebugOverlay';
import {
  createPhysicsCollapseController,
  type PhysicsCollapseController,
} from '@/components/layout/collapse/usePhysicsCollapse';
import {
  getHeroChoreographyState,
  getHeroCollapseProgress,
} from '@/components/layout/heroChoreography';
import { heroContent } from '@/content/heroContent';
import { useExperienceEnvironment } from '@/experience/ExperienceEnvironment';
import { useGlobalEther } from '@/experience/GlobalEtherProvider';
import { useChapterActivity } from '@/experience/useChapterActivity';
import { SCROLL_STORY } from '@/motion/tokens';

gsap.registerPlugin(ScrollTrigger);

interface DebugSnapshot {
  collapseProgress: number;
  bakedFrameIndex: number;
  result: BakeResult | null;
  timeMs: number;
}

function getLayoutBox(element: HTMLElement): Pick<LetterBox, 'x' | 'y' | 'width' | 'height'> {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = element;

  while (node) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }

  return { x, y, width: element.offsetWidth, height: element.offsetHeight };
}

export const PhotoCoverSplit: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  const leftHalfRef = useRef<HTMLDivElement>(null);
  const rightHalfRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const pageBgRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);
  const roleLettersRef = useRef<Map<string, HTMLSpanElement | null>>(new Map());
  const controllerRef = useRef<PhysicsCollapseController | null>(null);
  const letterMapRef = useRef<Map<string, HTMLElement>>(new Map());
  const resizeFrameRef = useRef(0);
  const lastStateRef = useRef('');

  const { ready, reducedMotion } = useExperienceEnvironment();
  const { setMode: setGlobalEtherMode } = useGlobalEther();
  const activity = useChapterActivity(containerRef);
  const [debugEnabled, setDebugEnabled] = useState(false);
  const [debugSnapshot, setDebugSnapshot] = useState<DebugSnapshot>({
    collapseProgress: 0,
    bakedFrameIndex: 0,
    result: null,
    timeMs: 0,
  });

  const nameLines = useMemo(() => {
    let offset = 0;
    return heroContent.name.split(' ').map((word) => {
      const line = { word, offset };
      offset += word.length + 1;
      return line;
    });
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      setDebugEnabled(new URLSearchParams(window.location.search).get('physDebug') === '1');
    }
  }, []);

  useEffect(() => {
    const heroOwnsAtmosphere = activity === 'approaching' || activity === 'active';
    setGlobalEtherMode(heroOwnsAtmosphere ? 'disabled' : 'enabled');
  }, [activity, setGlobalEtherMode]);

  useEffect(() => () => setGlobalEtherMode('enabled'), [setGlobalEtherMode]);

  useEffect(() => {
    const container = containerRef.current;
    const leftHalf = leftHalfRef.current;
    const rightHalf = rightHalfRef.current;
    const contentWrapper = contentWrapperRef.current;
    const pageBackground = pageBgRef.current;
    if (!container || !leftHalf || !rightHalf || !contentWrapper || !pageBackground || !ready) {
      return;
    }

    let cancelled = false;
    let context: gsap.Context | null = null;
    const nameLetters = lettersRef.current.filter(
      (letter): letter is HTMLSpanElement => letter !== null,
    );
    const roleLetters = Array.from(roleLettersRef.current.values()).filter(
      (letter): letter is HTMLSpanElement => letter !== null,
    );

    const setHeroState = (progress: number) => {
      const state = getHeroChoreographyState(progress);
      container.style.setProperty('--hero-progress', progress.toFixed(4));
      if (lastStateRef.current !== state) {
        lastStateRef.current = state;
        container.dataset.heroState = state;
      }
    };

    const bakePhysics = () => {
      if (reducedMotion) return;
      const boxes: LetterBox[] = [];
      const elements = new Map<string, HTMLElement>();

      heroContent.name.split('').forEach((char, index) => {
        const element = lettersRef.current[index];
        if (!element || char === ' ') return;
        boxes.push({ id: `name-${index}`, char, ...getLayoutBox(element), isName: true });
        elements.set(`name-${index}`, element);
      });

      heroContent.roles.forEach((role, roleIndex) => {
        role.split('').forEach((char, charIndex) => {
          const id = `role-${roleIndex}-${charIndex}`;
          const element = roleLettersRef.current.get(id);
          if (!element || char === ' ') return;
          boxes.push({ id, char, ...getLayoutBox(element), isName: false });
          elements.set(id, element);
        });
      });

      letterMapRef.current = elements;
      controllerRef.current ??= createPhysicsCollapseController();
      const result = controllerRef.current.bake(window.innerWidth, window.innerHeight, boxes);
      if (debugEnabled) {
        setDebugSnapshot((snapshot) => ({
          ...snapshot,
          result,
          timeMs: controllerRef.current?.bakeTimeMs ?? 0,
        }));
      }
    };

    const initialize = () => {
      if (cancelled) return;
      bakePhysics();

      context = gsap.context(() => {
        gsap.set([leftHalf, rightHalf, contentWrapper], { force3D: !reducedMotion });
        setHeroState(0);

        if (reducedMotion) {
          container.dataset.heroState = 'identity';
          container.dataset.reducedMotion = 'true';
          gsap.set(nameLetters, { opacity: 1, yPercent: 0 });
          gsap.set(roleLetters, { opacity: 1, yPercent: 0 });
          gsap.set([leftHalf, rightHalf], { opacity: 0.46, xPercent: 0 });
          gsap.set(pageBackground, { opacity: 0.55 });
          return;
        }

        delete container.dataset.reducedMotion;
        gsap.set(nameLetters, { opacity: 0, yPercent: 120 });
        gsap.set(roleLetters, { opacity: 0, yPercent: 60 });
        gsap.set([leftHalf, rightHalf], { opacity: 1, xPercent: 0 });
        gsap.set(pageBackground, { opacity: 1 });

        const timeline = gsap.timeline({
          defaults: { overwrite: 'auto' },
          scrollTrigger: {
            trigger: container,
            start: 'top top',
            end: () => `+=${Math.round(window.innerHeight * (SCROLL_STORY.totalDistanceVh / 100))}`,
            pin: true,
            scrub: 0.45,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (trigger) => {
              const progress = trigger.progress;
              const collapseProgress = getHeroCollapseProgress(progress);
              setHeroState(progress);

              if (collapseProgress > 0) {
                pageBackground.style.opacity = String(1 - collapseProgress);
                controllerRef.current?.applyFrame(collapseProgress, letterMapRef.current);
              } else {
                pageBackground.style.opacity = '1';
                controllerRef.current?.resetTransforms(letterMapRef.current);
              }

              if (debugEnabled) {
                const totalFrames = controllerRef.current?.bakeResult?.totalFrames ?? 1;
                setDebugSnapshot((snapshot) => ({
                  ...snapshot,
                  collapseProgress,
                  bakedFrameIndex: Math.floor(collapseProgress * (totalFrames - 1)),
                }));
              }
            },
          },
        });

        timeline
          .to(leftHalf, { xPercent: -52, ease: 'power2.inOut', duration: 0.24 }, 0)
          .to(rightHalf, { xPercent: 52, ease: 'power2.inOut', duration: 0.24 }, 0)
          .to(
            nameLetters,
            {
              opacity: 1,
              yPercent: 0,
              stagger: { each: 0.008, from: 'center' },
              ease: 'power3.out',
              duration: 0.17,
            },
            0.04,
          )
          .to(
            roleLetters,
            {
              opacity: 1,
              yPercent: 0,
              stagger: 0.004,
              ease: 'power2.out',
              duration: 0.13,
            },
            0.09,
          )
          .to([leftHalf, rightHalf], { duration: 0.18 }, 0.24)
          .to(leftHalf, { xPercent: -100, ease: 'power2.inOut', duration: 0.2 }, 0.42)
          .to(rightHalf, { xPercent: 100, ease: 'power2.inOut', duration: 0.2 }, 0.42)
          .to(contentWrapper, { duration: 0.38 }, 0.62);
      }, container);

      requestAnimationFrame(() => ScrollTrigger.refresh());
    };

    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    void fontsReady.then(initialize);

    const handleResize = () => {
      cancelAnimationFrame(resizeFrameRef.current);
      resizeFrameRef.current = requestAnimationFrame(() => {
        bakePhysics();
        ScrollTrigger.refresh();
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      cancelled = true;
      cancelAnimationFrame(resizeFrameRef.current);
      window.removeEventListener('resize', handleResize);
      context?.revert();
      controllerRef.current?.dispose(letterMapRef.current);
      controllerRef.current = null;
      letterMapRef.current.clear();
      delete container.dataset.heroState;
      delete container.dataset.reducedMotion;
      container.style.removeProperty('--hero-progress');
    };
  }, [debugEnabled, ready, reducedMotion]);

  const textLayerClass = reducedMotion ? 'z-30' : 'z-10';

  return (
    <section
      ref={containerRef}
      id="hero"
      aria-labelledby="hero-name"
      data-hero-handoff="center-seam"
      className="hero-editorial-composition relative h-[100svh] w-full select-none overflow-hidden [--hero-seam-x:0.5]"
    >
      {debugEnabled && (
        <PhysicsDebugOverlay
          scrollProgress={debugSnapshot.collapseProgress}
          bakedFrameIndex={debugSnapshot.bakedFrameIndex}
          bakeResult={debugSnapshot.result}
          bakeTimeMs={debugSnapshot.timeMs}
          isBaking={false}
        />
      )}

      <div
        ref={pageBgRef}
        data-hero-surface="editorial"
        aria-hidden="true"
        className="hero-editorial-surface absolute inset-0 z-0 h-full w-full overflow-hidden"
      >
        <div className="hero-editorial-spine">
          <span>01</span>
          <span>IDENTITY</span>
        </div>
        <div className="hero-editorial-crossbar" />
        <div className="hero-editorial-accent" />
        <div className="hero-editorial-counterweight" />
        <div className="hero-crimson-rupture" />
      </div>

      <div
        className={`hero-editorial-copy pointer-events-none absolute inset-0 flex h-full w-full items-center justify-center px-3 text-center sm:px-6 ${textLayerClass}`}
      >
        <div
          ref={contentWrapperRef}
          className="flex max-w-full flex-col items-center justify-center will-change-transform"
        >
          <h1
            id="hero-name"
            className="font-hero-name m-0 flex flex-col justify-center gap-[0.12em] p-0"
          >
            <span className="sr-only">{heroContent.name}</span>
            <span aria-hidden="true" className="flex flex-col gap-[0.12em]">
              {nameLines.map(({ word, offset }) => (
                <span key={word} className="hero-name-line">
                  {word.split('').map((char, charIndex) => {
                    const index = offset + charIndex;
                    return (
                      <span
                        key={`${char}-${index}`}
                        ref={(element) => {
                          lettersRef.current[index] = element;
                        }}
                        className="hero-letter"
                      >
                        {char}
                      </span>
                    );
                  })}
                </span>
              ))}
            </span>
          </h1>

          <ul className="mt-5 flex list-none flex-col items-center gap-1 p-0 sm:mt-7 sm:gap-2">
            {heroContent.roles.map((role, roleIndex) => (
              <li key={role} className="font-hero-role">
                <span className="sr-only">{role}</span>
                <span aria-hidden="true" className="inline-flex">
                  {role.split('').map((char, charIndex) => {
                    const id = `role-${roleIndex}-${charIndex}`;
                    return (
                      <span
                        key={id}
                        ref={(element) => {
                          roleLettersRef.current.set(id, element);
                        }}
                        className="hero-letter whitespace-pre"
                      >
                        {char}
                      </span>
                    );
                  })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div
        ref={leftHalfRef}
        className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-hidden"
        style={{ clipPath: 'inset(0 50% 0 0)', willChange: reducedMotion ? 'auto' : 'transform' }}
      >
        <picture>
          <source
            srcSet="/images/cover-1536.avif 1536w, /images/cover-1280.avif 1280w"
            type="image/avif"
          />
          <source
            srcSet="/images/cover-1536.webp 1536w, /images/cover-1280.webp 1280w"
            type="image/webp"
          />
          <img
            src="/images/cover-1536.jpeg"
            alt="Portrait of Antonius Jairus"
            className="h-full w-full object-cover portrait:object-[47.6%_50%] landscape:object-[51.5%_50%]"
            loading="eager"
            fetchPriority="high"
            onLoad={() => ScrollTrigger.refresh()}
          />
        </picture>
      </div>

      <div
        ref={rightHalfRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-hidden"
        style={{ clipPath: 'inset(0 0 0 50%)', willChange: reducedMotion ? 'auto' : 'transform' }}
      >
        <picture>
          <source
            srcSet="/images/cover-1536.avif 1536w, /images/cover-1280.avif 1280w"
            type="image/avif"
          />
          <source
            srcSet="/images/cover-1536.webp 1536w, /images/cover-1280.webp 1280w"
            type="image/webp"
          />
          <img
            src="/images/cover-1536.jpeg"
            alt=""
            className="h-full w-full object-cover portrait:object-[47.6%_50%] landscape:object-[51.5%_50%]"
            loading="eager"
          />
        </picture>
      </div>
    </section>
  );
};

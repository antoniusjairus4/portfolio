'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, { useEffect, useRef, useState } from 'react';
import { heroContent } from '@/content/heroContent';
import { SCROLL_STORY } from '@/motion/tokens';
import { BakeResult, LetterBox } from './collapse/bakePhysics';
import { createPhysicsCollapseController, PhysicsCollapseController } from './collapse/usePhysicsCollapse';
import LiquidEther from '@/components/backgrounds/LiquidEther';
import { PhysicsDebugOverlay } from './collapse/PhysicsDebugOverlay';

gsap.registerPlugin(ScrollTrigger);

if (typeof window !== 'undefined') {
  (window as unknown as { ScrollTrigger: typeof ScrollTrigger }).ScrollTrigger = ScrollTrigger;
}

export const PhotoCoverSplit: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftHalfRef = useRef<HTMLDivElement>(null);
  const rightHalfRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const pageBgRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);
  const roleLettersRef = useRef<Map<string, HTMLSpanElement | null>>(new Map());
  const scrollCueRef = useRef<HTMLDivElement>(null);

  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [collapseProgress, setCollapseProgress] = useState(0);
  const [bakedFrameIndex, setBakedFrameIndex] = useState(0);
  const [debugConfig, setDebugConfig] = useState<{ enabled: boolean }>({ enabled: false });

  const controllerRef = useRef<PhysicsCollapseController | null>(null);
  const letterMapRef = useRef<Map<string, HTMLElement>>(new Map());
  const [bakeState, setBakeState] = useState<{ result: BakeResult | null; timeMs: number; isBaking: boolean }>({
    result: null,
    timeMs: 0,
    isBaking: false,
  });

  useEffect(() => {
    try {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setIsReducedMotion(mediaQuery.matches);

      if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('physDebug') === '1') {
          setDebugConfig({ enabled: true });
        }
      }
    } catch {
      // Fallback
    }
  }, []);

  const nameLetters = heroContent.name.split('');

  // Measure letter boxes & bake physics simulation
  const performBake = () => {
    if (isReducedMotion || !containerRef.current) return;

    if (!controllerRef.current) {
      controllerRef.current = createPhysicsCollapseController();
    }

    const boxes: LetterBox[] = [];
    const elementsMap = new Map<string, HTMLElement>();

    // 1. Name Letters
    nameLetters.forEach((char, index) => {
      const id = `name-${index}`;
      const el = lettersRef.current[index];
      if (el) {
        const rect = el.getBoundingClientRect();
        boxes.push({
          id,
          char,
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
          isName: true,
        });
        elementsMap.set(id, el);
      }
    });

    // 2. Role Letters
    heroContent.roles.forEach((role, rIdx) => {
      role.split('').forEach((char, cIdx) => {
        const id = `role-${rIdx}-${cIdx}`;
        const el = roleLettersRef.current.get(id);
        if (el && char !== ' ') {
          const rect = el.getBoundingClientRect();
          boxes.push({
            id,
            char,
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
            isName: false,
          });
          elementsMap.set(id, el);
        }
      });
    });

    letterMapRef.current = elementsMap;

    const result = controllerRef.current.bake(window.innerWidth, window.innerHeight, boxes);
    setBakeState({
      result,
      timeMs: controllerRef.current.bakeTimeMs,
      isBaking: false,
    });
  };

  useEffect(() => {
    if (!containerRef.current) return;

    let ctx: gsap.Context | null = null;
    let cancelled = false;

    const initAnimation = () => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        // Force 3D hardware acceleration
        gsap.set([leftHalfRef.current, rightHalfRef.current, contentWrapperRef.current], {
          force3D: true,
        });

        // Reduced motion path
        if (isReducedMotion) {
          gsap.set(lettersRef.current, { yPercent: 0, opacity: 1 });

          gsap.timeline({
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top top',
              end: `+=${SCROLL_STORY.totalDistanceVh}%`,
              pin: true,
              scrub: 0.5,
            },
          })
            .to([leftHalfRef.current, rightHalfRef.current], { xPercent: -100, duration: 0.6 }, 0)
            .to(pageBgRef.current, { opacity: 0, duration: 0.4 }, 0.6);

          return;
        }

        // Initial text states before Beat A
        gsap.set(lettersRef.current, { yPercent: 120, opacity: 0 });
        const allRoleLetterEls = Array.from(roleLettersRef.current.values()).filter(Boolean);
        gsap.set(allRoleLetterEls, { yPercent: 60, opacity: 0 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: `+=${SCROLL_STORY.totalDistanceVh}%`,
            pin: true,
            scrub: 0.5,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              // Fade out scroll cue before Beat D begins
              if (self.progress > 0.02 && scrollCueRef.current) {
                gsap.to(scrollCueRef.current, { opacity: 0, duration: 0.3 });
              }

              // Beat D Physics Collapse Progress (holdEnd -> 1.00)
              const holdEnd = SCROLL_STORY.beats.holdEnd;
              if (self.progress >= holdEnd) {
                const p = (self.progress - holdEnd) / (1.0 - holdEnd);
                const clampedP = Math.min(Math.max(p, 0), 1);
                setCollapseProgress(clampedP);

                // Background image cross-fade during collapse
                if (pageBgRef.current) {
                  pageBgRef.current.style.opacity = String(1.0 - clampedP);
                }

                // Apply baked physics transforms
                if (controllerRef.current && controllerRef.current.bakeResult) {
                  controllerRef.current.applyFrame(clampedP, letterMapRef.current);
                  const totalF = controllerRef.current.bakeResult.totalFrames;
                  setBakedFrameIndex(Math.floor(clampedP * (totalF - 1)));
                }
              } else {
                setCollapseProgress(0);
                setBakedFrameIndex(0);

                if (pageBgRef.current) {
                  pageBgRef.current.style.opacity = '1';
                }

                if (controllerRef.current) {
                  controllerRef.current.resetTransforms(letterMapRef.current);
                }
              }
            },
          },
        });

        // --- BEAT A: The Reveal (0% -> 22%) ---
        tl.to(
          leftHalfRef.current,
          { xPercent: -50, ease: 'power2.inOut', duration: 0.22 },
          0
        )
          .to(
            rightHalfRef.current,
            { xPercent: 50, ease: 'power2.inOut', duration: 0.22 },
            0
          )
          .to(
            lettersRef.current,
            {
              yPercent: 0,
              opacity: 1,
              stagger: 0.03,
              ease: 'power3.out',
              duration: 0.15,
            },
            0.03
          )
          .to(
            allRoleLetterEls,
            {
              yPercent: 0,
              opacity: 1,
              stagger: 0.015,
              ease: 'power2.out',
              duration: 0.12,
            },
            0.08
          );

        // --- BEAT B: The Read (22% -> 35%) ---
        tl.to(
          [leftHalfRef.current, rightHalfRef.current],
          { duration: 0.13 },
          0.22
        );

        // --- BEAT C: The Exit (35% -> 60%) ---
        tl.to(
          leftHalfRef.current,
          { xPercent: -100, ease: 'power2.inOut', duration: 0.25 },
          0.35
        ).to(
          rightHalfRef.current,
          { xPercent: 100, ease: 'power2.inOut', duration: 0.25 },
          0.35
        );

        // --- CLEAN HOLD (60% -> 64%) ---
        tl.to(contentWrapperRef.current, { duration: 0.04 }, 0.60);

      }, containerRef);
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        initAnimation();
        performBake();
      });
    } else {
      initAnimation();
      performBake();
    }

    const handleResize = () => {
      performBake();
      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', handleResize);

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      if (ctx) (ctx as gsap.Context).revert();
    };
  }, [isReducedMotion]);

  // Pre-decode revealed background image after page load
  useEffect(() => {
    const img = new Image();
    img.src = '/images/hero/after_split-1672.webp';
    if ('decode' in img) {
      img.decode().catch(() => {});
    }
  }, []);

  // Keyboard Navigation: Enter/Space/ArrowDown advance beat-by-beat, ArrowUp reverses
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const vh = window.innerHeight;
    const currentScroll = window.scrollY;
    const totalDist = vh * (SCROLL_STORY.totalDistanceVh / 100);

    if (['Enter', ' ', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
      if (currentScroll < totalDist * 0.22) {
        window.scrollTo({ top: totalDist * 0.28, behavior: 'smooth' }); // Beat A -> B
      } else if (currentScroll < totalDist * 0.50) {
        window.scrollTo({ top: totalDist * 0.62, behavior: 'smooth' }); // Beat B -> C/Hold
      } else if (currentScroll < totalDist * 0.95) {
        window.scrollTo({ top: totalDist, behavior: 'smooth' }); // Beat C -> D (Collapse complete)
      } else {
        window.scrollTo({ top: totalDist + vh, behavior: 'smooth' }); // To Placeholder
      }
    } else if (e.key === 'ArrowUp') {
      if (currentScroll > 0) {
        e.preventDefault();
        if (currentScroll > totalDist * 0.6) {
          window.scrollTo({ top: totalDist * 0.28, behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <section
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="relative w-full h-[100svh] overflow-hidden bg-[#0C0907] outline-none select-none"
      aria-label="Full-screen photo cover. Use arrow keys or scroll to reveal portfolio story."
    >
      {/* Dev-only Debug Overlay */}
      {debugConfig.enabled && (
        <PhysicsDebugOverlay
          scrollProgress={collapseProgress}
          bakedFrameIndex={bakedFrameIndex}
          bakeResult={bakeState.result}
          bakeTimeMs={bakeState.timeMs}
          isBaking={bakeState.isBaking}
        />
      )}

      {/* Centre Content Layer (Beneath Photo Halves) */}
      <div
        ref={pageBgRef}
        className="absolute inset-0 w-full h-full z-0 overflow-hidden transition-opacity duration-75"
      >

        {/* Revealed Background Image */}
        <picture className="absolute inset-0 w-full h-full">
          <source
            srcSet="/images/hero/after_split-1672.avif 1672w, /images/hero/after_split-1280.avif 1280w"
            type="image/avif"
          />
          <source
            srcSet="/images/hero/after_split-1672.webp 1672w, /images/hero/after_split-1280.webp 1280w"
            type="image/webp"
          />
          <img
            src="/images/hero/after_split-1672.jpg"
            alt=""
            className="w-full h-full object-cover object-center"
            loading="lazy"
          />
        </picture>

        {/* Autonomous WebGL LiquidEther Simulation Layer */}
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-80 mix-blend-screen">
          <LiquidEther
            colors={['#0A0908', '#9A6318', '#F5B031', '#FFD275']}
            mouseForce={0}
            cursorSize={130}
            isViscous={true}
            viscous={40}
            iterationsViscous={36}
            iterationsPoisson={40}
            resolution={0.65}
            isBounce={false}
            autoDemo={true}
            autoSpeed={0.5}
            autoIntensity={3.0}
            takeoverDuration={0.3}
            autoResumeDelay={0}
            autoRampDuration={0.6}
            backgroundColor="#0C0907"
          />
        </div>

        {/* Static Darkening Scrim */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(12, 9, 7, 0.45) 0%, rgba(12, 9, 7, 0.85) 100%)',
          }}
        />
      </div>

      {/* Text Layer Centred on both axes */}
      <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-4 text-center z-10 pointer-events-none">
        {/* Scalable Text Wrapper */}
        <div
          ref={contentWrapperRef}
          className="flex flex-col items-center justify-center will-change-transform"
        >
          {/* Accessible H1 with letter spans */}
          <h1 className="font-hero-name tracking-tighter m-0 p-0 flex justify-center py-2">
            <span className="sr-only">{heroContent.name}</span>
            <span aria-hidden="true" className="flex">
              {nameLetters.map((char, index) => (
                <span
                  key={`${char}-${index}`}
                  ref={(el) => {
                    lettersRef.current[index] = el;
                  }}
                  className="inline-block will-change-transform"
                >
                  {char}
                </span>
              ))}
            </span>
          </h1>

          {/* Semantic 3-Role List */}
          <ul className="list-none p-0 m-0 mt-3 sm:mt-5 flex flex-col items-center gap-1 sm:gap-2">
            {heroContent.roles.map((role, rIdx) => (
              <li key={role} className="font-hero-role tracking-wide">
                <span aria-hidden="true" className="inline-flex">
                  {role.split('').map((char, cIdx) => (
                    <span
                      key={`${role}-${cIdx}`}
                      ref={(el) => {
                        roleLettersRef.current.set(`role-${rIdx}-${cIdx}`, el);
                      }}
                      className="inline-block will-change-transform whitespace-pre"
                    >
                      {char}
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Left Image Half */}
      <div
        ref={leftHalfRef}
        className="absolute inset-0 w-full h-full z-10 overflow-hidden pointer-events-none"
        style={{ clipPath: 'inset(0 50% 0 0)', willChange: 'transform' }}
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
            alt="Jairus Portfolio Cover"
            className="w-full h-full object-cover portrait:object-[47.6%_50%] landscape:object-[51.5%_50%]"
            loading="eager"
            fetchPriority="high"
            onLoad={() => ScrollTrigger.refresh()}
          />
        </picture>
      </div>

      {/* Right Image Half */}
      <div
        ref={rightHalfRef}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full z-10 overflow-hidden pointer-events-none"
        style={{ clipPath: 'inset(0 0 0 50%)', willChange: 'transform' }}
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
            className="w-full h-full object-cover portrait:object-[47.6%_50%] landscape:object-[51.5%_50%]"
            loading="eager"
          />
        </picture>
      </div>

      {/* Minimal Scroll Cue */}
      <div
        ref={scrollCueRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none transition-opacity duration-300"
      >
        <div className="w-[1px] h-10 bg-gradient-to-b from-[#E0A93B] to-transparent animate-pulse" />
      </div>
    </section>
  );
};

'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import dynamic from 'next/dynamic';
import React, { useEffect, useRef, useState } from 'react';
import { heroContent } from '@/content/heroContent';
import { NAME_EXIT_SCALE_END, SCROLL_STORY } from '@/motion/tokens';

const StripTearCanvas = dynamic(
  () => import('./tear/StripTearCanvas').then((m) => m.StripTearCanvas),
  { ssr: false }
);

gsap.registerPlugin(ScrollTrigger);

if (typeof window !== 'undefined') {
  (window as unknown as { ScrollTrigger: typeof ScrollTrigger }).ScrollTrigger = ScrollTrigger;
}

export const PhotoCoverSplit: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftHalfRef = useRef<HTMLDivElement>(null);
  const rightHalfRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);
  const rolesRef = useRef<(HTMLLIElement | null)[]>([]);
  const scrollCueRef = useRef<HTMLDivElement>(null);

  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [tearProgress, setTearProgress] = useState(0);
  const [isTearActive, setIsTearActive] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    try {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setIsReducedMotion(mediaQuery.matches);
    } catch {
      // Fallback
    }

    const updateDims = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    updateDims();

    window.addEventListener('resize', updateDims);
    return () => window.removeEventListener('resize', updateDims);
  }, []);

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

        // Reduced motion path: simple crossfade without letter stagger or 3D tear
        if (isReducedMotion) {
          gsap.set(lettersRef.current, { yPercent: 0, opacity: 1 });
          gsap.set(rolesRef.current, { yPercent: 0, opacity: 1 });

          gsap.timeline({
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top top',
              end: `+=${SCROLL_STORY.totalDistanceVh}%`,
              pin: true,
              scrub: 0.5,
            },
          })
            .to([leftHalfRef.current, rightHalfRef.current], { xPercent: -100, duration: 0.5 }, 0)
            .to(contentWrapperRef.current, { opacity: 0, duration: 0.5 }, 0.5);

          return;
        }

        // Initial text states before Beat A
        gsap.set(lettersRef.current, { yPercent: 120, opacity: 0 });
        gsap.set(rolesRef.current, { yPercent: 60, opacity: 0 });

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

              // Beat D Tear Progress (0.61 -> 1.00)
              const holdEnd = SCROLL_STORY.beats.holdEnd;
              if (self.progress >= holdEnd) {
                setIsTearActive(true);
                const p = (self.progress - holdEnd) / (1.0 - holdEnd);
                setTearProgress(Math.min(Math.max(p, 0), 1));
              } else {
                setIsTearActive(false);
                setTearProgress(0);
              }
            },
          },
        });

        // --- BEAT A: The Reveal (0% -> 20%) ---
        tl.to(
          leftHalfRef.current,
          { xPercent: -50, ease: 'power2.inOut', duration: 0.20 },
          0
        )
          .to(
            rightHalfRef.current,
            { xPercent: 50, ease: 'power2.inOut', duration: 0.20 },
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
            rolesRef.current,
            {
              yPercent: 0,
              opacity: 1,
              stagger: 0.04,
              ease: 'power2.out',
              duration: 0.12,
            },
            0.08
          );

        // --- BEAT B: The Read (20% -> 32%) ---
        tl.to(
          [leftHalfRef.current, rightHalfRef.current],
          { duration: 0.12 },
          0.20
        );

        // --- BEAT C: The Exit (32% -> 57%) ---
        // Halves slide completely off-screen (-100% / +100%)
        // Text scales up slightly to NAME_EXIT_SCALE_END (1.3x) without fading out
        tl.to(
          leftHalfRef.current,
          { xPercent: -100, ease: 'power2.inOut', duration: 0.25 },
          0.32
        )
          .to(
            rightHalfRef.current,
            { xPercent: 100, ease: 'power2.inOut', duration: 0.25 },
            0.32
          )
          .to(
            contentWrapperRef.current,
            {
              scale: NAME_EXIT_SCALE_END,
              ease: 'power1.out',
              duration: 0.25,
            },
            0.32
          );

        // --- CLEAN HOLD (57% -> 61%) ---
        tl.to(contentWrapperRef.current, { duration: 0.04 }, 0.57);
      }, containerRef);
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(initAnimation);
    } else {
      initAnimation();
    }

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
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

  // Keyboard Navigation: Enter/Space/ArrowDown step beat-by-beat (A -> B -> C -> D -> Next Page)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const vh = window.innerHeight;
    const currentScroll = window.scrollY;
    const totalDist = vh * (SCROLL_STORY.totalDistanceVh / 100);

    if (['Enter', ' ', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
      if (currentScroll < totalDist * 0.2) {
        window.scrollTo({ top: totalDist * 0.26, behavior: 'smooth' }); // Beat A -> B
      } else if (currentScroll < totalDist * 0.5) {
        window.scrollTo({ top: totalDist * 0.58, behavior: 'smooth' }); // Beat B -> C/Hold
      } else if (currentScroll < totalDist * 0.95) {
        window.scrollTo({ top: totalDist, behavior: 'smooth' }); // Beat C -> D (Tear complete)
      } else {
        window.scrollTo({ top: totalDist + vh, behavior: 'smooth' }); // To Placeholder
      }
    } else if (e.key === 'ArrowUp') {
      if (currentScroll > 0) {
        e.preventDefault();
        if (currentScroll > totalDist * 0.6) {
          window.scrollTo({ top: totalDist * 0.26, behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }
  };

  const nameLetters = heroContent.name.split('');

  return (
    <section
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="relative w-full h-[100svh] overflow-hidden bg-[#0C0907] outline-none select-none"
      aria-label="Full-screen photo cover. Use arrow keys or scroll to reveal portfolio story."
    >
      {/* 3D Vertical Strip Tear WebGL Canvas Layer (Active during Beat D) */}
      {!isReducedMotion && dimensions.width > 0 && (
        <StripTearCanvas
          scrollProgress={tearProgress}
          width={dimensions.width}
          height={dimensions.height}
        />
      )}

      {/* Centre Content Layer (Beneath Photo Halves, hidden visually during Beat D handoff) */}
      <div
        className={`absolute inset-0 w-full h-full z-0 overflow-hidden transition-opacity duration-150 ${
          isTearActive ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* Revealed Background Image (Static, lower priority load) */}
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

        {/* Static Darkening Scrim & Radial Glow for High WCAG Contrast */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(12, 9, 7, 0.65) 0%, rgba(12, 9, 7, 0.88) 100%)',
          }}
        />

        {/* Text Layer Centred on both axes */}
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-4 text-center z-10">
          {/* Scalable Text Wrapper */}
          <div
            ref={contentWrapperRef}
            className="flex flex-col items-center justify-center will-change-transform"
          >
            {/* Accessible H1 with letter spans for stagger animation */}
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
              {heroContent.roles.map((role, index) => (
                <li
                  key={role}
                  ref={(el) => {
                    rolesRef.current[index] = el;
                  }}
                  className="font-hero-role tracking-wide will-change-transform"
                >
                  {role}
                </li>
              ))}
            </ul>
          </div>
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

      {/* Right Image Half (aria-hidden duplicate) */}
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


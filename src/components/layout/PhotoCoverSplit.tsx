'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, { useEffect, useRef, useState } from 'react';

gsap.registerPlugin(ScrollTrigger);

export const PhotoCoverSplit: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftHalfRef = useRef<HTMLDivElement>(null);
  const rightHalfRef = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    try {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setIsReducedMotion(mediaQuery.matches);
    } catch {
      // Fallback
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || isReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=100%',
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
        },
      });

      // Split reveal animation: Left half moves left, right half moves right
      tl.to(
        leftHalfRef.current,
        {
          xPercent: -100,
          ease: 'power2.inOut',
        },
        0
      )
        .to(
          rightHalfRef.current,
          {
            xPercent: 100,
            ease: 'power2.inOut',
          },
          0
        )
        .fromTo(
          placeholderRef.current,
          {
            scale: 0.94,
            opacity: 0.8,
          },
          {
            scale: 1,
            opacity: 1,
            ease: 'power2.out',
          },
          0
        );
    }, containerRef);

    return () => ctx.revert();
  }, [isReducedMotion]);

  // Keyboard navigation to trigger split reveal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (['Enter', ' ', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="relative w-full h-[100svh] overflow-hidden bg-[#0C0907] outline-none select-none"
      aria-label="Full-screen photo cover. Use arrow down, space, or scroll to open portfolio."
    >
      {/* Page 1 Placeholder (Beneath Split) */}
      <div
        ref={placeholderRef}
        className="absolute inset-0 w-full h-full bg-[#0C0907] flex items-center justify-center z-0"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(224, 169, 59, 0.12) 0%, rgba(12, 9, 7, 1) 70%)',
        }}
      >
        {/* Text-free placeholder as specified for Phase 1 */}
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
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
        <div className="w-[1px] h-10 bg-gradient-to-b from-[#E0A93B] to-transparent animate-pulse" />
      </div>
    </section>
  );
};

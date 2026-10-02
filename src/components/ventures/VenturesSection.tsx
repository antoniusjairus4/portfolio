'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, { useEffect, useRef, useState } from 'react';
import { venturesContent } from '@/content/ventures';
import { VENTURE_THEMES } from '@/content/ventureThemes';
import { PalindromeDemo } from './demos/PalindromeDemo';
import { KaiForgeDemo } from './demos/KaiForgeDemo';
import { NeuroShieldDemo } from './demos/NeuroShieldDemo';
import { VentureMotif } from './VentureMotif';
import { VentureChipNav } from './VentureChipNav';
import { useLenis } from '@/motion/lenis/LenisProvider';

gsap.registerPlugin(ScrollTrigger);

export const CHAPTER_PIN_VH = 300; // 3 viewport heights per chapter pin

export const VenturesSection: React.FC = () => {
  const { lenis } = useLenis();
  const rootRef = useRef<HTMLDivElement>(null);
  const clipLayerRef = useRef<HTMLDivElement>(null);
  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  const [activeChipKey, setActiveChipKey] = useState<string | null>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    try {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setIsReducedMotion(mq.matches);
    } catch {}
  }, []);

  // Set up GSAP ScrollTriggers for index entrance & pinned story chapters
  useEffect(() => {
    if (!rootRef.current || isReducedMotion) return;

    const ctx = gsap.context(() => {
      // 1. Root Visibility & Active Chip Tracking
      ScrollTrigger.create({
        trigger: rootRef.current,
        start: 'top 80%',
        end: 'bottom 20%',
        onToggle: (self) => {
          if (!self.isActive) {
            setActiveChipKey(null);
            setActiveTheme(null);
          }
        },
      });

      // 2. Index Entrance animation (starts after hero physics collapse)
      const indexNames = rootRef.current.querySelectorAll('.venture-index-name');
      gsap.fromTo(
        indexNames,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.0,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top 50%',
          },
        }
      );

      // 3. Pinned Story Chapters setup
      venturesContent.forEach((v) => {
        const chapterEl = rootRef.current?.querySelector(`#chapter-${v.slug}`);
        if (!chapterEl) return;

        ScrollTrigger.create({
          trigger: chapterEl,
          start: 'top top',
          end: `+=${CHAPTER_PIN_VH}%`,
          pin: true,
          scrub: 0.5,
          onEnter: () => setActiveChipKey(v.slug),
          onEnterBack: () => setActiveChipKey(v.slug),
          onLeave: () => {
            if (activeChipKey === v.slug) setActiveChipKey(null);
          },
          onLeaveBack: () => {
            if (activeChipKey === v.slug) setActiveChipKey(null);
          },
        });
      });
    }, rootRef);

    return () => ctx.revert();
  }, [isReducedMotion, activeChipKey]);

  // Hover theme flood handler for Index names
  const handleIndexHover = (e: React.MouseEvent<HTMLAnchorElement>, themeKey: string) => {
    if (isReducedMotion || !clipLayerRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setActiveTheme(themeKey);

    gsap.fromTo(
      clipLayerRef.current,
      { clipPath: `circle(0px at ${x}px ${y}px)` },
      { clipPath: 'circle(150vmax at 50% 50%)', duration: 0.6, ease: 'power2.out' }
    );
  };

  const handleIndexLeave = () => {
    setActiveTheme(null);
  };

  const scrollToChapter = (slug: string) => {
    const el = document.getElementById(`chapter-${slug}`);
    if (el) {
      if (lenis) {
        lenis.scrollTo(el, { duration: 1.5 });
      } else {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div
      ref={rootRef}
      id="page-1-placeholder"
      data-venture={activeTheme || undefined}
      className="relative w-full bg-[#0C0907] transition-colors duration-500 text-[#F2E9D8] select-none overflow-hidden"
      style={{
        background: activeTheme
          ? undefined
          : 'radial-gradient(circle at 50% 50%, rgba(224, 169, 59, 0.08) 0%, rgba(12, 9, 7, 1) 75%)',
      }}
    >
      {/* Dynamic Hover Flood Layer */}
      <div
        ref={clipLayerRef}
        className="pointer-events-none fixed inset-0 z-0 transition-colors duration-500"
        style={{
          backgroundColor: activeTheme ? VENTURE_THEMES[activeTheme as keyof typeof VENTURE_THEMES]?.bg : 'transparent',
        }}
      />

      {/* SECTION 1: THE INDEX (100svh) */}
      <section className="relative z-10 w-full min-h-[100svh] flex flex-col justify-center px-6 md:px-16 py-12">
        <div className="max-w-7xl mx-auto w-full space-y-6 md:space-y-10">
          <p className="text-xs uppercase tracking-[0.25em] font-mono text-[#E0A93B] opacity-80">
            SELECTED VENTURES & PRODUCTS
          </p>

          <div className="space-y-4 md:space-y-6">
            {venturesContent.map((v) => {
              const itemTheme = VENTURE_THEMES[v.themeKey];
              const isHovered = activeTheme === v.themeKey;

              return (
                <div key={v.slug} className="venture-index-name group flex flex-col md:flex-row md:items-baseline justify-between gap-2 border-b border-white/10 pb-4 md:pb-6">
                  <a
                    href={`#chapter-${v.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToChapter(v.slug);
                    }}
                    onMouseEnter={(e) => handleIndexHover(e, v.themeKey)}
                    onMouseLeave={handleIndexLeave}
                    className="font-display font-bold tracking-tight text-[clamp(2.5rem,8vw,7.5rem)] leading-none transition-all duration-300 focus-visible:outline-none"
                    style={{
                      color: isHovered ? itemTheme.accent : '#F2E9D8',
                      opacity: activeTheme && !isHovered ? 0.35 : 1,
                    }}
                  >
                    {v.name}
                  </a>

                  <span className="text-xs md:text-sm font-mono tracking-wider opacity-70 group-hover:opacity-100 transition-opacity">
                    {v.statusLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 2: THREE CHAPTERS */}
      {venturesContent.map((v) => {
        const theme = VENTURE_THEMES[v.themeKey];

        return (
          <React.Fragment key={v.slug}>
            {/* Pinned Chapter Story */}
            <section
              id={`chapter-${v.slug}`}
              data-venture={v.themeKey}
              className="relative w-full min-h-[100svh] flex flex-col justify-center items-center px-6 md:px-16 py-16 transition-colors duration-500"
              style={{
                backgroundColor: theme.bg,
                color: theme.text,
                fontFamily: theme.fontFamily,
              }}
            >
              <div className="max-w-4xl mx-auto w-full text-center space-y-8">
                {/* Beat 1 & 2: Name & Status */}
                <span
                  className="inline-block text-xs font-mono uppercase tracking-widest px-3.5 py-1 rounded-full border"
                  style={{ borderColor: `${theme.text}30`, color: theme.muted }}
                >
                  {v.statusLabel}
                </span>

                <h2 className="text-[clamp(3rem,10vw,8rem)] font-bold tracking-tight leading-none" style={{ color: theme.text }}>
                  {v.chapterName || v.name}
                </h2>

                <p className="text-xl md:text-3xl font-medium max-w-2xl mx-auto leading-relaxed" style={{ color: theme.muted }}>
                  {v.tagline}
                </p>

                {/* SVG Code-drawn Motif */}
                <div className="py-4 flex justify-center">
                  <VentureMotif venture={v} />
                </div>

                {/* Visit Live Link */}
                <div>
                  <a
                    href={v.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-sm rounded-full transition-all hover:scale-105 focus-visible:outline-none"
                    style={{
                      backgroundColor: theme.accent,
                      color: theme.onAccent,
                      borderRadius: theme.borderRadius,
                    }}
                  >
                    Visit Live Site ↗
                  </a>
                </div>
              </div>
            </section>

            {/* Normal-Scroll Demo Panel */}
            <section
              id={`demo-${v.slug}`}
              data-venture={v.themeKey}
              className="w-full py-20 px-6 md:px-16 transition-colors duration-500"
              style={{
                backgroundColor: theme.bg,
                color: theme.text,
              }}
            >
              {v.demo === 'ledger-tamper' && <PalindromeDemo venture={v} />}
              {v.demo === 'shot-sandbox' && <KaiForgeDemo venture={v} />}
              {v.demo === 'slice-scrubber' && <NeuroShieldDemo venture={v} />}
            </section>
          </React.Fragment>
        );
      })}

      {/* SECTION 4: HANDOFF TO NEXT SECTION PLACEHOLDER */}
      <section id="next-section-placeholder" className="w-full h-[50svh] bg-[#0C0907] border-t border-white/5" aria-hidden="true" />

      {/* Fixed Chip Navigation */}
      <VentureChipNav activeKey={activeChipKey} onChipClick={scrollToChapter} />
    </div>
  );
};

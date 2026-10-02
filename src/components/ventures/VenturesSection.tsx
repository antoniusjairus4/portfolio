'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, { useEffect, useRef, useState } from 'react';
import { venturesContent } from '@/content/ventures';
import { VENTURE_THEMES } from '@/content/ventureThemes';

gsap.registerPlugin(ScrollTrigger);

export const VenturesSection: React.FC = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const clipLayerRef = useRef<HTMLDivElement>(null);
  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    try {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setIsReducedMotion(mq.matches);
    } catch {}
  }, []);

  // Set up GSAP ScrollTriggers for index entrance animation
  useEffect(() => {
    if (!rootRef.current || isReducedMotion) return;

    const ctx = gsap.context(() => {
      const indexNames = rootRef.current?.querySelectorAll('.venture-index-name');
      if (indexNames) {
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
      }
    }, rootRef);

    return () => ctx.revert();
  }, [isReducedMotion]);

  // Hover theme flood & screenshot reveal handler
  const handleIndexHover = (e: React.MouseEvent<HTMLAnchorElement>, themeKey: string, slug: string) => {
    if (isReducedMotion || !clipLayerRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setActiveTheme(themeKey);
    setActiveSlug(slug);

    gsap.fromTo(
      clipLayerRef.current,
      { clipPath: `circle(0px at ${x}px ${y}px)` },
      { clipPath: 'circle(150vmax at 50% 50%)', duration: 0.6, ease: 'power2.out' }
    );
  };

  const handleIndexLeave = () => {
    setActiveTheme(null);
    setActiveSlug(null);
  };

  return (
    <div
      ref={rootRef}
      id="page-1-placeholder"
      data-venture={activeTheme || undefined}
      className="relative w-full min-h-[100svh] bg-[#0C0907] transition-colors duration-500 text-[#F2E9D8] select-none overflow-hidden flex flex-col justify-center px-6 md:px-16 py-12"
      style={{
        background: activeTheme
          ? undefined
          : 'radial-gradient(circle at 50% 50%, rgba(224, 169, 59, 0.08) 0%, rgba(12, 9, 7, 1) 75%)',
      }}
    >
      {/* Dynamic Hover Flood Background Layer */}
      <div
        ref={clipLayerRef}
        className="pointer-events-none fixed inset-0 z-0 transition-colors duration-500"
        style={{
          backgroundColor: activeTheme
            ? VENTURE_THEMES[activeTheme as keyof typeof VENTURE_THEMES]?.bg
            : 'transparent',
        }}
      />

      {/* Main Single-Screen Index Container */}
      <div className="relative z-10 max-w-7xl mx-auto w-full space-y-6 md:space-y-10">
        <p className="text-xs uppercase tracking-[0.25em] font-mono text-[#E0A93B] opacity-80">
          SELECTED VENTURES & PRODUCTS
        </p>

        <div className="space-y-4 md:space-y-6">
          {venturesContent.map((v) => {
            const itemTheme = VENTURE_THEMES[v.themeKey];
            const isHovered = activeTheme === v.themeKey;

            return (
              <div
                key={v.slug}
                className="venture-index-name group flex flex-col md:flex-row md:items-baseline justify-between gap-4 border-b border-white/10 pb-4 md:pb-6"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <a
                    href={v.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={(e) => handleIndexHover(e, v.themeKey, v.slug)}
                    onMouseLeave={handleIndexLeave}
                    className="font-display font-bold tracking-tight text-[clamp(2.5rem,8vw,7.5rem)] leading-none transition-all duration-300 focus-visible:outline-none flex items-center gap-3"
                    style={{
                      color: isHovered ? itemTheme.accent : '#F2E9D8',
                      opacity: activeTheme && !isHovered ? 0.35 : 1,
                    }}
                  >
                    <span>{v.name}</span>
                    <span className="text-2xl md:text-4xl opacity-70 group-hover:translate-x-2 transition-transform">
                      ↗
                    </span>
                  </a>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className="text-xs md:text-sm font-mono tracking-wider transition-opacity"
                    style={{
                      color: isHovered ? itemTheme.text : '#F2E9D8',
                      opacity: isHovered ? 1 : 0.7,
                    }}
                  >
                    {v.statusLabel}
                  </span>

                  <a
                    href={v.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold px-4 py-2 rounded-full transition-all border focus-visible:outline-none"
                    style={{
                      backgroundColor: isHovered ? itemTheme.accent : 'transparent',
                      color: isHovered ? itemTheme.onAccent : itemTheme.accent,
                      borderColor: itemTheme.accent,
                      borderRadius: itemTheme.borderRadius,
                    }}
                  >
                    Visit Live
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Screenshot Preview Overlay on Hover */}
      {activeSlug && (
        <div className="pointer-events-none fixed right-12 top-1/2 -translate-y-1/2 z-20 w-80 md:w-96 rounded-2xl overflow-hidden shadow-2xl border border-black/20 transition-all duration-300">
          <img
            src={`/images/ventures/${activeSlug}/preview.png`}
            alt={`${activeSlug} preview`}
            className="w-full h-auto object-cover"
            onError={(e) => {
              // Hide fallback gracefully if image not yet uploaded
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
};

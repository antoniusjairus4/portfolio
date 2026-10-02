'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, { useEffect, useRef, useState } from 'react';
import { venturesContent } from '@/content/ventures';
import { VENTURE_THEMES } from '@/content/ventureThemes';

gsap.registerPlugin(ScrollTrigger);

const PALINDROME_IMAGES = [
  '/images/ventures/palindrome/Screenshot From 2026-10-02 14-18-23.png',
  '/images/ventures/palindrome/Screenshot From 2026-10-02 14-19-00.png',
  '/images/ventures/palindrome/Screenshot From 2026-10-02 14-19-25.png',
  '/images/ventures/palindrome/Screenshot From 2026-10-02 14-19-41.png',
];

const KAIFORGE_IMAGES = [
  '/images/ventures/kaiforge/Screenshot From 2026-10-02 16-25-07.png',
  '/images/ventures/kaiforge/Screenshot From 2026-10-02 16-25-22.png',
  '/images/ventures/kaiforge/Screenshot From 2026-10-02 16-25-38.png',
  '/images/ventures/kaiforge/Screenshot From 2026-10-02 16-26-45.png',
];

const NEUROSHIELD_IMAGES = [
  '/images/ventures/neuroshield/Screenshot From 2026-10-02 16-40-26.png',
  '/images/ventures/neuroshield/Screenshot From 2026-10-02 16-40-32.png',
  '/images/ventures/neuroshield/Screenshot From 2026-10-02 16-40-40.png',
  '/images/ventures/neuroshield/Screenshot From 2026-10-02 16-40-47.png',
];

export const VenturesSection: React.FC = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const clipLayerRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);

  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // GSAP quickTo setters for ultra-smooth 60fps cursor parallax
  const xQuickRefs = useRef<(Function | null)[]>([]);
  const yQuickRefs = useRef<(Function | null)[]>([]);

  useEffect(() => {
    try {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setIsReducedMotion(mq.matches);
    } catch {}
  }, []);

  // Entrance animation for list items
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

  // Setup Explosive Kinetic Parallax Explosion on Palindrome / KaiForge / NeuroShield Hover
  useEffect(() => {
    if (!activeSlug || !stackRef.current) return;

    const cards = stackRef.current.querySelectorAll('.kinetic-card');
    xQuickRefs.current = [];
    yQuickRefs.current = [];

    // Explosive 3D scatter destinations safely bounded inside viewport
    const explosiveOffsets = [
      { x: 180, y: -220, r: -8, scale: 0.82 },
      { x: 260, y: 30, r: 10, scale: 0.78 },
      { x: 60, y: 220, r: -6, scale: 0.85 },
      { x: -160, y: -240, r: 8, scale: 0.75 },
    ];

    // 1. Initial State: cards stacked directly one behind another at center origin
    gsap.set(cards, {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 0.4,
      opacity: 0,
    });

    // 2. Explosive "Babb-BOOM" Scatter Timeline
    cards.forEach((card, idx) => {
      const target = explosiveOffsets[idx % 4];

      gsap.to(card, {
        x: target.x,
        y: target.y,
        rotation: target.r,
        scale: target.scale,
        opacity: 1,
        duration: 0.8,
        delay: idx * 0.05,
        ease: 'back.out(1.8)',
      });

      // 3. Continuous floating bobbing motion after explosion
      gsap.to(card, {
        y: `+=${idx % 2 === 0 ? 12 : -12}`,
        rotation: `+=${idx % 2 === 0 ? 2 : -2}`,
        duration: 2.2 + idx * 0.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 0.8 + idx * 0.1,
      });

      // QuickTo interpolators for mouse drift
      const inertia = 0.12 + idx * 0.08;
      xQuickRefs.current.push(gsap.quickTo(card, 'x', { duration: inertia, ease: 'power2.out' }));
      yQuickRefs.current.push(gsap.quickTo(card, 'y', { duration: inertia, ease: 'power2.out' }));
    });

    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const deltaX = (e.clientX - centerX) / centerX;
      const deltaY = (e.clientY - centerY) / centerY;

      cards.forEach((_, idx) => {
        const base = explosiveOffsets[idx % 4];
        const pushFactor = 35 + idx * 20;

        if (xQuickRefs.current[idx]) xQuickRefs.current[idx]!(base.x + deltaX * pushFactor);
        if (yQuickRefs.current[idx]) yQuickRefs.current[idx]!(base.y + deltaY * pushFactor);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [activeSlug]);

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
      className="relative w-full min-h-[100svh] bg-black transition-colors duration-500 text-[#F2E9D8] select-none overflow-hidden flex flex-col justify-center px-6 md:px-16 py-12"
      style={{
        background: activeTheme
          ? undefined
          : 'radial-gradient(circle at 50% 50%, rgba(224, 169, 59, 0.05) 0%, rgba(0, 0, 0, 1) 70%)',
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

      {/* Kinetic Parallax Stack Container on Palindrome Hover */}
      {activeSlug === 'palindrome' && (
        <div
          ref={stackRef}
          className="pointer-events-none fixed right-[20%] top-1/2 -translate-y-1/2 z-20 w-80 md:w-[28rem] h-64 md:h-80"
        >
          {PALINDROME_IMAGES.map((src, idx) => (
            <div
              key={`${src}-${idx}`}
              className="kinetic-card absolute top-0 left-0 w-full rounded-2xl overflow-hidden shadow-2xl border border-black/10 transition-transform will-change-transform bg-white p-1"
            >
              <img
                src={src}
                alt={`Palindrome Screenshot ${idx + 1}`}
                className="w-full h-auto object-cover rounded-xl"
              />
            </div>
          ))}
        </div>
      )}

      {/* Kinetic Parallax Stack Container on KaiForge Hover */}
      {activeSlug === 'kaiforge' && (
        <div
          ref={stackRef}
          className="pointer-events-none fixed right-[20%] top-1/2 -translate-y-1/2 z-20 w-80 md:w-[28rem] h-64 md:h-80"
        >
          {KAIFORGE_IMAGES.map((src, idx) => (
            <div
              key={`${src}-${idx}`}
              className="kinetic-card absolute top-0 left-0 w-full rounded-2xl overflow-hidden shadow-2xl border border-black/10 transition-transform will-change-transform bg-white p-1"
            >
              <img
                src={src}
                alt={`KaiForge Screenshot ${idx + 1}`}
                className="w-full h-auto object-cover rounded-xl"
              />
            </div>
          ))}
        </div>
      )}

      {/* Kinetic Parallax Stack Container on NeuroShield Hover */}
      {activeSlug === 'neuroshield' && (
        <div
          ref={stackRef}
          className="pointer-events-none fixed right-[20%] top-1/2 -translate-y-1/2 z-20 w-80 md:w-[28rem] h-64 md:h-80"
        >
          {NEUROSHIELD_IMAGES.map((src, idx) => (
            <div
              key={`${src}-${idx}`}
              className="kinetic-card absolute top-0 left-0 w-full rounded-2xl overflow-hidden shadow-2xl border border-black/10 transition-transform will-change-transform bg-white p-1"
            >
              <img
                src={src}
                alt={`NeuroShield Screenshot ${idx + 1}`}
                className="w-full h-auto object-cover rounded-xl"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import LiquidEther from '@/components/backgrounds/LiquidEther';
import CursorGrid from '@/components/backgrounds/CursorGrid';
import { achievementsContent, AchievementEntry } from '@/content/achievements';
import { useLenis } from '@/motion/lenis/LenisProvider';

gsap.registerPlugin(ScrollTrigger);

interface Point {
  x: number;
  y: number;
}

interface LineCoords {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function parseStatValue(val: string): { num: number; prefix: string; suffix: string } | null {
  const match = val.match(/^([^\d]*)([\d,.]+)(.*)$/);
  if (!match) return null;
  const num = parseFloat(match[2].replace(/,/g, ''));
  if (isNaN(num)) return null;
  return {
    prefix: match[1],
    num,
    suffix: match[3],
  };
}

export const AchievementsSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const homeWordsRef = useRef<(HTMLDivElement | null)[]>([]);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const titleLettersRef = useRef<Map<string, (HTMLSpanElement | null)[]>>(new Map());
  const photoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const statValRefs = useRef<Map<string, HTMLParagraphElement | null>>(new Map());

  const { lenis } = useLenis();

  const [activeSectionIdx, setActiveSectionIdx] = useState<number>(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Home constellation & glow state
  const [lines, setLines] = useState<LineCoords[]>([]);
  const [centerPoint, setCenterPoint] = useState<Point>({ x: 0, y: 0 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [glowPos, setGlowPos] = useState<{ x: number; y: number } | null>(null);
  const [glowActive, setGlowActive] = useState(false);
  const [showHint, setShowHint] = useState(true);

  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    try {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setIsReducedMotion(mq.matches);
      setIsMobile(window.innerWidth < 768);
    } catch {}
  }, []);

  // Compute SVG constellation endpoints for home layout
  const updateConstellation = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();

    const centerIdx = achievementsContent.findIndex((item) => item.id === 'table-tennis');
    const centerEl = homeWordsRef.current[centerIdx];
    if (!centerEl) return;

    const cRect = centerEl.getBoundingClientRect();
    const cx = cRect.left + cRect.width / 2 - containerRect.left;
    const cy = cRect.top + cRect.height / 2 - containerRect.top;
    setCenterPoint({ x: cx, y: cy });

    const newLines: LineCoords[] = [];

    achievementsContent.forEach((item, idx) => {
      if (item.id === 'table-tennis') return;
      const el = homeWordsRef.current[idx];
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const nodeX = rect.left + rect.width / 2 - containerRect.left;
      const nodeY = rect.top + rect.height / 2 - containerRect.top;

      const dx = cx - nodeX;
      const dy = cy - nodeY;
      const dist = Math.hypot(dx, dy);
      if (dist === 0) return;

      const shortenAmount = Math.min(90, dist * 0.35);
      const targetX = cx - (dx / dist) * shortenAmount;
      const targetY = cy - (dy / dist) * shortenAmount;

      newLines.push({
        id: item.id,
        x1: nodeX,
        y1: nodeY,
        x2: targetX,
        y2: targetY,
      });
    });

    setLines(newLines);
  }, []);

  useEffect(() => {
    updateConstellation();
    window.addEventListener('resize', updateConstellation);
    return () => window.removeEventListener('resize', updateConstellation);
  }, [updateConstellation]);

  // Master GSAP ScrollTrigger Sequence for 5 Pinned Story Sections
  useEffect(() => {
    if (!containerRef.current) return;

    let ctx: gsap.Context | null = null;

    const setupAnimations = () => {
      ctx = gsap.context(() => {
        achievementsContent.forEach((discipline, secIdx) => {
          const secEl = sectionRefs.current[secIdx];
          if (!secEl) return;

          const letterEls = (titleLettersRef.current.get(discipline.id) || []).filter(Boolean);
          const indexEl = secEl.querySelector('.sec-index-badge');
          const spotEl = secEl.querySelector('.sec-spotlight-disc');
          const titleContainer = secEl.querySelector('.sec-title-container') as HTMLElement;
          const statBox1 = secEl.querySelector('.sec-stat-0');
          const statBox2 = secEl.querySelector('.sec-stat-1');
          const statBox3 = secEl.querySelector('.sec-stat-2');
          const photoBox = photoRefs.current[secIdx];
          const captionEl = secEl.querySelector('.sec-caption');

          // Initial hidden state
          gsap.set(letterEls, { yPercent: 60, opacity: 0 });
          if (indexEl) gsap.set(indexEl, { opacity: 0, y: 20 });
          if (spotEl) gsap.set(spotEl, { opacity: 0, scale: 0.6 });
          if (statBox1) gsap.set(statBox1, { opacity: 0, y: 40, filter: 'blur(8px)' });
          if (statBox2) gsap.set(statBox2, { opacity: 0, y: 40, filter: 'blur(8px)' });
          if (statBox3) gsap.set(statBox3, { opacity: 0, y: 40, filter: 'blur(8px)' });
          if (photoBox) gsap.set(photoBox, { opacity: 0, xPercent: 20, scale: 0.96 });
          if (captionEl) gsap.set(captionEl, { opacity: 0, y: 20 });

          const pinDistance = isMobile ? '+=350%' : '+=450%';

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: secEl,
              start: 'top top',
              end: pinDistance,
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              onToggle: (self) => {
                if (self.isActive) setActiveSectionIdx(secIdx + 1);
              },
            },
          });

          // Beat A: Title entrance in center (8% to 22%)
          tl.to(
            letterEls,
            {
              yPercent: 0,
              opacity: 1,
              color: '#FFFFFF',
              stagger: 0.015,
              ease: 'power2.out',
              duration: 0.14,
            },
            0.08
          );

          if (indexEl) {
            tl.to(indexEl, { opacity: 1, y: 0, duration: 0.1 }, 0.12);
          }

          // Beat B: Read stage hold (22% to 32%)
          tl.to({}, { duration: 0.1 }, 0.22);

          // Beat C: Dock to top-left (32% to 48%)
          if (titleContainer) {
            const dockScale = isMobile ? 0.35 : 0.3;
            const targetX = isMobile ? -30 : -140;
            const targetY = isMobile ? -180 : -210;

            tl.to(
              titleContainer,
              {
                x: targetX,
                y: targetY,
                scale: dockScale,
                ease: 'power2.inOut',
                duration: 0.16,
              },
              0.32
            );

            tl.to(
              letterEls,
              {
                color: '#FFF4E6',
                duration: 0.16,
              },
              0.32
            );
          }

          if (spotEl) {
            tl.to(spotEl, { opacity: 1, scale: 1, duration: 0.14 }, 0.35);
          }

          // Beat D: Content reveal one by one (48% to 85%)
          if (statBox1) {
            tl.to(statBox1, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.07 }, 0.48);
          }
          if (statBox2) {
            tl.to(statBox2, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.07 }, 0.55);
          }
          if (statBox3) {
            tl.to(statBox3, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.07 }, 0.62);
          }
          if (photoBox) {
            tl.to(
              photoBox,
              { opacity: 1, xPercent: 0, scale: 1, ease: 'power2.out', duration: 0.1 },
              0.69
            );
            // Parallax scale inside photo
            const imgEl = photoBox.querySelector('img');
            if (imgEl) {
              tl.fromTo(imgEl, { scale: 1.08 }, { scale: 1, duration: 0.16, ease: 'none' }, 0.69);
            }
          }
          if (captionEl) {
            tl.to(captionEl, { opacity: 1, y: 0, duration: 0.06 }, 0.79);
          }

          // Beat E: Hold (85% to 92%)
          tl.to({}, { duration: 0.07 }, 0.85);

          // Beat F: Exit to next discipline (92% to 100%)
          const exitElements = [statBox1, statBox2, statBox3, photoBox, captionEl].filter(Boolean);
          if (exitElements.length > 0) {
            tl.to(exitElements, { y: -60, opacity: 0, stagger: 0.01, duration: 0.08 }, 0.92);
          }
          tl.to(
            letterEls,
            { yPercent: -60, opacity: 0, stagger: 0.01, duration: 0.08 },
            0.92
          );
        });
      }, containerRef);
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        setupAnimations();
        ScrollTrigger.refresh();
      });
    } else {
      setupAnimations();
      ScrollTrigger.refresh();
    }

    return () => {
      if (ctx) ctx.revert();
    };
  }, [isMobile]);

  // Smooth scroll to section when home word is clicked
  const handleWordClick = (idx: number) => {
    const secEl = sectionRefs.current[idx];
    if (secEl && lenis) {
      lenis.scrollTo(secEl, { offset: 0, duration: 1.5 });
    }
  };

  const handleMouseEnter = (item: AchievementEntry, idx: number) => {
    setHoveredId(item.id);
    setShowHint(false);

    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);

    const el = homeWordsRef.current[idx];
    if (el && containerRef.current) {
      const cRect = containerRef.current.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      setGlowPos({
        x: rect.left + rect.width / 2 - cRect.left,
        y: rect.top + rect.height / 2 - cRect.top,
      });
      setGlowActive(true);
    }
  };

  const handleMouseLeave = () => {
    setHoveredId(null);
    setGlowActive(false);

    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setShowHint(true);
    }, 4000);
  };

  const activeIndexDisplay = String(activeSectionIdx > 0 ? activeSectionIdx : 1).padStart(2, '0');

  return (
    <div ref={containerRef} className="relative w-full bg-[#0C0907] text-[#F2E9D8] select-none font-sans">
      {/* PERSISTENT FULL-VIEWPORT WEBGL FLUID & CURSOR GRID BACKDROP */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Film Grain & Edge Vignette Overlay */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none opacity-45 mix-blend-overlay"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, transparent 25%, rgba(10, 9, 8, 0.65) 70%, rgba(10, 9, 8, 0.95) 100%)',
          }}
        />

        {/* Local Hover Glow Bloom Layer */}
        <div
          className={`absolute pointer-events-none z-[1] rounded-full filter blur-3xl transition-all duration-500 ease-out mix-blend-screen ${
            glowActive ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
          style={{
            left: glowPos ? `${glowPos.x}px` : '50%',
            top: glowPos ? `${glowPos.y}px` : '50%',
            width: '420px',
            height: '420px',
            transform: 'translate(-50%, -50%)',
            background:
              hoveredId === 'table-tennis'
                ? 'radial-gradient(circle, rgba(217, 155, 38, 0.15) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(217, 155, 38, 0.35) 0%, transparent 70%)',
          }}
        />

        {/* Interactive Cursor Grid Background */}
        <div className="absolute inset-0 z-[1] opacity-100 pointer-events-none">
          <CursorGrid
            cellSize={70}
            color="#E0A93B"
            radius={200}
            falloff="smooth"
            holdTime={400}
            fadeDuration={800}
            lineWidth={1.2}
            maxOpacity={0.8}
            fillOpacity={0.2}
            gridOpacity={0.02}
            cellRadius={8}
            clickPulse
            pulseSpeed={600}
          />
        </div>

        <LiquidEther
          colors={['#0A0908', '#9A6318', '#F5B031', '#FFD275']}
          mouseForce={28}
          cursorSize={160}
          isViscous={true}
          viscous={45}
          iterationsViscous={40}
          iterationsPoisson={48}
          resolution={0.75}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.55}
          autoIntensity={3.5}
          takeoverDuration={0.3}
          autoResumeDelay={1500}
          autoRampDuration={0.8}
          backgroundColor="#0A0908"
        />
      </div>

      {/* PERSISTENT FIXED MONOSPACE HEADER & PROGRESS INDICATOR */}
      <div className="fixed top-6 left-6 right-6 md:top-10 md:left-12 md:right-12 z-40 flex items-center justify-between pointer-events-none font-mono">
        <p className="text-xs uppercase tracking-[0.18em] text-[#E0A030] opacity-85">
          CRAFT & DISCIPLINE / ACHIEVEMENTS
        </p>
        <div className="flex items-center space-x-4">
          <span className="text-xs uppercase tracking-[0.18em] text-white/40">
            {activeIndexDisplay} / 05
          </span>
        </div>
      </div>

      {/* RIGHT EDGE VERTICAL PROGRESS INDICATOR */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col space-y-3 pointer-events-none hidden md:flex">
        {achievementsContent.map((disc, idx) => (
          <div
            key={`progress-dot-${disc.id}`}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              activeSectionIdx === idx + 1
                ? 'bg-[#E0A030] scale-125 ring-2 ring-[#E0A030]/40'
                : 'bg-white/20'
            }`}
          />
        ))}
      </div>

      {/* SECTION 0: HOME SELECTION SCREEN */}
      <section className="relative w-full h-screen min-h-[100vh] flex flex-col justify-between overflow-hidden z-10">
        {/* FAINT CONSTELLATION OVERLAY LAYER */}
        <svg className="absolute inset-0 z-[5] w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="constellation-pulse-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D99B26" stopOpacity="0" />
              <stop offset="50%" stopColor="#FFF4E6" stopOpacity="1" />
              <stop offset="100%" stopColor="#D99B26" stopOpacity="0" />
            </linearGradient>
          </defs>

          {centerPoint.x > 0 && (
            <circle
              cx={centerPoint.x}
              cy={centerPoint.y}
              r="38%"
              fill="none"
              stroke="#D99B26"
              strokeWidth="1"
              strokeDasharray="4 8"
              className="opacity-[0.07]"
            />
          )}

          {lines.map((line) => {
            const isHovered = hoveredId === line.id;
            const isOtherHovered = hoveredId && hoveredId !== line.id;

            let strokeOpacity = 0.14;
            if (isHovered) strokeOpacity = 0.6;
            else if (isOtherHovered) strokeOpacity = 0.08;

            return (
              <g key={`constellation-group-${line.id}`}>
                <line
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke="#D99B26"
                  strokeWidth="1"
                  strokeOpacity={strokeOpacity}
                  className="transition-all duration-300 ease-out"
                />

                <circle
                  cx={line.x1}
                  cy={line.y1}
                  r={isHovered ? '4' : '2.5'}
                  fill="#D99B26"
                  fillOpacity={isHovered ? 0.9 : 0.4}
                  className="transition-all duration-300 ease-out"
                />

                {isHovered && (
                  <circle r="3" fill="#FFF4E6" className="animate-pulse">
                    <animateMotion
                      path={`M ${line.x1} ${line.y1} L ${line.x2} ${line.y2}`}
                      dur="0.8s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
              </g>
            );
          })}
        </svg>

        {/* 5 Spatial Discipline Words */}
        <div className="relative z-10 w-full h-full pointer-events-none">
          {achievementsContent.map((item, idx) => {
            const isCenter = item.id === 'table-tennis';

            return (
              <div
                key={item.id}
                ref={(el) => {
                  homeWordsRef.current[idx] = el;
                }}
                onClick={() => handleWordClick(idx)}
                onMouseEnter={() => handleMouseEnter(item, idx)}
                onMouseLeave={handleMouseLeave}
                onFocus={() => handleMouseEnter(item, idx)}
                onBlur={handleMouseLeave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleWordClick(idx);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Scroll to ${item.title}`}
                className="absolute pointer-events-auto cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E0A030] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C0907] rounded-xl p-2"
                style={{
                  top: item.position.top,
                  left: item.position.left,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div className="flex flex-col items-center text-center p-2">
                  <h3
                    className={`leading-none whitespace-nowrap font-medium tracking-[-0.02em] transition-colors duration-200 ${
                      isCenter
                        ? 'text-[clamp(56px,7vw,110px)] text-[#FFF4E6]'
                        : 'text-[clamp(28px,3vw,48px)] text-[#FFF4E6]'
                    } group-hover:text-[#E0A030]`}
                  >
                    {item.title}
                  </h3>
                  <span className="text-[11px] font-mono text-white/40 uppercase tracking-[0.18em] mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {item.descriptor}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* HINT LINE */}
        <div
          className={`absolute bottom-8 left-0 right-0 z-10 flex items-center justify-center space-x-2 pointer-events-none font-mono text-[11px] uppercase tracking-[0.3em] text-[#8A7A62] transition-opacity duration-300 ${
            showHint ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span className="animate-pulse">SCROLL OR SELECT A DISCIPLINE</span>
          <svg
            className="w-3.5 h-3.5 text-[#E0A030] animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* 5 PINNED STORY SECTIONS (01 Table Tennis ➔ 05 Music) */}
      {achievementsContent.map((item, idx) => {
        const formatIndex = String(idx + 1).padStart(2, '0');
        const titleChars = item.title.split('');

        return (
          <section
            key={`discipline-sec-${item.id}`}
            ref={(el) => {
              sectionRefs.current[idx] = el;
            }}
            className="relative w-full h-screen min-h-[100vh] flex items-center justify-center overflow-hidden z-20"
          >
            {/* SPOTLIGHT TILE CLUSTER BACKDROP */}
            <div className="sec-spotlight-disc absolute inset-0 pointer-events-none flex items-center justify-center">
              <div
                className="w-[600px] h-[600px] rounded-full filter blur-2xl opacity-15"
                style={{
                  background:
                    'radial-gradient(circle, rgba(224, 160, 48, 0.4) 0%, rgba(12, 9, 7, 0) 70%)',
                }}
              />
            </div>

            {/* MAIN CONTENT STAGE */}
            <div className="relative z-10 max-w-7xl mx-auto w-full px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
              {/* LEFT COLUMN: TITLE + DESCRIPTOR + STATS */}
              <div className="lg:col-span-7 space-y-8">
                {/* CONTAINER FOR TITLE + INDEX (Docks together) */}
                <div className="sec-title-container flex flex-col items-start origin-top-left">
                  {/* MONO INDEX BADGE & DESCRIPTOR */}
                  <div className="sec-index-badge flex items-center space-x-3 text-xs font-mono tracking-[0.18em] text-[#E0A030] uppercase mb-2">
                    <span>{formatIndex} / 05</span>
                    <span className="text-white/20">•</span>
                    <span className="text-[#8A7A62]">{item.descriptor}</span>
                  </div>

                  {/* CENTER-DOCKED DISCIPLINE TITLE WITH LETTER SPANS */}
                  <h2
                    aria-label={item.title}
                    className="text-[clamp(64px,9vw,140px)] font-bold leading-none tracking-[-0.03em] whitespace-nowrap"
                  >
                    {titleChars.map((char, cIdx) => (
                      <span
                        key={`title-char-${item.id}-${cIdx}`}
                        ref={(el) => {
                          if (!titleLettersRef.current.has(item.id)) {
                            titleLettersRef.current.set(item.id, []);
                          }
                          const arr = titleLettersRef.current.get(item.id)!;
                          arr[cIdx] = el;
                        }}
                        className="inline-block"
                      >
                        {char === ' ' ? '\u00A0' : char}
                      </span>
                    ))}
                  </h2>
                </div>

                {/* STATS GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-white/10">
                  {item.stats.map((stat, sIdx) => (
                    <div
                      key={`stat-${item.id}-${sIdx}`}
                      className={`sec-stat-${sIdx} space-y-1`}
                    >
                      <span className="sr-only">
                        {stat.value} {stat.label}
                      </span>
                      <p
                        aria-hidden="true"
                        className="text-[clamp(40px,5vw,72px)] font-bold tracking-tight text-[#FFFFFF] leading-none"
                      >
                        {stat.value || 'TBD'}
                      </p>
                      <p
                        aria-hidden="true"
                        className="text-[11px] font-mono text-[#8A7A62] uppercase tracking-[0.18em]"
                      >
                        {stat.label || 'TBD'}
                      </p>
                    </div>
                  ))}
                </div>

                {/* CAPTION LINE */}
                {item.caption && (
                  <p className="sec-caption text-xs md:text-sm font-mono text-[#8A7A62] tracking-wide border-l-2 border-[#E0A030] pl-4 py-1">
                    {item.caption}
                  </p>
                )}
              </div>

              {/* RIGHT COLUMN: PHOTO CARD */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <div
                  ref={(el) => {
                    photoRefs.current[idx] = el;
                  }}
                  className="sec-photo-card relative w-full max-w-md aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-white/5"
                >
                  {item.photoPath ? (
                    <img
                      src={item.photoPath}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-mono text-xs text-[#8A7A62] uppercase tracking-widest bg-white/5">
                      {item.title} Photo Placeholder
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
};

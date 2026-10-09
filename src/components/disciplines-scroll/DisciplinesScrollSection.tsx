'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, { useEffect, useRef, useState } from 'react';
import LiquidEther from '@/components/backgrounds/LiquidEther';
import CursorGrid from '@/components/backgrounds/CursorGrid';
import { useLenis } from '@/motion/lenis/LenisProvider';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Global Pacing Multiplier constant
const PACE = 1.0;

export interface DisciplineChapter {
  id: string;
  number: string;
  title: string;
  descriptor: string;
  stats: { value: string; label: string }[];
  imageSrc: string;
  caption: string;
  objectFit?: 'cover' | 'contain';
  objectPosition?: string;
  aspectRatio?: string;
  frameless?: boolean;
}

export const DISCIPLINE_CHAPTERS: DisciplineChapter[] = [
  {
    id: 'table-tennis',
    number: '01 / 03',
    title: 'Table Tennis',
    descriptor: '2x Tamil Nadu State Champion',
    stats: [
      { value: '2x', label: 'Tamil Nadu State Champion' },
      { value: 'Gold', label: 'National Tournament, Goa' },
      { value: 'Gold', label: 'RDS Championship' },
    ],
    imageSrc: '/images/table-tennis.jpg',
    caption: 'State Championship Finals Victory & Trophy Presentation',
  },
  {
    id: 'public-speaking',
    number: '02 / 03',
    title: 'Public Speaking',
    descriptor: 'Keynote & Oratory Speaker',
    stats: [
      { value: '15000', label: 'People addressed' },
      { value: '7+', label: 'Events organised' },
      { value: '3rd', label: 'Coimbatore Book Festival, English edition' },
    ],
    imageSrc: '/images/speaking.jpg',
    caption: 'Keynote Address on Cybersecurity & Tech Futures',
  },
  {
    id: 'karate',
    number: '03 / 03',
    title: 'Karate',
    descriptor: 'Black belt martial artist',
    stats: [
      { value: 'Black Belt', label: 'Martial Artist' },
      { value: '4x', label: 'National Champion' },
      { value: '15+', label: 'State Medals' },
    ],
    imageSrc: '/images/karate.jpg',
    caption: 'National Kumite Tournament Demonstration',
    objectFit: 'cover',
    objectPosition: 'right 30%',
    aspectRatio: 'aspect-[4/3]',
    frameless: true,
  },
];

export const DisciplinesScrollSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const chaptersRef = useRef<(HTMLDivElement | null)[]>([]);
  const lenisContext = useLenis();

  const [activeIndex, setActiveIndex] = useState(0);
  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [imgErrorMap, setImgErrorMap] = useState<Record<string, boolean>>({});

  // Parse numeric stat for count-up animation
  const parseStatValue = (val: string) => {
    const match = val.match(/^([^\d]*)([\d,.]+)(.*)$/);
    if (!match) return null;
    const num = parseFloat(match[2].replace(/,/g, ''));
    return isNaN(num) ? null : { prefix: match[1], num, suffix: match[3] };
  };

  useEffect(() => {
    try {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setIsReducedMotion(mq.matches);
    } catch { }
  }, []);

  // Preload all chapter images
  useEffect(() => {
    DISCIPLINE_CHAPTERS.forEach((ch) => {
      const img = new Image();
      img.src = ch.imageSrc;
      img.onerror = () => {
        setImgErrorMap((prev) => ({ ...prev, [ch.id]: true }));
      };
    });
  }, []);

  // Master GSAP Context & ScrollTrigger Timeline with 9 units per chapter (TOTAL_UNITS = 45)
  useEffect(() => {
    if (!sectionRef.current || !stageRef.current) return;

    const ctx = gsap.context(() => {
      const numChapters = DISCIPLINE_CHAPTERS.length;
      const isMobile = window.innerWidth < 768;
      const unitsPerChapter = (isMobile ? 6.5 : 9.0) * PACE;
      const totalUnits = numChapters * unitsPerChapter;

      // Master Pinned Timeline
      const masterTl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          id: 'disc-master-pin',
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${totalUnits * window.innerHeight}`,
          pin: stageRef.current,
          pinSpacing: true,
          scrub: 2, // Smooth inertia on wheel ticks
          anticipatePin: 1,
          refreshPriority: 0,
          onToggle: (self) => {
            setIsSectionVisible(self.isActive);
          },
          onUpdate: (self) => {
            const prog = Math.min(0.999, Math.max(0, self.progress));
            const newIdx = Math.floor(prog * numChapters);
            setActiveIndex(newIdx);
          },
        },
      });

      // Build 5 Chapter Timeline Slots mapped explicitly to units
      DISCIPLINE_CHAPTERS.forEach((ch, i) => {
        const slotUnits = unitsPerChapter;
        const slotStartUnit = i * slotUnits;

        const chapterEl = chaptersRef.current[i];
        if (!chapterEl) return;

        const titleEl = chapterEl.querySelector('.chapter-title');
        const chars = chapterEl.querySelectorAll('.title-char');
        const descEl = chapterEl.querySelector('.chapter-desc');
        const statsEls = chapterEl.querySelectorAll('.stat-item');
        const photoCardEl = chapterEl.querySelector('.photo-card');
        const innerImgEl = chapterEl.querySelector('.photo-card-img');
        const captionEl = chapterEl.querySelector('.photo-caption');
        const spotLightEl = chapterEl.querySelector('.spotlight-layer');

        // Set initial state
        gsap.set(chapterEl, { visibility: i === 0 ? 'visible' : 'hidden', opacity: i === 0 ? 1 : 0 });
        gsap.set(titleEl, { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', scale: 1, color: '#FFF4E6' });

        if (i !== 0) {
          gsap.set(chars, { opacity: 0, yPercent: 40 });
        } else {
          gsap.set(chars, { opacity: 1, yPercent: 0 });
        }

        gsap.set(descEl, { opacity: 0, y: 15 });
        gsap.set(statsEls, { opacity: 0, y: 25 });
        gsap.set(photoCardEl, { opacity: 0, xPercent: 12, scale: 0.92, filter: 'blur(12px)', clipPath: 'inset(0% 0% 0% 100%)' });
        if (innerImgEl) gsap.set(innerImgEl, { scale: 1.12 });
        gsap.set(captionEl, { opacity: 0, y: 15 });
        gsap.set(spotLightEl, { opacity: 0 });

        // Reduced Motion simplified path
        if (isReducedMotion) {
          masterTl.to(chapterEl, { visibility: 'visible', opacity: 1, duration: 0.1 }, slotStartUnit);
          masterTl.to([titleEl, descEl, statsEls, photoCardEl, captionEl], { opacity: 1, duration: 2.0 }, slotStartUnit + 1.0);
          if (i < numChapters - 1) {
            masterTl.to(chapterEl, { opacity: 0, duration: 1.0 }, slotStartUnit + slotUnits - 1.0);
          }
          return;
        }

        // --- BEAT A: Title Entrance (0.0 to 0.8 units) ---
        if (i > 0) {
          const titleEnterStart = slotStartUnit - 0.4; // Handoff overlap starting at 8.6 of previous chapter
          masterTl.to(chapterEl, { visibility: 'visible', opacity: 1, duration: 0.01 }, titleEnterStart);
          masterTl.to(
            chars,
            { opacity: 1, yPercent: 0, stagger: 0.04 * PACE, ease: 'sine.out', duration: 0.5 * PACE },
            titleEnterStart
          );
        }

        // --- BEAT B: Read Hold (0.8 to 1.6 units) ---
        // Pinned centered hold (no movement)

        // --- BEAT C: Dock to Top-Left (1.6 to 2.6 units) ---
        const dockStart = slotStartUnit + 1.6 * PACE;
        const dockDur = 1.0 * PACE;

        masterTl
          .to(
            titleEl,
            {
              top: isMobile ? '72px' : '96px',
              left: isMobile ? '24px' : '48px',
              transform: 'translate(0%, 0%)',
              scale: isMobile ? 0.32 : 0.38,
              color: '#FFF4E6',
              ease: 'power1.inOut',
              duration: dockDur,
            },
            dockStart
          )
          .to(descEl, { opacity: 1, y: 0, ease: 'sine.out', duration: 0.6 * PACE }, dockStart + 0.3 * PACE)
          .to(spotLightEl, { opacity: 1, ease: 'sine.inOut', duration: 1.0 * PACE }, dockStart);

        // --- BEAT D: Sequential Content Reveal (2.9 to 7.5 units) ---

        // Stat 1: 2.9 to 3.5 units
        const stat1Start = slotStartUnit + 2.9 * PACE;
        const stat1Dur = 0.6 * PACE;
        const s1El = statsEls[0];
        if (s1El) {
          const num1 = s1El.querySelector('.stat-number');
          const parsed1 = ch.stats[0] ? parseStatValue(ch.stats[0].value) : null;
          masterTl.to(
            s1El,
            {
              opacity: 1,
              y: 0,
              ease: 'power1.out',
              duration: stat1Dur,
              onStart: () => {
                if (parsed1 && num1) {
                  gsap.to(
                    { val: 0 },
                    {
                      val: parsed1.num,
                      duration: stat1Dur,
                      ease: 'power1.out',
                      onUpdate: function () {
                        num1.textContent = `${parsed1.prefix}${Math.floor(this.targets()[0].val)}${parsed1.suffix}`;
                      },
                    }
                  );
                }
              },
            },
            stat1Start
          );
        }

        // Stat 2: 3.7 to 4.3 units
        const stat2Start = slotStartUnit + 3.7 * PACE;
        const stat2Dur = 0.6 * PACE;
        const s2El = statsEls[1];
        if (s2El) {
          const num2 = s2El.querySelector('.stat-number');
          const parsed2 = ch.stats[1] ? parseStatValue(ch.stats[1].value) : null;
          masterTl.to(
            s2El,
            {
              opacity: 1,
              y: 0,
              ease: 'power1.out',
              duration: stat2Dur,
              onStart: () => {
                if (parsed2 && num2) {
                  gsap.to(
                    { val: 0 },
                    {
                      val: parsed2.num,
                      duration: stat2Dur,
                      ease: 'power1.out',
                      onUpdate: function () {
                        num2.textContent = `${parsed2.prefix}${Math.floor(this.targets()[0].val)}${parsed2.suffix}`;
                      },
                    }
                  );
                }
              },
            },
            stat2Start
          );
        }

        // Stat 3: 4.5 to 5.1 units
        const stat3Start = slotStartUnit + 4.5 * PACE;
        const stat3Dur = 0.6 * PACE;
        const s3El = statsEls[2];
        if (s3El) {
          const num3 = s3El.querySelector('.stat-number');
          const parsed3 = ch.stats[2] ? parseStatValue(ch.stats[2].value) : null;
          masterTl.to(
            s3El,
            {
              opacity: 1,
              y: 0,
              ease: 'power1.out',
              duration: stat3Dur,
              onStart: () => {
                if (parsed3 && num3) {
                  gsap.to(
                    { val: 0 },
                    {
                      val: parsed3.num,
                      duration: stat3Dur,
                      ease: 'power1.out',
                      onUpdate: function () {
                        num3.textContent = `${parsed3.prefix}${Math.floor(this.targets()[0].val)}${parsed3.suffix}`;
                      },
                    }
                  );
                }
              },
            },
            stat3Start
          );
        }

        // Photo Card Reveal: 5.3 to 6.9 units (1.6 units total duration)
        const photoStart = slotStartUnit + 5.3 * PACE;
        // Phase 1 (5.3 to 5.9): Clip-path reveal from right edge + opacity + blur
        masterTl.to(
          photoCardEl,
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            opacity: 1,
            filter: 'blur(0px)',
            ease: 'sine.inOut',
            duration: 0.6 * PACE,
          },
          photoStart
        );
        // Phase 2 (5.9 to 6.9): Slide, scale & inner parallax
        masterTl.to(
          photoCardEl,
          {
            xPercent: 0,
            scale: 1,
            ease: 'sine.out',
            duration: 1.0 * PACE,
          },
          photoStart + 0.6 * PACE
        );
        if (innerImgEl) {
          masterTl.to(
            innerImgEl,
            {
              scale: 1.0,
              ease: 'sine.out',
              duration: 1.0 * PACE,
            },
            photoStart + 0.6 * PACE
          );
        }

        // Caption Reveal: 7.0 to 7.5 units
        masterTl.to(
          captionEl,
          { opacity: 1, y: 0, ease: 'sine.out', duration: 0.5 * PACE },
          slotStartUnit + 7.0 * PACE
        );

        // --- BEAT E: Full Composition Hold (7.5 to 8.3 units) ---
        // Clean hold

        // --- BEAT F: Exit & Handoff (8.3 to 9.0 units) ---
        if (i < numChapters - 1) {
          const exitStart = slotStartUnit + 8.3 * PACE;
          const exitDur = 0.7 * PACE;

          masterTl
            .to(
              [titleEl, descEl, statsEls, photoCardEl, captionEl],
              { opacity: 0, y: -40, ease: 'sine.in', duration: exitDur, stagger: 0.05 },
              exitStart
            )
            .to(spotLightEl, { opacity: 0, ease: 'sine.in', duration: 0.7 * PACE }, exitStart)
            .to(chapterEl, { visibility: 'hidden', duration: 0.01 }, exitStart + exitDur);
        } else {
          // Last chapter holds composition before pin releases
          masterTl.to(chapterEl, { opacity: 1, duration: 1.5 * PACE }, slotStartUnit + 7.5 * PACE);
        }
      });
    }, sectionRef);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }

    return () => ctx.revert();
  }, []);

  const handleDotClick = (index: number) => {
    if (!sectionRef.current) return;
    const ST = ScrollTrigger.getById('disc-master-pin');
    if (ST) {
      const startPos = ST.start;
      const endPos = ST.end;
      const targetPos = startPos + (index / DISCIPLINE_CHAPTERS.length) * (endPos - startPos);
      if (lenisContext && lenisContext.lenis) {
        lenisContext.lenis.scrollTo(targetPos, { duration: 1.5 });
      } else {
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      }
    }
  };

  return (
    <section
      id="achievements-section"
      ref={sectionRef}
      className="relative w-full bg-[#0C0907] text-[#F2E9D8] select-none font-sans"
    >
      {/* Pinned Viewport Stage */}
      <div
        ref={stageRef}
        className="relative w-full h-screen min-h-[100vh] overflow-hidden bg-[#0C0907]"
      >
        {/* Dim Golden Smoke Fallback Layer */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-25">
          <img
            src="/images/achievements/bg-fluid.png"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover filter brightness-90"
          />
        </div>

        {/* WebGL Fluid Canvas (Mounted inside stage, active when visible) */}
        {isSectionVisible && (
          <div className="absolute inset-0 z-0 pointer-events-none opacity-90">
            <LiquidEther
              colors={['#0A0908', '#9A6318', '#F5B031', '#FFD275']}
              mouseForce={22}
              cursorSize={130}
              isViscous={true}
              viscous={40}
              iterationsViscous={36}
              iterationsPoisson={40}
              resolution={0.65}
              isBounce={false}
              autoDemo={true}
              autoSpeed={0.4}
              autoIntensity={2.5}
              takeoverDuration={0.3}
              autoResumeDelay={2000}
              backgroundColor="#0A0908"
            />
          </div>
        )}

        {/* Section Header Strip */}
        <div className="absolute top-6 left-6 right-6 md:top-10 md:left-12 md:right-12 z-20 flex items-center justify-between pointer-events-none font-mono">
          <p className="text-xs uppercase tracking-[0.18em] text-[#E0A030] opacity-85">
            CRAFT & DISCIPLINE / ACHIEVEMENTS
          </p>
          <span className="text-xs uppercase tracking-[0.18em] text-white/50">
            {DISCIPLINE_CHAPTERS[activeIndex]?.number || '01 / 05'}
          </span>
        </div>

        {/* Right-Edge Navigation Dots */}
        <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 z-20 flex flex-col space-y-3 pointer-events-auto">
          {DISCIPLINE_CHAPTERS.map((ch, idx) => (
            <button
              key={`dot-${ch.id}`}
              type="button"
              onClick={() => handleDotClick(idx)}
              aria-label={`Jump to chapter ${ch.number} ${ch.title}`}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#E0A030] ${activeIndex === idx
                  ? 'bg-[#E0A030] scale-125 shadow-[0_0_10px_rgba(224,160,48,0.8)]'
                  : 'bg-white/20 hover:bg-white/50'
                }`}
            />
          ))}
        </div>

        {/* 5 Chapter Layers */}
        {DISCIPLINE_CHAPTERS.map((ch, i) => {
          const hasImageError = imgErrorMap[ch.id];

          return (
            <div
              key={ch.id}
              ref={(el) => {
                chaptersRef.current[i] = el;
              }}
              className="absolute inset-0 z-10 w-full h-full flex flex-col justify-between p-6 md:p-12 pointer-events-none"
            >
              {/* Tile Spotlight Cluster Layer */}
              <div className="spotlight-layer absolute inset-0 z-0 pointer-events-none opacity-0">
                <CursorGrid
                  cellSize={65}
                  color="#E0A93B"
                  radius={220}
                  falloff="smooth"
                  holdTime={500}
                  fadeDuration={900}
                  lineWidth={1.1}
                  maxOpacity={0.7}
                  fillOpacity={0.15}
                  gridOpacity={0.03}
                  cellRadius={6}
                />
              </div>

              {/* Title Element (Animates from Center to Top-Left Dock) */}
              <div className="chapter-title absolute z-20 whitespace-nowrap pointer-events-none origin-top-left">
                <h2
                  className="text-[clamp(56px,8vw,120px)] font-bold tracking-[-0.02em] leading-none text-[#FFF4E6]"
                  style={{ fontFamily: "'Inter', 'Manrope', sans-serif" }}
                >
                  {ch.title.split('').map((char, cIdx) => (
                    <span
                      key={`char-${cIdx}`}
                      className="inline-block title-char"
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  ))}
                </h2>
                <p className="chapter-desc text-xs md:text-sm font-mono text-[#E0A030] uppercase tracking-[0.2em] mt-2 opacity-0">
                  {ch.descriptor}
                </p>
              </div>

              {/* Chapter Main Grid Layout (Docked Left Content + Right Photo Card) */}
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full max-w-7xl mx-auto my-auto pt-24 md:pt-28">
                {/* Left Column: 3 Stat Blocks */}
                <div className="lg:col-span-6 space-y-6 md:space-y-8 pointer-events-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-white/10">
                    {ch.stats.map((stat, sIdx) => (
                      <div key={`${ch.id}-stat-${sIdx}`} className="stat-item space-y-1 opacity-0">
                        <p
                          className="stat-number text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[#FFF4E6]"
                          style={{ fontFamily: "'Inter', 'Manrope', sans-serif" }}
                        >
                          {stat.value}
                        </p>
                        <p className="text-[11px] font-mono text-[#A89880] uppercase tracking-wider">
                          {stat.label || 'TBD'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Photo Card & Caption */}
                <div className="lg:col-span-6 flex flex-col items-center lg:items-end pointer-events-auto">
                  <div
                    className={`photo-card relative ${ch.frameless
                        ? `w-[min(42vw,540px)] ${ch.aspectRatio || 'aspect-[4/3]'} rounded-xl overflow-hidden shadow-2xl opacity-0`
                        : `w-[min(34vw,420px)] ${ch.aspectRatio || 'aspect-[3/4]'} rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#17110C] opacity-0`
                      }`}
                  >
                    {!hasImageError ? (
                      <img
                        src={ch.imageSrc}
                        alt={ch.title}
                        loading="eager"
                        className="photo-card-img w-full h-full filter brightness-95 hover:scale-105 transition-transform duration-700"
                        style={{
                          objectFit: ch.objectFit || 'cover',
                          objectPosition: ch.objectPosition || 'center center',
                        }}
                        onError={() => setImgErrorMap((prev) => ({ ...prev, [ch.id]: true }))}
                      />
                    ) : (
                      /* Styled Fallback Placeholder Card */
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#261C12] to-[#0C0907]">
                        <svg
                          className="w-12 h-12 text-[#E0A030] mb-3 opacity-60"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="font-bold text-[#FFF4E6] text-lg">{ch.title}</p>
                        <span className="text-xs font-mono text-[#E0A030] uppercase tracking-widest mt-1">
                          PHOTO COMING SOON
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="photo-caption text-xs font-mono text-white/40 uppercase tracking-wider mt-3 max-w-[420px] text-center lg:text-right opacity-0">
                    {ch.caption}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

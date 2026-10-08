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

export interface DisciplineMoment {
  year?: string;
  text: string;
}

export interface DisciplineChapter {
  id: string;
  number: string;
  ghostNum: string;
  title: string;
  descriptor: string;
  summary?: string;
  stats: { value: string; label: string }[];
  moments?: DisciplineMoment[];
  quote?: string;
  imageSrc: string;
  image2Src?: string;
  cropPosition?: string;
  caption: string;
  nextLabel?: string;
}

export const DISCIPLINE_CHAPTERS: DisciplineChapter[] = [
  {
    id: 'table-tennis',
    number: '01 / 03',
    ghostNum: '01',
    title: 'Table Tennis',
    descriptor: '2x Tamil Nadu State Champion',
    // FILL_ME: Add optional summary, moments, or quote here
    summary: '',
    stats: [
      { value: '2x', label: 'Tamil Nadu State Champion' },
      { value: 'Gold', label: 'National Tournament, Goa' },
      { value: 'Gold', label: 'RDS Championship' },
    ],
    moments: [],
    quote: '',
    imageSrc: '/images/table-tennis.jpg',
    cropPosition: 'center 20%',
    caption: 'State Championship Finals Victory & Trophy Presentation',
    nextLabel: 'NEXT / 02 PUBLIC SPEAKING',
  },
  {
    id: 'public-speaking',
    number: '02 / 03',
    ghostNum: '02',
    title: 'Public Speaking',
    descriptor: 'Keynote & Oratory Speaker',
    // FILL_ME: Add optional summary, moments, or quote here
    summary: '',
    stats: [
      { value: '15000', label: 'People addressed' },
      { value: '7+', label: 'Events organised' },
      { value: '3rd', label: 'Coimbatore Book Festival, English edition' },
    ],
    moments: [],
    quote: '',
    imageSrc: '/images/speaking.jpg',
    cropPosition: 'center 30%',
    caption: 'Keynote Address on Cybersecurity & Tech Futures',
    nextLabel: 'NEXT / 03 KARATE',
  },
  {
    id: 'karate',
    number: '03 / 03',
    ghostNum: '03',
    title: 'Karate',
    descriptor: 'Black Belt Martial Artist',
    // FILL_ME: Add optional summary, moments, or quote here
    summary: '',
    stats: [
      { value: 'Black Belt', label: 'Martial Artist' },
      { value: '4x', label: 'National Champion' },
      { value: '15+', label: 'State Medals' },
    ],
    moments: [],
    quote: '',
    imageSrc: '/images/karate.jpg',
    cropPosition: 'center 25%',
    caption: 'National Kumite Tournament Demonstration',
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
    } catch {}
  }, []);

  // Preload all chapter main images
  useEffect(() => {
    DISCIPLINE_CHAPTERS.forEach((ch) => {
      const img = new Image();
      img.src = ch.imageSrc;
      img.onerror = () => {
        setImgErrorMap((prev) => ({ ...prev, [ch.id]: true }));
      };
    });
  }, []);

  // Master GSAP Context & ScrollTrigger Timeline with 10 units per chapter (TOTAL_UNITS = 30)
  useEffect(() => {
    if (!sectionRef.current || !stageRef.current) return;

    const ctx = gsap.context(() => {
      const numChapters = DISCIPLINE_CHAPTERS.length;
      const isMobile = window.innerWidth < 768;
      const unitsPerChapter = (isMobile ? 7.0 : 10.0) * PACE;
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
          scrub: 2, // Smooth weighted inertia on wheel ticks
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

      // Build 3 Chapter Timeline Slots mapped explicitly to 10 units each
      DISCIPLINE_CHAPTERS.forEach((ch, i) => {
        const slotUnits = unitsPerChapter;
        const slotStartUnit = i * slotUnits;

        const chapterEl = chaptersRef.current[i];
        if (!chapterEl) return;

        const titleEl = chapterEl.querySelector('.chapter-title');
        const chars = chapterEl.querySelectorAll('.title-char');
        const descEl = chapterEl.querySelector('.chapter-desc');
        const summaryEl = chapterEl.querySelector('.chapter-summary');
        const statsEls = chapterEl.querySelectorAll('.stat-item');
        const momentsEl = chapterEl.querySelector('.chapter-moments');
        const quoteEl = chapterEl.querySelector('.chapter-quote');
        const photoCardEl = chapterEl.querySelector('.photo-card');
        const innerImgEl = chapterEl.querySelector('.photo-card-img');
        const secondCardEl = chapterEl.querySelector('.second-photo-card');
        const captionEl = chapterEl.querySelector('.photo-caption');
        const nextCueEl = chapterEl.querySelector('.next-cue');
        const ghostNumEl = chapterEl.querySelector('.ghost-numeral');
        const spotLightEl = chapterEl.querySelector('.spotlight-layer');
        const progressBarEl = chapterEl.querySelector('.chapter-progress-line');

        // Check optional slot contents
        const hasSummary = Boolean(ch.summary && ch.summary.trim());
        const hasMoments = Boolean(ch.moments && ch.moments.length > 0);
        const hasQuote = Boolean(ch.quote && ch.quote.trim());

        // Set initial state
        gsap.set(chapterEl, { visibility: i === 0 ? 'visible' : 'hidden', opacity: i === 0 ? 1 : 0 });
        gsap.set(titleEl, { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', scale: 1, color: '#FFF4E6' });
        
        if (i !== 0) {
          gsap.set(chars, { opacity: 0, yPercent: 40 });
        } else {
          gsap.set(chars, { opacity: 1, yPercent: 0 });
        }

        gsap.set(descEl, { opacity: 0, y: 15 });
        if (summaryEl) gsap.set(summaryEl, { opacity: 0, y: 15 });
        gsap.set(statsEls, { opacity: 0, y: 25 });
        if (momentsEl) gsap.set(momentsEl, { opacity: 0, y: 15 });
        if (quoteEl) gsap.set(quoteEl, { opacity: 0, y: 15 });

        gsap.set(photoCardEl, { opacity: 0, xPercent: 12, scale: 0.92, filter: 'blur(12px)', clipPath: 'inset(0% 0% 0% 100%)' });
        if (innerImgEl) gsap.set(innerImgEl, { scale: 1.12 });
        if (secondCardEl) gsap.set(secondCardEl, { opacity: 0, y: 35, rotate: 2 });
        gsap.set(captionEl, { opacity: 0, y: 15 });
        if (nextCueEl) gsap.set(nextCueEl, { opacity: 0, y: 10 });
        if (ghostNumEl) gsap.set(ghostNumEl, { opacity: 0, y: 50 });
        gsap.set(spotLightEl, { opacity: 0 });
        if (progressBarEl) gsap.set(progressBarEl, { scaleX: 0 });

        // Reduced Motion simplified path
        if (isReducedMotion) {
          masterTl.to(chapterEl, { visibility: 'visible', opacity: 1, duration: 0.1 }, slotStartUnit);
          masterTl.to([titleEl, descEl, statsEls, photoCardEl, captionEl], { opacity: 1, duration: 2.0 }, slotStartUnit + 1.0);
          if (i < numChapters - 1) {
            masterTl.to(chapterEl, { opacity: 0, duration: 1.0 }, slotStartUnit + slotUnits - 1.0);
          }
          return;
        }

        // --- Chapter Top Progress Line (0 to 100% across the 10 units) ---
        if (progressBarEl) {
          masterTl.to(progressBarEl, { scaleX: 1, ease: 'none', duration: slotUnits }, slotStartUnit);
        }

        // --- BEAT A: Title Entrance (0.0 to 0.8 units) ---
        if (i > 0) {
          const titleEnterStart = slotStartUnit - 0.6; // Handoff starting at 9.4 of previous chapter
          masterTl.to(chapterEl, { visibility: 'visible', opacity: 1, duration: 0.01 }, titleEnterStart);
          masterTl.to(
            chars,
            { opacity: 1, yPercent: 0, stagger: 0.04 * PACE, ease: 'sine.out', duration: 0.8 * PACE },
            titleEnterStart
          );
        }

        // --- BEAT B: Read Hold (0.8 to 1.5 units) ---
        // Pinned centered hold (no movement)

        // --- BEAT C: Dock to Top-Left (1.5 to 2.4 units) ---
        const dockStart = slotStartUnit + 1.5 * PACE;
        const dockDur = 0.9 * PACE;

        masterTl
          .to(
            titleEl,
            {
              top: isMobile ? '72px' : '96px',
              left: isMobile ? '24px' : '48px',
              transform: 'translate(0%, 0%)',
              scale: isMobile ? 0.32 : 0.42,
              color: '#FFF4E6',
              ease: 'power1.inOut',
              duration: dockDur,
            },
            dockStart
          )
          .to(descEl, { opacity: 1, y: 0, ease: 'sine.out', duration: 0.6 * PACE }, dockStart + 0.3 * PACE)
          .to(spotLightEl, { opacity: 1, ease: 'sine.inOut', duration: 0.9 * PACE }, dockStart);

        if (ghostNumEl) {
          masterTl.to(ghostNumEl, { opacity: 1, y: 0, ease: 'sine.out', duration: 1.2 * PACE }, dockStart + 0.2 * PACE);
        }

        // --- BEAT D1: Summary (2.5 to 3.2 units) ---
        if (hasSummary && summaryEl) {
          masterTl.to(summaryEl, { opacity: 1, y: 0, ease: 'sine.out', duration: 0.7 * PACE }, slotStartUnit + 2.5 * PACE);
        }

        // --- BEAT D2: Stats (3.3 to 5.0 units) ---
        const s1Start = slotStartUnit + 3.3 * PACE;
        const s1Dur = 0.5 * PACE;
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
              duration: s1Dur,
              onStart: () => {
                if (parsed1 && num1) {
                  gsap.to({ val: 0 }, { val: parsed1.num, duration: s1Dur, ease: 'power1.out', onUpdate: function() { num1.textContent = `${parsed1.prefix}${Math.floor(this.targets()[0].val)}${parsed1.suffix}`; } });
                }
              },
            },
            s1Start
          );
        }

        const s2Start = slotStartUnit + 3.9 * PACE;
        const s2Dur = 0.5 * PACE;
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
              duration: s2Dur,
              onStart: () => {
                if (parsed2 && num2) {
                  gsap.to({ val: 0 }, { val: parsed2.num, duration: s2Dur, ease: 'power1.out', onUpdate: function() { num2.textContent = `${parsed2.prefix}${Math.floor(this.targets()[0].val)}${parsed2.suffix}`; } });
                }
              },
            },
            s2Start
          );
        }

        const s3Start = slotStartUnit + 4.5 * PACE;
        const s3Dur = 0.5 * PACE;
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
              duration: s3Dur,
              onStart: () => {
                if (parsed3 && num3) {
                  gsap.to({ val: 0 }, { val: parsed3.num, duration: s3Dur, ease: 'power1.out', onUpdate: function() { num3.textContent = `${parsed3.prefix}${Math.floor(this.targets()[0].val)}${parsed3.suffix}`; } });
                }
              },
            },
            s3Start
          );
        }

        // --- BEAT D3: Moments & Quote (5.1 to 6.3 units) ---
        if (hasMoments && momentsEl) {
          masterTl.to(momentsEl, { opacity: 1, y: 0, ease: 'sine.out', duration: 0.8 * PACE }, slotStartUnit + 5.1 * PACE);
        }
        if (hasQuote && quoteEl) {
          masterTl.to(quoteEl, { opacity: 1, y: 0, ease: 'sine.out', duration: 0.6 * PACE }, slotStartUnit + 5.7 * PACE);
        }

        // --- BEAT D4: Main Photo Card (6.4 to 7.8 units - 1.4 units duration) ---
        const mainPhotoStart = slotStartUnit + 6.4 * PACE;
        // Phase 1 (6.4 to 7.0): Clip reveal from right + blur 12px to 0
        masterTl.to(
          photoCardEl,
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            opacity: 1,
            filter: 'blur(0px)',
            ease: 'sine.inOut',
            duration: 0.6 * PACE,
          },
          mainPhotoStart
        );
        // Phase 2 (7.0 to 7.8): Slide, scale 0.92 to 1 & inner image parallax 1.12 to 1.0
        masterTl.to(
          photoCardEl,
          { xPercent: 0, scale: 1, ease: 'sine.out', duration: 0.8 * PACE },
          mainPhotoStart + 0.6 * PACE
        );
        if (innerImgEl) {
          masterTl.to(innerImgEl, { scale: 1.0, ease: 'sine.out', duration: 0.8 * PACE }, mainPhotoStart + 0.6 * PACE);
        }

        // --- BEAT D5: Secondary Photo Card (7.7 to 8.4 units) ---
        if (secondCardEl) {
          masterTl.to(
            secondCardEl,
            { opacity: 1, y: 0, rotate: 0, ease: 'power2.out', duration: 0.7 * PACE },
            slotStartUnit + 7.7 * PACE
          );
        }

        // --- BEAT D6: Caption and Next Cue (8.3 to 8.8 units) ---
        masterTl.to(captionEl, { opacity: 1, y: 0, ease: 'sine.out', duration: 0.5 * PACE }, slotStartUnit + 8.3 * PACE);
        if (nextCueEl) {
          masterTl.to(nextCueEl, { opacity: 1, y: 0, ease: 'sine.out', duration: 0.5 * PACE }, slotStartUnit + 8.4 * PACE);
        }

        // --- BEAT E: Full Composition Hold (8.8 to 9.2 units) ---
        // Clean hold

        // --- BEAT F: Exit & Handoff (9.2 to 10.0 units) ---
        if (i < numChapters - 1) {
          const exitStart = slotStartUnit + 9.2 * PACE;
          const exitDur = 0.8 * PACE;

          masterTl
            .to(
              [titleEl, descEl, summaryEl, statsEls, momentsEl, quoteEl, photoCardEl, secondCardEl, captionEl, nextCueEl, ghostNumEl].filter(Boolean),
              { opacity: 0, y: -40, ease: 'sine.in', duration: exitDur, stagger: 0.03 },
              exitStart
            )
            .to(spotLightEl, { opacity: 0, ease: 'sine.in', duration: 0.8 * PACE }, exitStart)
            .to(chapterEl, { visibility: 'hidden', duration: 0.01 }, exitStart + exitDur);
        } else {
          // Last chapter (Karate) holds composition for 1.5 units before pin releases
          masterTl.to(chapterEl, { opacity: 1, duration: 1.5 * PACE }, slotStartUnit + 8.8 * PACE);
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
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
          <img
            src="/images/achievements/bg-fluid.png"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover filter brightness-90"
          />
        </div>

        {/* Soft Translucent WebGL Fluid Canvas */}
        {isSectionVisible && (
          <div className="absolute inset-0 z-0 pointer-events-none opacity-70 mix-blend-screen">
            <LiquidEther
              colors={['#0A0908', '#6A4310', '#C28822', '#E0A030']}
              mouseForce={14}
              cursorSize={110}
              isViscous={true}
              viscous={35}
              iterationsViscous={32}
              iterationsPoisson={32}
              resolution={0.6}
              isBounce={false}
              autoDemo={true}
              autoSpeed={0.3}
              autoIntensity={1.8}
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
            {DISCIPLINE_CHAPTERS[activeIndex]?.number || '01 / 03'}
          </span>
        </div>

        {/* Right-Edge Navigation Dots (3 Dots) */}
        <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 z-20 flex flex-col space-y-3 pointer-events-auto">
          {DISCIPLINE_CHAPTERS.map((ch, idx) => (
            <button
              key={`dot-${ch.id}`}
              type="button"
              onClick={() => handleDotClick(idx)}
              aria-label={`Jump to chapter ${ch.number} ${ch.title}`}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#E0A030] ${
                activeIndex === idx
                  ? 'bg-[#E0A030] scale-125 shadow-[0_0_10px_rgba(224,160,48,0.8)]'
                  : 'bg-white/20 hover:bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Keyword Marquee Strip at Bottom of Stage */}
        <div className="absolute bottom-4 left-6 right-6 z-20 overflow-hidden pointer-events-none opacity-35 hidden md:block">
          <div className="whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.3em] text-[#E0A030] animate-marquee">
            {DISCIPLINE_CHAPTERS[activeIndex]?.stats.map((s) => s.label).filter(Boolean).join(' • ')} • {DISCIPLINE_CHAPTERS[activeIndex]?.descriptor} • {DISCIPLINE_CHAPTERS[activeIndex]?.stats.map((s) => s.label).filter(Boolean).join(' • ')}
          </div>
        </div>

        {/* 3 Chapter Layers */}
        {DISCIPLINE_CHAPTERS.map((ch, i) => {
          const hasImageError = imgErrorMap[ch.id];
          const hasSummary = Boolean(ch.summary && ch.summary.trim());
          const hasMoments = Boolean(ch.moments && ch.moments.length > 0);
          const hasQuote = Boolean(ch.quote && ch.quote.trim());

          return (
            <div
              key={ch.id}
              ref={(el) => {
                chaptersRef.current[i] = el;
              }}
              className="absolute inset-0 z-10 w-full h-full flex flex-col justify-between p-6 md:p-12 pointer-events-none"
            >
              {/* Chapter Top Progress Bar Line */}
              <div className="chapter-progress-line absolute top-0 left-0 right-0 h-[1px] bg-[#E0A030] z-30 origin-left scale-x-0 opacity-60" />

              {/* Ghost Numeral Background (Bottom Right) */}
              <div
                aria-hidden="true"
                className="ghost-numeral absolute bottom-6 right-16 z-0 pointer-events-none text-[clamp(14rem,38vw,32rem)] font-extrabold leading-none select-none hidden md:block text-transparent"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  WebkitTextStroke: '1px rgba(224, 160, 48, 0.06)',
                }}
              >
                {ch.ghostNum}
              </div>

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
                  className="text-[clamp(40px,4vw,64px)] font-bold tracking-[-0.02em] leading-none text-[#FFF4E6]"
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
                <p className="chapter-desc text-xs md:text-sm font-mono text-[#E0A030] uppercase tracking-[0.18em] mt-2 opacity-0">
                  {ch.descriptor}
                </p>
              </div>

              {/* Reworked Two-Column CSS Grid Layout (Centered vertically) */}
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center w-full max-w-7xl mx-auto my-auto min-h-[calc(100vh-220px)] pt-24 md:pt-28">
                {/* LEFT Column (46% width / col-span-6): Summary + Stats + Moments + Quote */}
                <div className="lg:col-span-6 space-y-6 md:space-y-8 pointer-events-auto flex flex-col justify-center">
                  {/* Optional Summary Paragraph */}
                  {hasSummary && (
                    <p className="chapter-summary text-sm md:text-base text-[#F2E9D8]/90 leading-relaxed font-sans max-w-xl opacity-0">
                      {ch.summary}
                    </p>
                  )}

                  {/* Stats Row (3 Columns, White-space nowrap values) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-white/10">
                    {ch.stats.map((stat, sIdx) => (
                      <div key={`${ch.id}-stat-${sIdx}`} className="stat-item space-y-1 opacity-0">
                        <p
                          className="stat-number text-[clamp(36px,3.8vw,64px)] font-bold tracking-tight text-[#FFF4E6] whitespace-nowrap"
                          style={{ fontFamily: "'Inter', 'Manrope', sans-serif" }}
                        >
                          {stat.value}
                        </p>
                        <p className="text-[12px] font-mono text-[#A89880] uppercase tracking-wider">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Optional Key Moments List */}
                  {hasMoments && ch.moments && (
                    <div className="chapter-moments space-y-2 pt-2 opacity-0">
                      {ch.moments.map((m, mIdx) => (
                        <div key={`moment-${mIdx}`} className="flex items-baseline space-x-3 text-xs font-mono">
                          {m.year && <span className="text-[#E0A030] font-bold">{m.year}</span>}
                          <span className="text-[#F2E9D8]/80">{m.text}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Optional Quote Line */}
                  {hasQuote && (
                    <div className="chapter-quote border-l-2 border-[#E0A030] pl-4 py-1 italic text-[#FFF4E6] text-lg font-sans opacity-0">
                      "{ch.quote}"
                    </div>
                  )}
                </div>

                {/* RIGHT Column (42% width / col-span-6): Main Photo Card + Overlapping Secondary Photo */}
                <div className="lg:col-span-6 flex flex-col items-center lg:items-end pointer-events-auto">
                  <div className="relative">
                    {/* Main Photo Card */}
                    <div className="photo-card relative w-[min(30vw,460px)] aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#17110C] opacity-0">
                      {!hasImageError ? (
                        <img
                          src={ch.imageSrc}
                          alt={ch.title}
                          loading="eager"
                          className="photo-card-img w-full h-full object-cover filter brightness-95 hover:scale-105 transition-transform duration-700"
                          onError={() => setImgErrorMap((prev) => ({ ...prev, [ch.id]: true }))}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#261C12] to-[#0C0907]">
                          <svg className="w-12 h-12 text-[#E0A030] mb-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="font-bold text-[#FFF4E6] text-lg">{ch.title}</p>
                          <span className="text-xs font-mono text-[#E0A030] uppercase tracking-widest mt-1">PHOTO COMING SOON</span>
                        </div>
                      )}
                    </div>

                    {/* Secondary Overlapping Photo Card (Bottom Left Corner) */}
                    <div className="second-photo-card absolute -bottom-10 -left-12 w-[55%] aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border border-[#E0A030]/40 bg-[#17110C] opacity-0 hidden md:block">
                      <img
                        src={ch.image2Src || ch.imageSrc}
                        alt={`${ch.title} detail`}
                        loading="eager"
                        className="w-full h-full object-cover"
                        style={{
                          objectPosition: ch.cropPosition || 'center center',
                          transform: ch.image2Src ? 'none' : 'scale(2.2)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Caption */}
                  <p className="photo-caption text-xs font-mono text-white/40 uppercase tracking-wider mt-12 max-w-[460px] text-center lg:text-right opacity-0">
                    {ch.caption}
                  </p>
                </div>
              </div>

              {/* Next Chapter Cue (Bottom Left) */}
              {ch.nextLabel && (
                <div className="next-cue absolute bottom-8 left-6 md:left-12 z-20 flex items-center space-x-3 font-mono text-xs uppercase tracking-[0.2em] text-[#E0A030] opacity-0 pointer-events-none">
                  <span>{ch.nextLabel}</span>
                  <div className="w-12 h-[1px] bg-[#E0A030]/60" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

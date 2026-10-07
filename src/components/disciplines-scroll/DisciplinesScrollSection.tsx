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

export interface DisciplineChapter {
  id: string;
  number: string;
  title: string;
  descriptor: string;
  stats: { value: string; label: string }[];
  imageSrc: string;
  caption: string;
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
    id: 'chess',
    number: '03 / 03',
    title: 'Chess',
    descriptor: 'Tactical Tournament Player',
    stats: [
      { value: '2143', label: 'Peak Bullet Rating' },
      { value: '1985', label: 'Rapid Rating' },
      { value: '1924', label: 'Blitz Rating' },
    ],
    imageSrc: '/images/chess.jpg',
    caption: 'State Level FIDE Rated Tournament Trophies',
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

  // Preload all chapter images and trigger refresh
  useEffect(() => {
    DISCIPLINE_CHAPTERS.forEach((ch) => {
      const img = new Image();
      img.src = ch.imageSrc;
      img.onerror = () => {
        setImgErrorMap((prev) => ({ ...prev, [ch.id]: true }));
      };
    });
  }, []);

  // Master GSAP Context & ScrollTrigger Timeline
  useEffect(() => {
    if (!sectionRef.current || !stageRef.current) return;

    const ctx = gsap.context(() => {
      const numChapters = DISCIPLINE_CHAPTERS.length;
      const totalScrollVh = numChapters * 3.5; // 350% per chapter

      // Intro animation for first chapter title before section pin
      const introTl = gsap.timeline({
        scrollTrigger: {
          id: 'disc-intro',
          trigger: sectionRef.current,
          start: 'top 65%',
          toggleActions: 'play none none reverse',
          refreshPriority: 0,
        },
      });

      const firstTitleChars = sectionRef.current?.querySelectorAll('.chapter-0-title-char');
      if (firstTitleChars && firstTitleChars.length > 0) {
        introTl.fromTo(
          firstTitleChars,
          { opacity: 0, yPercent: 40 },
          { opacity: 1, yPercent: 0, duration: 0.8, stagger: 0.02, ease: 'power2.out' }
        );
      }

      // Master Pinned Timeline
      const masterTl = gsap.timeline({
        scrollTrigger: {
          id: 'disc-master-pin',
          trigger: sectionRef.current,
          start: 'top top',
          end: `+=${totalScrollVh * 100}vh`,
          pin: stageRef.current,
          pinSpacing: true,
          scrub: 1.5,
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

      // Build 5 Chapter Timeline Slots
      DISCIPLINE_CHAPTERS.forEach((ch, i) => {
        const slotDuration = 1 / numChapters;
        const slotStart = i * slotDuration;

        const chapterEl = chaptersRef.current[i];
        if (!chapterEl) return;

        const titleEl = chapterEl.querySelector('.chapter-title');
        const chars = chapterEl.querySelectorAll('.title-char');
        const descEl = chapterEl.querySelector('.chapter-desc');
        const statsEls = chapterEl.querySelectorAll('.stat-item');
        const photoCardEl = chapterEl.querySelector('.photo-card');
        const captionEl = chapterEl.querySelector('.photo-caption');
        const spotLightEl = chapterEl.querySelector('.spotlight-layer');

        // Set initial visibility & positions
        gsap.set(chapterEl, { visibility: i === 0 ? 'visible' : 'hidden', opacity: i === 0 ? 1 : 0 });

        if (i !== 0) {
          gsap.set(titleEl, { xPercent: 0, yPercent: 0, scale: 1, color: '#FFF4E6', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
          gsap.set(chars, { opacity: 0, yPercent: 50 });
        } else {
          // Chapter 01 starts docked/centered
          gsap.set(titleEl, { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
        }

        gsap.set(descEl, { opacity: 0, y: 15 });
        gsap.set(statsEls, { opacity: 0, y: 20 });
        gsap.set(photoCardEl, { opacity: 0, x: 60, scale: 0.95 });
        gsap.set(captionEl, { opacity: 0, y: 10 });
        gsap.set(spotLightEl, { opacity: 0 });

        // Phase 1: Title Walk-In (0% -> 12% of slot)
        if (i > 0) {
          masterTl
            .to(chapterEl, { visibility: 'visible', opacity: 1, duration: 0.01 }, slotStart)
            .to(chars, { opacity: 1, yPercent: 0, stagger: 0.003, ease: 'power2.out', duration: 0.1 * slotDuration }, slotStart);
        }

        // Phase 2: Title Travel to Top-Left Dock (22% -> 38% of slot)
        const travelStart = slotStart + 0.22 * slotDuration;
        const travelDur = 0.16 * slotDuration;

        masterTl
          .to(
            titleEl,
            {
              top: '96px',
              left: '48px',
              transform: 'translate(0%, 0%)',
              scale: 0.38,
              color: '#FFF4E6',
              ease: 'power3.inOut',
              duration: travelDur,
            },
            travelStart
          )
          .to(descEl, { opacity: 1, y: 0, duration: travelDur * 0.8 }, travelStart + travelDur * 0.2)
          .to(spotLightEl, { opacity: 1, duration: travelDur }, travelStart);

        // Phase 3: Content Appears One-by-One (38% -> 82% of slot)
        const contentStart = slotStart + 0.38 * slotDuration;
        const contentStep = (0.44 * slotDuration) / 5;

        // Stats sequential reveal + count-up
        statsEls.forEach((statEl, sIdx) => {
          const numEl = statEl.querySelector('.stat-number');
          const statData = ch.stats[sIdx];
          const parsed = statData ? parseStatValue(statData.value) : null;

          masterTl.to(
            statEl,
            {
              opacity: 1,
              y: 0,
              duration: contentStep,
              ease: 'power2.out',
              onStart: () => {
                if (parsed && numEl) {
                  gsap.to(
                    { val: 0 },
                    {
                      val: parsed.num,
                      duration: 0.8,
                      ease: 'power2.out',
                      onUpdate: function () {
                        numEl.textContent = `${parsed.prefix}${Math.floor(this.targets()[0].val)}${parsed.suffix}`;
                      },
                    }
                  );
                }
              },
            },
            contentStart + sIdx * contentStep
          );
        });

        // Photo card slide-in
        masterTl.to(
          photoCardEl,
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: contentStep * 1.5,
            ease: 'power3.out',
          },
          contentStart + 3 * contentStep
        );

        // Caption reveal
        masterTl.to(
          captionEl,
          { opacity: 1, y: 0, duration: contentStep },
          contentStart + 4 * contentStep
        );

        // Phase 4: Chapter Exit / Fade Out (90% -> 100% of slot)
        if (i < numChapters - 1) {
          const exitStart = slotStart + 0.9 * slotDuration;
          const exitDur = 0.1 * slotDuration;

          masterTl.to(
            [titleEl, descEl, statsEls, photoCardEl, captionEl, spotLightEl],
            { opacity: 0, y: -20, duration: exitDur, ease: 'power2.in' },
            exitStart
          ).to(chapterEl, { visibility: 'hidden', duration: 0.01 }, exitStart + exitDur);
        }
      });
    }, sectionRef);

    // Refresh triggers after fonts and initial render
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
        lenisContext.lenis.scrollTo(targetPos, { duration: 1.2 });
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
            {DISCIPLINE_CHAPTERS[activeIndex]?.number || '01 / 03'}
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
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#E0A030] ${
                activeIndex === idx
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
                      className={`inline-block ${i === 0 ? 'chapter-0-title-char' : 'title-char'}`}
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
                  <div className="photo-card relative w-[min(34vw,420px)] aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#17110C] opacity-0">
                    {!hasImageError ? (
                      <img
                        src={ch.imageSrc}
                        alt={ch.title}
                        loading="eager"
                        className="w-full h-full object-cover filter brightness-95 hover:scale-105 transition-transform duration-700"
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

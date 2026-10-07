'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { AchievementEntry, AchievementStat } from '@/content/achievements';
import { useLenis } from '@/motion/lenis/LenisProvider';
import manifestData from '@/content/achievements.manifest.json';
import CursorGrid from '@/components/backgrounds/CursorGrid';

interface ManifestPhoto {
  id: string;
  filename: string;
  originalPath: string;
  variants: Record<number, Record<string, string>>;
  blurDataURL: string;
  ambientBackdrop: string;
  width: number;
  height: number;
  aspectRatio: number;
  isWide: boolean;
  isPortrait: boolean;
  focalPoint: [number, number];
  zoom: number;
  alt: string;
}

interface DisciplineManifest {
  slug: string;
  title: string;
  photos: ManifestPhoto[];
}

const manifest = manifestData as unknown as Record<string, DisciplineManifest>;

interface AchievementDetailModalProps {
  item: AchievementEntry;
  disciplineIndex: number;
  totalDisciplines: number;
  originRect: DOMRect | null;
  onClose: () => void;
  triggerElement: HTMLElement | null;
}

// Helper to extract numeric part and suffix for stat count-up
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

export const AchievementDetailModal: React.FC<AchievementDetailModalProps> = ({
  item,
  disciplineIndex,
  totalDisciplines,
  originRect,
  onClose,
  triggerElement,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const photoCardRef = useRef<HTMLDivElement>(null);

  const { stop, start } = useLenis();

  const discManifest = manifest[item.slug] || { slug: item.slug, title: item.title, photos: [] };
  const photos = discManifest.photos || [];

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [statCounts, setStatCounts] = useState<number[]>([]);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Check reduced motion
  useEffect(() => {
    try {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setIsReducedMotion(mq.matches);
    } catch {}
  }, []);

  // Stop Lenis smooth scroll while dialog is open & restore on close
  useEffect(() => {
    stop();
    return () => {
      start();
    };
  }, [stop, start]);

  // Shared-element FLIP transition & letter walk animation on mount
  useEffect(() => {
    if (isReducedMotion || !originRect || !titleRef.current) return;

    const titleEl = titleRef.current;
    const currentRect = titleEl.getBoundingClientRect();

    const deltaX = originRect.left + originRect.width / 2 - (currentRect.left + currentRect.width / 2);
    const deltaY = originRect.top + originRect.height / 2 - (currentRect.top + currentRect.height / 2);
    const scale = originRect.height / currentRect.height;

    // Flight from origin node position
    gsap.fromTo(
      titleEl,
      {
        x: deltaX,
        y: deltaY,
        scale: Math.max(scale, 0.3),
        transformOrigin: 'top left',
      },
      {
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.65,
        ease: 'power3.out',
      }
    );

    // Stagger letter walk effect on title characters
    const letterEls = titleEl.querySelectorAll('.title-char');
    if (letterEls.length > 0) {
      gsap.fromTo(
        letterEls,
        {
          y: 35,
          opacity: 0,
          rotateX: -45,
        },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 0.5,
          stagger: 0.04,
          ease: 'back.out(1.7)',
          delay: 0.2,
        }
      );
    }

    // Photo card smooth scaling & fade reveal animation
    if (photoCardRef.current) {
      gsap.fromTo(
        photoCardRef.current,
        {
          scale: 0.88,
          opacity: 0,
          y: 40,
        },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          delay: 0.25,
        }
      );
    }
  }, [originRect, isReducedMotion]);

  // Count-up animation for stats
  useEffect(() => {
    if (isReducedMotion) {
      setStatCounts(item.stats.map((s) => parseStatValue(s.value)?.num ?? 0));
      return;
    }

    setStatCounts(item.stats.map(() => 0));

    const obj = { progress: 0 };
    const tween = gsap.to(obj, {
      progress: 1,
      duration: 1.2,
      ease: 'power2.out',
      delay: 0.2,
      onUpdate: () => {
        setStatCounts(
          item.stats.map((s) => {
            const parsed = parseStatValue(s.value);
            if (!parsed) return 0;
            return Math.floor(parsed.num * obj.progress);
          })
        );
      },
    });

    return () => {
      tween.kill();
    };
  }, [item.stats, isReducedMotion]);

  // Focus Trap & Focus Return
  useEffect(() => {
    const prevActiveElement = triggerElement || (document.activeElement as HTMLElement);

    setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      } else if (e.key === 'ArrowRight' && photos.length > 1) {
        e.preventDefault();
        setActivePhotoIdx((prev) => (prev + 1) % photos.length);
      } else if (e.key === 'ArrowLeft' && photos.length > 1) {
        e.preventDefault();
        setActivePhotoIdx((prev) => (prev - 1 + photos.length) % photos.length);
      } else if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (prevActiveElement && typeof prevActiveElement.focus === 'function') {
        prevActiveElement.focus();
      }
    };
  }, [photos.length, triggerElement]);

  // Touch Handlers for Swipe-down to close & Horizontal swipe for photos
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (dy > 100 && Math.abs(dy) > Math.abs(dx)) {
      handleClose();
    } else if (Math.abs(dx) > 50 && photos.length > 1) {
      if (dx < 0) {
        setActivePhotoIdx((prev) => (prev + 1) % photos.length);
      } else {
        setActivePhotoIdx((prev) => (prev - 1 + photos.length) % photos.length);
      }
    }
  };

  // Close animation
  const handleClose = useCallback(() => {
    if (isReducedMotion || !originRect || !titleRef.current) {
      onClose();
      return;
    }

    const titleEl = titleRef.current;
    const currentRect = titleEl.getBoundingClientRect();
    const deltaX = originRect.left + originRect.width / 2 - (currentRect.left + currentRect.width / 2);
    const deltaY = originRect.top + originRect.height / 2 - (currentRect.top + currentRect.height / 2);
    const scale = originRect.height / currentRect.height;

    gsap.to(titleEl, {
      x: deltaX,
      y: deltaY,
      scale: Math.max(scale, 0.3),
      duration: 0.4,
      ease: 'power2.in',
    });

    if (dialogRef.current) {
      gsap.to(dialogRef.current, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: onClose,
      });
    } else {
      onClose();
    }
  }, [isReducedMotion, originRect, onClose]);

  const currentPhoto = photos[activePhotoIdx];
  const formattedIndex = String(disciplineIndex + 1).padStart(2, '0');
  const formattedTotal = String(totalDisciplines).padStart(2, '0');

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`achievement-title-${item.id}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 z-50 flex flex-col justify-between text-[#F2E9D8] select-none overflow-y-auto bg-[#0C0907]"
    >
      {/* Fluid Smoke Background Image Layer */}
      <div className="absolute inset-0 pointer-events-none z-[0] overflow-hidden">
        <img
          src="/images/achievements/bg-fluid.png"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
        />
      </div>

      {/* PHOTO STAGE BACKDROP / FULL-BLEED (For wide photos & ambient background) */}
      {currentPhoto ? (
        <div className="absolute inset-0 pointer-events-none z-[1] overflow-hidden">
          {/* Full-Bleed Wide Photo Render */}
          {currentPhoto.isWide && (
            <div className="absolute inset-0 w-full h-full overflow-hidden">
              <picture className="w-full h-full block">
                {currentPhoto.variants[1920]?.avif && (
                  <source srcSet={currentPhoto.variants[1920].avif} type="image/avif" />
                )}
                {currentPhoto.variants[1920]?.webp && (
                  <source srcSet={currentPhoto.variants[1920].webp} type="image/webp" />
                )}
                <img
                  key={`photo-${currentPhoto.id}`}
                  src={currentPhoto.originalPath}
                  alt={currentPhoto.alt}
                  className={`w-full h-full object-cover filter brightness-[0.85] transition-opacity duration-500 ${
                    isReducedMotion ? '' : 'animate-kenburns'
                  }`}
                  style={{
                    objectPosition: `${currentPhoto.focalPoint[0] * 100}% ${currentPhoto.focalPoint[1] * 100}%`,
                    transform: `scale(${currentPhoto.zoom})`,
                  }}
                />
              </picture>
            </div>
          )}
        </div>
      ) : null}

      {/* Interactive Cursor Grid Layer */}
      <div className="absolute inset-0 pointer-events-auto z-[2] opacity-100">
        <CursorGrid
          cellSize={65}
          color="#E0A93B"
          radius={260}
          falloff="smooth"
          holdTime={600}
          fadeDuration={1000}
          lineWidth={1.2}
          maxOpacity={0.85}
          fillOpacity={0.25}
          gridOpacity={0.03}
          cellRadius={6}
          clickPulse
          pulseSpeed={700}
        />
      </div>


      {/* Backdrop Tap/Click Dismissal */}
      <div
        onClick={handleClose}
        className="absolute inset-0 z-0 cursor-pointer"
        aria-hidden="true"
        title="Click background to close"
      />

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between p-6 md:p-12 pointer-events-none">
        <p className="text-xs font-mono tracking-[0.25em] text-[#E0A93B] uppercase">
          CRAFT & DISCIPLINE
        </p>

        <div className="flex items-center space-x-6">
          <span className="text-xs font-mono text-white/50 tracking-wider">
            {formattedIndex} / {formattedTotal}
          </span>

          <button
            ref={closeBtnRef}
            onClick={handleClose}
            type="button"
            aria-label="Close detail view"
            className="pointer-events-auto flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-[#E0A93B]/60 text-xs font-mono tracking-wider text-white/80 hover:text-[#E0A93B] hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-[#E0A93B]"
          >
            <span>CLOSE</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center max-w-7xl mx-auto w-full px-6 md:px-12 my-auto py-6">
        {/* Left Column: Huge Title + Stats Grid */}
        <div className="lg:col-span-7 space-y-8 pointer-events-auto">
          {/* Huge Script Title with character spans for letter walk animation */}
          <h2
            id={`achievement-title-${item.id}`}
            ref={titleRef}
            className={`tracking-tight leading-none text-[#FFF4E0] font-bold whitespace-nowrap ${
              item.title.length > 10
                ? 'text-5xl sm:text-6xl md:text-7xl lg:text-8xl'
                : 'text-6xl sm:text-7xl md:text-8xl lg:text-9xl'
            }`}
            style={{ fontFamily: item.fontFamily }}
          >
            {item.title.split('').map((char, index) => (
              <span key={index} className="inline-block title-char">
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h2>

          {/* Giant Stat Numbers Grid */}
          {item.stats.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-white/10">
              {item.stats.map((stat, sIdx) => {
                const parsed = parseStatValue(stat.value);
                const currentNum = statCounts[sIdx] ?? 0;

                const displayValue = parsed
                  ? `${parsed.prefix}${currentNum}${parsed.suffix}`
                  : stat.value;

                return (
                  <div key={`${item.id}-stat-${sIdx}`} className="space-y-1">
                    {/* Screen Reader Sentence */}
                    <span className="sr-only">
                      {stat.value} {stat.label}
                    </span>

                    {/* Visual Count-Up Number */}
                    <p
                      aria-hidden="true"
                      className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#FFF4E0] font-display"
                    >
                      {displayValue}
                    </p>

                    {stat.label ? (
                      <p aria-hidden="true" className="text-xs font-mono text-[#A89880] uppercase tracking-wider">
                        {stat.label}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}

          {/* Optional Single Line Text */}
          {item.line && (
            <p className="font-mono text-sm sm:text-base text-[#F2E9D8]/90 tracking-wide border-l-2 border-[#E0A93B] pl-4 py-1">
              {item.line}
            </p>
          )}
        </div>

        {/* Right Column: Contained Photo Stage */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end pointer-events-auto">
          {currentPhoto && !currentPhoto.isWide ? (
            <div
              ref={photoCardRef}
              className="relative max-h-[70vh] aspect-auto rounded-2xl overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.9)] border border-white/20"
            >
              <picture className="w-full h-full block">
                {currentPhoto.variants[1920]?.avif && (
                  <source srcSet={currentPhoto.variants[1920].avif} type="image/avif" />
                )}
                {currentPhoto.variants[1920]?.webp && (
                  <source srcSet={currentPhoto.variants[1920].webp} type="image/webp" />
                )}
                <img
                  key={`photo-${currentPhoto.id}`}
                  src={currentPhoto.originalPath}
                  alt={currentPhoto.alt}
                  className="max-h-[70vh] w-auto object-contain filter brightness-[1.05] contrast-[1.02]"
                  style={{
                    objectPosition: `${currentPhoto.focalPoint[0] * 100}% ${currentPhoto.focalPoint[1] * 100}%`,
                    transform: `scale(${currentPhoto.zoom})`,
                  }}
                />
              </picture>
            </div>
          ) : photos.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 text-center space-y-3 max-w-xs">
              <span className="text-3xl text-[#E0A93B]">✦</span>
              <p className="font-mono text-xs text-white/50 uppercase tracking-widest">
                ARCHIVE RECORD
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Photo Navigation Controls & Progress Dashes */}
      <div className="relative z-10 p-6 md:p-12 flex items-center justify-between pointer-events-auto">
        {photos.length > 1 ? (
          <>
            {/* Previous Photo Button */}
            <button
              onClick={() => setActivePhotoIdx((prev) => (prev - 1 + photos.length) % photos.length)}
              type="button"
              aria-label="Previous photo"
              className="p-3 rounded-full bg-white/5 border border-white/10 hover:border-[#E0A93B] text-white/80 hover:text-[#E0A93B] transition-all focus:outline-none focus:ring-2 focus:ring-[#E0A93B]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Progress Dashes */}
            <div className="flex items-center space-x-2">
              {photos.map((p, pIdx) => (
                <button
                  key={`dash-${p.id}`}
                  onClick={() => setActivePhotoIdx(pIdx)}
                  type="button"
                  aria-label={`Go to photo ${pIdx + 1}`}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    pIdx === activePhotoIdx ? 'w-8 bg-[#E0A93B]' : 'w-3 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>

            {/* Next Photo Button */}
            <button
              onClick={() => setActivePhotoIdx((prev) => (prev + 1) % photos.length)}
              type="button"
              aria-label="Next photo"
              className="p-3 rounded-full bg-white/5 border border-white/10 hover:border-[#E0A93B] text-white/80 hover:text-[#E0A93B] transition-all focus:outline-none focus:ring-2 focus:ring-[#E0A93B]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        ) : (
          <div className="w-full" />
        )}
      </div>
    </div>
  );
};

'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { AchievementItem, AchievementPhoto } from '@/content/achievements';
import manifestData from '../../../public/images/achievements/manifest.json';

const manifest = manifestData as Record<
  string,
  {
    photos: Omit<AchievementPhoto, 'alt'>[];
    preblurredBackdrop: string | null;
  }
>;

interface AchievementDetailModalProps {
  item: AchievementItem;
  originRect: DOMRect | null;
  onClose: () => void;
  triggerElement: HTMLElement | null;
}

export const AchievementDetailModal: React.FC<AchievementDetailModalProps> = ({
  item,
  originRect,
  onClose,
  triggerElement,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const backdropImgRef = useRef<HTMLImageElement>(null);

  const discData = manifest[item.folderName] || { photos: [], preblurredBackdrop: null };
  const rawPhotos = discData.photos || [];

  const photos: AchievementPhoto[] = rawPhotos.map((p, idx) => ({
    ...p,
    alt: `${item.title} photo ${idx + 1}`,
  }));

  const [activeIndex, setActiveIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isTypewriterDone, setIsTypewriterDone] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Check reduced motion
  useEffect(() => {
    try {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setIsReducedMotion(mq.matches);
    } catch {}
  }, []);

  // Shared-element FLIP transition on mount
  useEffect(() => {
    if (isReducedMotion || !originRect || !titleRef.current) return;

    const titleEl = titleRef.current;
    const currentRect = titleEl.getBoundingClientRect();

    const deltaX = originRect.left + originRect.width / 2 - (currentRect.left + currentRect.width / 2);
    const deltaY = originRect.top + originRect.height / 2 - (currentRect.top + currentRect.height / 2);
    const scale = originRect.height / currentRect.height;

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

    if (stackRef.current && photos.length > 0) {
      gsap.fromTo(
        stackRef.current.children,
        {
          x: deltaX * 0.4,
          y: deltaY * 0.4 + 40,
          scale: 0.5,
          opacity: 0,
        },
        {
          x: 0,
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 0.7,
          stagger: 0.08,
          delay: 0.15,
          ease: 'power3.out',
        }
      );
    }
  }, [originRect, isReducedMotion, photos.length]);

  // Focus trap & Focus return
  useEffect(() => {
    const prevActiveElement = triggerElement || (document.activeElement as HTMLElement);

    // Initial focus on Close button
    setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      } else if (e.key === 'ArrowRight' && photos.length > 1) {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % photos.length);
      } else if (e.key === 'ArrowLeft' && photos.length > 1) {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + photos.length) % photos.length);
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

  // Typewriter effect
  useEffect(() => {
    if (isReducedMotion) {
      setTypedText(item.summary);
      setIsTypewriterDone(true);
      return;
    }

    let idx = 0;
    setTypedText('');
    setIsTypewriterDone(false);

    const interval = setInterval(() => {
      if (idx < item.summary.length) {
        setTypedText(item.summary.slice(0, idx + 1));
        idx++;
      } else {
        setIsTypewriterDone(true);
        clearInterval(interval);
      }
    }, 24);

    return () => clearInterval(interval);
  }, [item.summary, isReducedMotion]);

  const completeTypewriter = () => {
    if (!isTypewriterDone) {
      setTypedText(item.summary);
      setIsTypewriterDone(true);
    }
  };

  // Parallax on Mouse move (gentle tilt/translation for photos)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isReducedMotion) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const nx = (clientX / innerWidth - 0.5) * 2; // -1 to 1
    const ny = (clientY / innerHeight - 0.5) * 2;
    setParallax({ x: nx * 12, y: ny * 12 });
  };

  // Touch Handlers for swipe down to close or horizontal photo switch
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

    // Swipe Down (dy > 100) -> Close
    if (dy > 100 && Math.abs(dy) > Math.abs(dx)) {
      handleClose();
    }
    // Horizontal swipe -> photo cycle
    else if (Math.abs(dx) > 50 && photos.length > 1) {
      if (dx < 0) {
        setActiveIndex((prev) => (prev + 1) % photos.length);
      } else {
        setActiveIndex((prev) => (prev - 1 + photos.length) % photos.length);
      }
    }
  };

  // Handle Animated Closing
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

  // Preload top photo hover variant
  const topPhoto = photos[activeIndex];
  const backdropSrc = discData.preblurredBackdrop;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`achievement-title-${item.id}`}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 z-50 flex flex-col justify-between p-6 md:p-12 text-[#F2E9D8] select-none overflow-y-auto"
      style={{ backgroundColor: '#0C0907' }}
    >
      {/* STEP 3: AMBIENT PRE-BLURRED PHOTO BACKDROP */}
      {backdropSrc ? (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <img
            ref={backdropImgRef}
            src={backdropSrc}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover scale-110 filter brightness-[0.45] saturate-150 transition-opacity duration-700"
          />
        </div>
      ) : null}

      {/* Gold Radial Glow */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(circle at 70% 50%, rgba(224, 169, 59, 0.12) 0%, rgba(12, 9, 7, 0.85) 60%, rgba(12, 9, 7, 0.98) 100%)',
        }}
      />

      {/* SVG Noise Film Grain Overlay */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.04]">
        <svg className="w-full h-full">
          <filter id="detail-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
          </filter>

          <rect width="100%" height="100%" filter="url(#detail-noise)" />
        </svg>
      </div>

      {/* Backdrop Click Dismissal Target */}
      <div
        onClick={handleClose}
        className="absolute inset-0 z-0 cursor-pointer"
        aria-hidden="true"
        title="Click background to close"
      />

      {/* Header Controls Bar */}
      <div className="relative z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-3">
          <span className="w-2 h-2 rounded-full bg-[#E0A93B]" />
          <p className="text-xs font-mono tracking-[0.25em] text-[#E0A93B] uppercase">
            {item.category} / DETAIL
          </p>
        </div>

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

      {/* Main Grid Content Layout */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center max-w-7xl mx-auto w-full my-auto py-8">
        {/* Left Column: Enormous Title + Concise Text */}
        <div className="lg:col-span-6 space-y-6">
          <h2
            id={`achievement-title-${item.id}`}
            ref={titleRef}
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight leading-none text-[#FFF4E0] font-bold"
            style={{ fontFamily: item.fontFamily }}
          >
            {item.title}
          </h2>

          <div
            onClick={completeTypewriter}
            className="cursor-pointer group relative p-6 md:p-8 rounded-2xl bg-[#17110C]/80 border border-white/10 backdrop-blur-xl shadow-2xl transition-border duration-300 hover:border-[#E0A93B]/30"
          >
            {/* Screen Reader Full Accessible Text */}
            <p className="sr-only">{item.summary}</p>

            {/* Visual Typewriter Text */}
            <p
              aria-hidden="true"
              className="font-mono text-base sm:text-lg md:text-xl text-[#F2E9D8] leading-relaxed min-h-[6rem]"
            >
              {typedText}
              {!isTypewriterDone && (
                <span className="inline-block w-2.5 h-5 bg-[#E0A93B] ml-1.5 animate-pulse align-middle" />
              )}
            </p>

            {!isTypewriterDone && (
              <span className="text-[10px] font-mono text-[#E0A93B]/60 tracking-wider uppercase block mt-3">
                Tap text to reveal all
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Photo Stack OR Text-Only Layout */}
        <div className="lg:col-span-6 relative flex flex-col items-center justify-center min-h-[360px] md:min-h-[460px]">
          {photos.length > 0 ? (
            <div
              ref={stackRef}
              className="relative w-full max-w-[420px] aspect-[3/4] flex items-center justify-center transition-transform duration-300 ease-out"
              style={{
                transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)`,
              }}
            >
              {photos.map((photo, idx) => {
                // Stack positioning math: index relative to activeIndex
                const offset = (idx - activeIndex + photos.length) % photos.length;
                const isTop = offset === 0;
                const seedRotation = idx % 2 === 0 ? -4 : 4;
                const rotateDeg = isTop ? seedRotation : seedRotation + offset * 3;
                const scale = 1 - offset * 0.06;
                const translateY = offset * 14;

                const webpVariant = photo.variants['640']?.webp || photo.originalPath;
                const avifVariant = photo.variants['640']?.avif;

                return (
                  <div
                    key={photo.id}
                    onClick={() => {
                      if (photos.length > 1) {
                        setActiveIndex((prev) => (prev + 1) % photos.length);
                      }
                    }}
                    className={`absolute inset-0 rounded-2xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.85)] border border-white/15 transition-all duration-500 cursor-pointer ${
                      isTop ? 'z-30 hover:scale-[1.02] hover:border-[#E0A93B]/50' : 'z-10 pointer-events-none'
                    }`}
                    style={{
                      transform: `translateY(${translateY}px) rotate(${rotateDeg}deg) scale(${scale})`,
                      opacity: offset > 2 ? 0 : 1 - offset * 0.2,
                      backgroundImage: `url(${photo.blurDataURL})`,
                      backgroundSize: 'cover',
                    }}
                  >
                    <picture className="w-full h-full block">
                      {avifVariant && <source srcSet={avifVariant} type="image/avif" />}
                      {webpVariant && <source srcSet={webpVariant} type="image/webp" />}
                      <img
                        src={photo.originalPath}
                        alt={photo.alt}
                        className="w-full h-full object-cover object-center"
                        loading={isTop ? 'eager' : 'lazy'}
                      />
                    </picture>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  </div>
                );
              })}

              {/* Counter Indicator */}
              {photos.length > 1 && (
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-40 px-3 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md text-xs font-mono text-[#E0A93B]">
                  {activeIndex + 1} / {photos.length}
                </div>
              )}
            </div>
          ) : (
            /* Intentional Text-Only Layout when no photos exist */
            <div className="w-full max-w-md p-8 rounded-3xl bg-white/[0.02] border border-white/10 text-center space-y-4">
              <span className="text-4xl text-[#E0A93B] block">✦</span>
              <h3 className="font-mono text-sm tracking-[0.2em] text-[#E0A93B] uppercase">
                {item.subtitle}
              </h3>
              <p className="font-mono text-xs text-white/40 leading-relaxed max-w-xs mx-auto">
                Discipline records & archives held in physical trophies and certificates.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Controls & Instructions */}
      <div className="relative z-10 flex items-center justify-between text-xs font-mono text-white/40 border-t border-white/5 pt-4">
        <span>SWIPE DOWN OR PRESS ESC TO CLOSE</span>
        {photos.length > 1 && <span>USE ARROW KEYS OR TAP PHOTO TO CYCLE</span>}
      </div>
    </div>
  );
};

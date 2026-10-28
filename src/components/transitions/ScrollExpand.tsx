'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import './ScrollExpand.css';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const smoothstep = (start: number, end: number, value: number) => {
  const t = clamp((value - start) / (end - start || 1), 0, 1);
  return t * t * (3 - 2 * t);
};

export interface ScrollExpandProps {
  id?: string;
  src?: string;
  mediaType?: 'image' | 'video' | 'none';
  poster?: string;
  alt?: string;
  title?: string;
  scrollHint?: string;
  startWidth?: number;
  startHeight?: number;
  startRadius?: number;
  endRadius?: number;
  mediaZoom?: number;
  scrollDistance?: number;
  holdDistance?: number;
  contentDistance?: number;
  smoothing?: number;
  overlayScrim?: number;
  useWindowScroll?: boolean;
  enabled?: boolean;
  onContentProgress?: (progress: number) => void;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function ScrollExpand({
  id,
  src,
  mediaType = 'image',
  poster,
  alt = '',
  title,
  scrollHint,
  startWidth = 42,
  startHeight = 50,
  startRadius = 24,
  endRadius = 0,
  mediaZoom = 1.35,
  scrollDistance = 1.15,
  holdDistance = 0.3,
  contentDistance = 0,
  smoothing = 0.08,
  overlayScrim = 0.45,
  useWindowScroll = false,
  enabled = true,
  onContentProgress,
  children,
  className = '',
  style,
}: ScrollExpandProps) {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const stage = stageRef.current;
    const frame = frameRef.current;
    if (!root || !track || !stage || !frame) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = motionQuery.matches;
    let raf = 0;
    let current = 0;
    let target = 0;
    let initialWidth = startWidth;
    let initialHeight = startHeight;

    const applyProgress = (progress: number) => {
      // The frame is the animation target. Media is optional, including in
      // background-only mode; its absence must never stop the expansion.
      const width = smoothstep(0, 0.78, progress);
      const height = smoothstep(0.18, 1, progress);
      const radius = smoothstep(0.1, 1, progress);
      const widthInset = (100 - (initialWidth + (100 - initialWidth) * width)) / 2;
      const heightInset = (100 - (initialHeight + (100 - initialHeight) * height)) / 2;
      const corner = startRadius + (endRadius - startRadius) * radius;

      frame.style.clipPath = reducedMotion
        ? 'inset(0% 0% 0% 0% round 0px)'
        : `inset(${heightInset}% ${widthInset}% ${heightInset}% ${widthInset}% round ${corner}px)`;

      if (mediaRef.current) {
        const zoom = mediaZoom + (1 - mediaZoom) * smoothstep(0, 1, progress);
        mediaRef.current.style.transform = reducedMotion ? 'none' : `scale(${zoom})`;
      }
      if (scrimRef.current) {
        scrimRef.current.style.opacity = reducedMotion ? '0' : `${overlayScrim * progress}`;
      }
      if (titleRef.current) {
        const fade = smoothstep(0.32, 0.84, progress);
        titleRef.current.style.opacity = reducedMotion ? '1' : `${1 - fade}`;
        titleRef.current.style.transform = reducedMotion
          ? 'none'
          : `translate3d(0, ${-18 * fade}px, 0) scale(${1 + 0.05 * fade})`;
      }
      if (hintRef.current) {
        hintRef.current.style.opacity = reducedMotion ? '0' : `${1 - smoothstep(0, 0.1, progress)}`;
      }
      if (overlayRef.current) {
        if (contentDistance <= 0) {
          overlayRef.current.style.opacity = reducedMotion
            ? '1'
            : `${smoothstep(0.7, 1, progress)}`;
        }
      }
    };

    const readContentProgress = () => {
      if (contentDistance <= 0) return 0;
      const viewHeight = Math.max(1, window.innerHeight);
      const scrolled = useWindowScroll ? -track.getBoundingClientRect().top : root.scrollTop;
      const start = reducedMotion ? viewHeight * 0.3 : viewHeight * (scrollDistance + holdDistance);
      const distance = viewHeight * Math.max(0.01, contentDistance - (reducedMotion ? 0.3 : 0));
      return clamp((scrolled - start) / distance, 0, 1);
    };

    const updateContent = () => {
      if (contentDistance <= 0) return;
      const progress = readContentProgress();
      if (overlayRef.current) {
        const reveal = smoothstep(0, 0.025, progress);
        const exit = 1 - smoothstep(0.93, 1, progress);
        overlayRef.current.style.opacity = `${reveal * exit}`;
      }
      if (reducedMotion && titleRef.current) {
        titleRef.current.style.opacity = `${1 - smoothstep(0, 0.035, progress)}`;
      }
      onContentProgress?.(progress);
    };

    const measure = () => {
      const viewHeight = Math.max(1, window.innerHeight);
      initialWidth = window.innerWidth <= 600 ? 86 : window.innerWidth <= 900 ? 62 : startWidth;
      initialHeight = window.innerWidth <= 600 ? 46 : startHeight;
      stage.style.height = `${viewHeight}px`;
      track.style.height = reducedMotion
        ? `${viewHeight * (1 + Math.max(0, contentDistance))}px`
        : `${viewHeight * (1 + Math.max(0, scrollDistance) + Math.max(0, holdDistance) + Math.max(0, contentDistance))}px`;
    };

    const readProgress = () => {
      if (!enabled) return 1;
      if (reducedMotion) return 0;
      const span = Math.max(1, window.innerHeight * Math.max(0.01, scrollDistance));
      return useWindowScroll
        ? clamp(-track.getBoundingClientRect().top / span, 0, 1)
        : clamp(root.scrollTop / span, 0, 1);
    };

    const tick = () => {
      const factor = smoothing <= 0 ? 1 : 1 - Math.exp(-1 / (60 * smoothing));
      current += (target - current) * factor;
      if (Math.abs(target - current) < 0.0004) current = target;
      applyProgress(current);
      raf = current === target ? 0 : requestAnimationFrame(tick);
    };

    const onScroll = () => {
      target = readProgress();
      if (reducedMotion || smoothing <= 0) {
        current = target;
        applyProgress(current);
      } else if (!raf) {
        raf = requestAnimationFrame(tick);
      }
      updateContent();
    };

    const onResize = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      measure();
      current = readProgress();
      target = current;
      applyProgress(current);
      updateContent();
    };

    const onMotionChange = () => {
      reducedMotion = motionQuery.matches;
      root.dataset.reducedMotion = String(reducedMotion);
      onResize();
    };

    root.dataset.reducedMotion = String(reducedMotion);
    onResize();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    motionQuery.addEventListener('change', onMotionChange);
    const observer = new ResizeObserver(onResize);
    observer.observe(root);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      observer.disconnect();
      motionQuery.removeEventListener('change', onMotionChange);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
    };
  }, [
    startWidth,
    startHeight,
    startRadius,
    endRadius,
    mediaZoom,
    scrollDistance,
    holdDistance,
    contentDistance,
    smoothing,
    overlayScrim,
    useWindowScroll,
    enabled,
    onContentProgress,
  ]);

  const media =
    mediaType === 'none' || !src ? null : mediaType === 'video' ? (
      <video
        ref={mediaRef as React.RefObject<HTMLVideoElement>}
        className="scroll-expand__media"
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
    ) : (
      // The reusable component intentionally retains image and video support.
      // biome-ignore lint/performance/noImgElement: This component animates the media element directly.
      <img
        ref={mediaRef as React.RefObject<HTMLImageElement>}
        className="scroll-expand__media"
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    );

  return (
    <section
      ref={rootRef}
      id={id}
      className={`scroll-expand ${useWindowScroll ? '' : 'scroll-expand--own-scroll'} ${contentDistance > 0 ? 'scroll-expand--with-content' : ''} ${className}`.trim()}
      style={style}
      aria-label={title || 'Scroll expand transition'}
    >
      <div ref={trackRef} className="scroll-expand__track">
        <div ref={stageRef} className="scroll-expand__stage">
          <div ref={frameRef} className="scroll-expand__frame">
            {media}
            {media && <div ref={scrimRef} className="scroll-expand__scrim" aria-hidden="true" />}
            {title && (
              <h2 ref={titleRef} className="scroll-expand__title">
                {title}
              </h2>
            )}
            {children && (
              <div ref={overlayRef} className="scroll-expand__overlay">
                {children}
              </div>
            )}
          </div>
          {scrollHint && (
            <p ref={hintRef} className="scroll-expand__hint" aria-hidden="true">
              {scrollHint}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

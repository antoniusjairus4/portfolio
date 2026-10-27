'use client';

import { type CSSProperties, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import './EchoText.css';

type Direction = 'right' | 'left' | 'up' | 'down' | 'diagonal';
type Mode = 'entrance' | 'pointer' | 'both';
type Trail = 'pointer' | 'auto' | 'scroll';
type Ease = 'linear' | 'ease-out' | 'ease-in-out' | 'snappy';
type EchoStyle = 'solid' | 'outline';
type Vector = { x: number; y: number };

export interface EchoTextProps {
  text?: string;
  echoes?: number;
  lag?: number;
  offset?: number;
  direction?: Direction;
  fade?: number;
  blur?: number;
  tint?: string | false;
  echoColors?: [string, string];
  echoStyle?: EchoStyle;
  echoScale?: number;
  mode?: Mode;
  trail?: Trail;
  clickBurst?: boolean;
  cursorRadius?: number;
  duration?: number;
  ease?: Ease;
  fontSize?: string | number;
  fontWeight?: string | number;
  color?: string;
  className?: string;
  style?: CSSProperties;
}

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const directionVectors: Record<Direction, Vector> = {
  right: { x: 1, y: 0 },
  left: { x: -1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  diagonal: { x: 0.72, y: 0.72 },
};

const easing: Record<Ease, (progress: number) => number> = {
  linear: (progress) => progress,
  'ease-out': (progress) => 1 - (1 - progress) ** 3,
  'ease-in-out': (progress) =>
    progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2,
  snappy: (progress) => 1 - (1 - progress) ** 5,
};

const DRIFT_PERIOD = 7200;
const DRIFT_IDLE = 2600;

function readScroll(target: Document | Element): [number, number] {
  return target instanceof Element
    ? [target.scrollLeft || 0, target.scrollTop || 0]
    : [window.scrollX, window.scrollY];
}

export default function EchoText({
  text = 'Motion Echo',
  echoes = 12,
  lag = 0.24,
  offset = 36,
  direction = 'right',
  fade = 0.72,
  blur = 3,
  tint = '#7dd3fc',
  echoColors,
  echoStyle = 'solid',
  echoScale = 1,
  mode = 'both',
  trail = 'pointer',
  clickBurst = true,
  cursorRadius = 320,
  duration = 900,
  ease = 'ease-out',
  fontSize = 'clamp(3rem, 9vw, 7rem)',
  fontWeight = 800,
  color = 'currentColor',
  className = '',
  style,
}: EchoTextProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const copyRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const echoCount = prefersReducedMotion ? 0 : clamp(Math.round(echoes), 0, 24);
  const echoIndexes = useMemo(
    () => Array.from({ length: echoCount }, (_, index) => echoCount - index),
    [echoCount],
  );

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefersReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion || echoCount === 0) return;

    const vector = directionVectors[direction];
    const safeOffset = clamp(Number(offset) || 0, 0, 120);
    const safeLag = clamp(Number(lag) || 0.16, 0.02, 0.5);
    const safeFade = clamp(Number(fade) || 0.64, 0.1, 0.95);
    const safeBlur = clamp(Number(blur) || 0, 0, 16);
    const safeScale = clamp(Number(echoScale) || 1, 0.25, 2.5);
    const safeRadius = clamp(Number(cursorRadius) || 320, 40, 1200);
    const safeDuration = Math.max(0, Number(duration) || 0);
    const entranceEnabled = mode === 'entrance' || mode === 'both';
    const liveEnabled = mode === 'pointer' || mode === 'both';
    const scrollEnabled = liveEnabled && trail === 'scroll';
    const autoEnabled = liveEnabled && trail === 'auto';
    const pointerEnabled =
      liveEnabled &&
      trail === 'pointer' &&
      matchMedia('(hover: hover) and (pointer: fine)').matches;
    const easeFunction = easing[ease];
    const shiftLimit = safeOffset * 4;
    let frame = 0;
    let lastTime = 0;
    let startTime = performance.now();
    let targetX = 0;
    let targetY = 0;
    let velocityX = 0;
    let velocityY = 0;
    let pushX = 0;
    let pushY = 0;
    let phase = 0;
    let pointerTime = -Infinity;
    const positions = Array.from({ length: echoCount + 1 }, (_, index) => ({
      x: entranceEnabled ? vector.x * safeOffset * (index + 0.35) : 0,
      y: entranceEnabled ? vector.y * safeOffset * (index + 0.35) : 0,
    }));
    const scrollMemory = new WeakMap<Document | Element, [number, number]>();

    for (let index = 1; index <= echoCount; index += 1) {
      const copy = copyRefs.current[index];
      if (copy) {
        copy.style.filter = safeBlur
          ? `blur(${((safeBlur * index) / echoCount).toFixed(2)}px)`
          : 'none';
      }
    }

    const render = (now: number) => {
      frame = 0;
      const delta = lastTime ? clamp(now - lastTime, 0, 64) : 16.67;
      const step = delta / 16.67;
      lastTime = now;
      const entranceProgress = safeDuration ? clamp((now - startTime) / safeDuration, 0, 1) : 1;
      const entranceRest = entranceEnabled ? 1 - easeFunction(entranceProgress) : 0;

      if (autoEnabled && now - pointerTime > DRIFT_IDLE) {
        phase += (delta / DRIFT_PERIOD) * Math.PI * 2;
        targetX = Math.sin(phase) * safeOffset * 0.42;
        targetY = Math.sin(phase) * Math.cos(phase) * safeOffset * 0.34;
      }

      if (scrollEnabled) {
        const blend = 1 - 0.7 ** step;
        velocityX += (pushX / Math.max(step, 0.25) - velocityX) * blend;
        velocityY += (pushY / Math.max(step, 0.25) - velocityY) * blend;
        pushX = 0;
        pushY = 0;
        velocityX *= 0.9 ** step;
        velocityY *= 0.9 ** step;
      }

      let unsettled = entranceProgress < 1 || Math.hypot(velocityX, velocityY) > 0.04;
      for (let index = 0; index <= echoCount; index += 1) {
        const copy = copyRefs.current[index];
        const current = positions[index];
        if (!copy || !current) continue;
        const depth = echoCount ? index / echoCount : 0;
        const entranceAmount = entranceRest * safeOffset * (index + 0.35);
        const desiredX =
          targetX +
          vector.x * entranceAmount +
          clamp(-velocityX * 3.2, -shiftLimit, shiftLimit) * depth;
        const desiredY =
          targetY +
          vector.y * entranceAmount +
          clamp(-velocityY * 3.2, -shiftLimit, shiftLimit) * depth;
        const blend = 1 - (1 - clamp(0.34 / (1 + index * safeLag * 4.2), 0.018, 0.36)) ** step;
        current.x += (desiredX - current.x) * blend;
        current.y += (desiredY - current.y) * blend;
        unsettled ||= Math.abs(desiredX - current.x) + Math.abs(desiredY - current.y) > 0.05;
        const scale = 1 + (safeScale - 1) * depth;
        copy.style.transform = `translate3d(${current.x.toFixed(3)}px, ${current.y.toFixed(3)}px, 0) scale(${scale.toFixed(4)})`;
        if (index > 0) {
          const activity = Math.max(
            entranceRest,
            clamp(Math.hypot(velocityX, velocityY) / 5, 0, 1),
            pointerEnabled || autoEnabled ? 1 : 0,
          );
          copy.style.opacity = String(safeFade ** index * activity);
        }
      }

      if (autoEnabled || pointerEnabled || unsettled) frame = requestAnimationFrame(render);
    };

    const wake = () => {
      if (!frame) {
        lastTime = 0;
        frame = requestAnimationFrame(render);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      const deltaX = event.clientX - (rect.left + rect.width / 2);
      const deltaY = event.clientY - (rect.top + rect.height / 2);
      const distance = Math.max(1, Math.hypot(deltaX, deltaY));
      const reach = clamp(distance / safeRadius, 0, 1);
      targetX = (deltaX / distance) * reach * safeOffset;
      targetY = (deltaY / distance) * reach * safeOffset * 0.72;
      pointerTime = performance.now();
      wake();
    };

    const handlePointerOut = () => {
      targetX = 0;
      targetY = 0;
      wake();
    };

    const handleScroll = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Document) && !(target instanceof Element && target.contains(root)))
        return;
      const next = readScroll(target);
      const previous = scrollMemory.get(target);
      scrollMemory.set(target, next);
      if (!previous) return;
      pushX -= next[0] - previous[0];
      pushY -= next[1] - previous[1];
      wake();
    };

    const handleClick = () => {
      if (!clickBurst) return;
      startTime = performance.now();
      for (let index = 1; index <= echoCount; index += 1) {
        const angle = (index / echoCount) * Math.PI * 2;
        positions[index] = {
          x: Math.cos(angle) * safeOffset * 1.4,
          y: Math.sin(angle) * safeOffset * 0.8,
        };
      }
      wake();
    };

    if (pointerEnabled) {
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
      document.addEventListener('pointerout', handlePointerOut);
    }
    if (scrollEnabled) {
      scrollMemory.set(document, readScroll(document));
      document.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    }
    if (clickBurst) root.addEventListener('click', handleClick);
    render(startTime);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerout', handlePointerOut);
      document.removeEventListener('scroll', handleScroll, { capture: true });
      root.removeEventListener('click', handleClick);
    };
  }, [
    blur,
    clickBurst,
    cursorRadius,
    direction,
    duration,
    ease,
    echoCount,
    echoScale,
    fade,
    lag,
    mode,
    offset,
    prefersReducedMotion,
    trail,
  ]);

  const ramp = Array.isArray(echoColors) && echoColors.length === 2 ? echoColors : null;
  const echoColor = (index: number) => {
    if (ramp) {
      const depth = echoCount > 1 ? (index - 1) / (echoCount - 1) : 0;
      return `color-mix(in srgb, ${ramp[1]} ${Math.round(depth * 100)}%, ${ramp[0]})`;
    }
    return tint
      ? `color-mix(in srgb, ${tint} ${Math.min(72, 18 + index * 5)}%, currentColor)`
      : undefined;
  };
  const echoClass =
    echoStyle === 'outline' ? 'echo-text__echo echo-text__echo--outline' : 'echo-text__echo';

  return (
    <span
      ref={rootRef}
      className={`echo-text ${className}`.trim()}
      style={{ fontSize, fontWeight, color, cursor: clickBurst ? 'pointer' : undefined, ...style }}
    >
      {echoIndexes.map((index) => (
        <span
          aria-hidden="true"
          className={echoClass}
          data-echo-index={index}
          key={`echo-${index}`}
          ref={(element) => {
            copyRefs.current[index] = element;
          }}
          style={{ color: echoColor(index), opacity: 0 }}
        >
          {text}
        </span>
      ))}
      <span
        className="echo-text__echo echo-text__echo--front"
        data-echo-index="0"
        ref={(element) => {
          copyRefs.current[0] = element;
        }}
      >
        {text}
      </span>
    </span>
  );
}

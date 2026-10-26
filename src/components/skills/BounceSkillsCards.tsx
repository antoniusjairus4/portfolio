'use client';

import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { skillCategories } from '@/content/skills';
import './bounce-skills.css';

type Slot = { x: number; y: number; rotate: number };
type Body = {
  x: number;
  y: number;
  z: number;
  rotate: number;
  scale: number;
  vx: number;
  vy: number;
  vz: number;
  vr: number;
  vs: number;
};

function distanceLabel(distance: number) {
  if (distance === 1) return 'near';
  if (distance === 2) return 'middle';
  return 'far';
}

function step(
  value: number,
  velocity: number,
  target: number,
  stiffness: number,
  damping: number,
  dt: number,
): [number, number] {
  const next = velocity + ((target - value) * stiffness - velocity * damping) * dt;
  return [value + next * dt, next];
}

export function BounceSkillsCards() {
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const wakeRef = useRef<(() => void) | null>(null);
  const kickRef = useRef<((index: number) => void) | null>(null);
  const interaction = useRef({ hovered: -1, selected: 2 });
  const [viewportWidth, setViewportWidth] = useState(1280);

  useEffect(() => {
    const update = () => setViewportWidth(window.innerWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const compact = viewportWidth < 700;
  const cardWidth = compact
    ? Math.min(232, viewportWidth * 0.6)
    : Math.min(360, viewportWidth * 0.32);
  const cardHeight = compact ? 378 : 485;
  const spread = compact
    ? Math.min(29, viewportWidth * 0.072)
    : Math.min(150, Math.max(95, viewportWidth * 0.105));
  const pushDistance = compact ? 12 : 66;
  const slots = useMemo(() => {
    const middle = (skillCategories.length - 1) / 2;
    return skillCategories.map((_, index): Slot => {
      const offset = index - middle;
      return {
        x: offset * spread,
        y: (compact ? 15 : 32) * (offset / middle) ** 2,
        rotate: (compact ? 4.5 : 7.5) * (offset / middle),
      };
    });
  }, [compact, spread]);
  const settingsRef = useRef({ slots, cardWidth, pushDistance, compact });
  settingsRef.current = { slots, cardWidth, pushDistance, compact };

  // The spring integration and staggered pop are adapted from the supplied React Bits BounceCards.
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const bodies: Body[] = [];
    let raf = 0;
    let last = performance.now();
    let time = 0;
    let layer = -2;
    let alive = true;

    const wake = () => {
      if (raf || !alive) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const frame = (now: number) => {
      raf = 0;
      if (!alive) return;
      const dt = Math.min(1 / 30, Math.max(1 / 240, (now - last) / 1000));
      last = now;
      time += dt;
      const {
        slots: currentSlots,
        cardWidth: width,
        pushDistance: push,
        compact: narrow,
      } = settingsRef.current;
      const focus =
        interaction.current.hovered >= 0
          ? interaction.current.hovered
          : interaction.current.selected;
      const popStiffness = 170;
      const popDamping = 2 * 0.74 * Math.sqrt(popStiffness);
      const moveStiffness = 210;
      const moveDamping = 2 * (reduce ? 1 : 0.84) * Math.sqrt(moveStiffness);
      const substeps = Math.ceil(dt / (1 / 240));
      const h = dt / substeps;
      let moving = 0;

      currentSlots.forEach((slot, index) => {
        const element = cardRefs.current[index];
        if (!element) return;
        if (!bodies[index]) {
          bodies[index] = {
            x: slot.x,
            y: slot.y,
            z: 0,
            rotate: slot.rotate,
            scale: reduce ? 1 : 0,
            vx: 0,
            vy: 0,
            vz: 0,
            vr: 0,
            vs: 0,
          };
        }
        const body = bodies[index];
        const appeared = reduce || time >= 0.08 + index * 0.075;
        const distance = Math.abs(index - focus);
        let targetX = slot.x;
        let targetY = slot.y;
        let targetZ = focus >= 0 ? (distance === 0 ? 24 : -Math.min(distance, 3) * 16) : 0;
        let targetRotate = slot.rotate;
        let targetScale = appeared ? 0.99 - Math.min(distance, 3) * 0.018 : 0;
        if (focus >= 0 && appeared) {
          if (index === focus) {
            targetX = narrow ? 0 : slot.x;
            targetY = slot.y - width * 0.04;
            targetRotate = 0;
            targetScale = 1.04;
          } else {
            targetX = slot.x + Math.sign(index - focus) * push;
            if (narrow) targetX -= currentSlots[focus].x * 0.4;
          }
        }
        if (!appeared) targetZ = 0;
        for (let substep = 0; substep < substeps; substep += 1) {
          [body.x, body.vx] = step(body.x, body.vx, targetX, moveStiffness, moveDamping, h);
          [body.y, body.vy] = step(body.y, body.vy, targetY, moveStiffness, moveDamping, h);
          [body.z, body.vz] = step(body.z, body.vz, targetZ, moveStiffness, moveDamping, h);
          [body.rotate, body.vr] = step(
            body.rotate,
            body.vr,
            targetRotate,
            moveStiffness,
            moveDamping,
            h,
          );
          if (reduce) {
            body.scale = targetScale;
            body.vs = 0;
          } else {
            [body.scale, body.vs] = step(
              body.scale,
              body.vs,
              targetScale,
              popStiffness,
              popDamping,
              h,
            );
          }
        }
        moving +=
          Math.abs(body.vx) +
          Math.abs(body.vy) +
          Math.abs(body.vz) +
          Math.abs(body.vr) +
          Math.abs(body.vs) * 100 +
          Math.abs(targetX - body.x) +
          Math.abs(targetY - body.y) +
          Math.abs(targetZ - body.z) +
          Math.abs(targetRotate - body.rotate) +
          Math.abs(targetScale - body.scale) * 100 +
          (appeared ? 0 : 1);
        element.style.transform = `translate(-50%, -50%) translate3d(${body.x.toFixed(2)}px, ${body.y.toFixed(2)}px, ${body.z.toFixed(2)}px) rotate(${body.rotate.toFixed(3)}deg) scale(${Math.max(0, body.scale).toFixed(4)})`;
      });

      if (layer !== focus) {
        layer = focus;
        cardRefs.current.forEach((element, index) => {
          if (!element) return;
          element.style.zIndex = index === focus ? '20' : String(10 - Math.abs(index - focus));
          element.toggleAttribute('data-active', index === focus);
          element.dataset.depth =
            index === focus ? 'active' : distanceLabel(Math.abs(index - focus));
        });
      }
      if (moving > 0.02) raf = requestAnimationFrame(frame);
    };

    wakeRef.current = wake;
    kickRef.current = (index) => {
      if (bodies[index] && !reduce) bodies[index].vs -= 0.9;
      wake();
    };
    wake();
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      wakeRef.current = null;
      kickRef.current = null;
    };
  }, []);

  useEffect(() => {
    wakeRef.current?.();
  });

  return (
    <div
      className="bounce-skills"
      style={
        {
          '--bounce-skill-width': `${cardWidth}px`,
          '--bounce-skill-height': `${cardHeight}px`,
        } as CSSProperties
      }
    >
      {skillCategories.map((category, index) => (
        <button
          key={category.key}
          ref={(node) => {
            cardRefs.current[index] = node;
          }}
          type="button"
          className="bounce-skills__card"
          data-category={category.key}
          aria-label={`${category.name}: ${category.skills.join(', ')}`}
          onPointerEnter={() => {
            interaction.current.hovered = index;
            wakeRef.current?.();
          }}
          onPointerLeave={() => {
            interaction.current.hovered = -1;
            wakeRef.current?.();
          }}
          onFocus={() => {
            interaction.current.hovered = index;
            wakeRef.current?.();
          }}
          onBlur={() => {
            interaction.current.hovered = -1;
            wakeRef.current?.();
          }}
          onClick={() => {
            interaction.current.selected = index;
            kickRef.current?.(index);
          }}
        >
          <span className="bounce-skills__topline">
            <span>{category.index} / 06</span>
            <span>ANTONIUS JAIRUS</span>
          </span>
          <span className="bounce-skills__title">{category.name}</span>
          <span className="bounce-skills__statement">{category.statement}</span>
          <span className="bounce-skills__rule" />
          <span className="bounce-skills__list">
            {category.skills.map((skill, skillIndex) => (
              <span className="bounce-skills__skill" key={skill}>
                <span>{String(skillIndex + 1).padStart(2, '0')}</span>
                <span>{skill}</span>
              </span>
            ))}
          </span>
          <span className="bounce-skills__footer">CAPABILITY LANDSCAPE</span>
        </button>
      ))}
    </div>
  );
}

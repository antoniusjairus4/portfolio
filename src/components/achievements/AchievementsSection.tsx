'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, { useEffect, useRef, useState } from 'react';
import { achievementsContent } from '@/content/achievements';

gsap.registerPlugin(ScrollTrigger);

export const AchievementsSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    try {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setIsReducedMotion(mq.matches);
    } catch {}
  }, []);

  // GSAP ScrollTrigger Entrance Animation for 5 Spatial Nodes
  useEffect(() => {
    if (!containerRef.current || isReducedMotion) return;

    const ctx = gsap.context(() => {
      itemsRef.current.forEach((el, idx) => {
        if (!el) return;

        gsap.fromTo(
          el,
          {
            scale: 0.4,
            opacity: 0,
            y: 50,
          },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 1.1,
            delay: idx * 0.12,
            ease: 'back.out(1.5)',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 65%',
            },
          }
        );

        // Continuous subtle floating animation per node (straight Y axis float)
        gsap.to(el, {
          y: `+=${idx % 2 === 0 ? 10 : -10}`,
          duration: 3 + idx * 0.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1.2 + idx * 0.2,
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [isReducedMotion]);

  return (
    <section
      id="achievements-section"
      ref={containerRef}
      className="relative w-full min-h-[100svh] bg-[#0C0907] text-[#F2E9D8] overflow-hidden flex flex-col justify-between p-6 md:p-12 select-none border-t border-white/5"
      style={{
        background:
          'radial-gradient(circle at 50% 50%, rgba(224, 169, 59, 0.05) 0%, rgba(12, 9, 7, 1) 80%)',
      }}
    >
      {/* Header Label */}
      <div className="relative z-10 flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.25em] font-mono text-[#E0A93B] opacity-80">
          CRAFT & DISCIPLINE / ACHIEVEMENTS
        </p>
        <span className="text-xs font-mono text-white/40">05 DISCIPLINES</span>
      </div>

      {/* Spatial 2D Diagram Layout Stage */}
      <div className="relative w-full flex-1 min-h-[70vh] my-4">
        {achievementsContent.map((item, idx) => {
          const isCenter = item.id === 'table-tennis';
          const isHovered = activeItem === item.id;

          return (
            <div
              key={item.id}
              ref={(el) => {
                itemsRef.current[idx] = el;
              }}
              onMouseEnter={() => setActiveItem(item.id)}
              onMouseLeave={() => setActiveItem(null)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-all duration-300"
              style={{
                top: item.position.top,
                left: item.position.left,
                transform: `translate(-50%, -50%) rotate(${item.rotationDeg}deg)`,
              }}
            >
              <div
                className="flex flex-col items-center text-center p-2 transition-all duration-300"
              >
                <span className="text-[11px] uppercase font-mono tracking-[0.2em] text-[#E0A93B] mb-2 opacity-80">
                  {item.category}
                </span>

                <h3
                  className={`tracking-tight leading-none ${
                    isCenter ? 'text-5xl md:text-8xl text-[#FFF4E0]' : 'text-4xl md:text-7xl text-[#F2E9D8]'
                  } group-hover:text-[#E0A93B] group-hover:scale-110 transition-all duration-300`}
                  style={{
                    fontFamily: item.fontFamily,
                  }}
                >
                  {item.title}
                </h3>

                <p className="text-xs md:text-sm font-mono opacity-60 mt-3 max-w-[16rem]">
                  {item.subtitle}
                </p>

                <span className="text-[9px] font-mono text-white/30 mt-1 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  FONT: {item.fontName}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="relative z-10 flex items-center justify-between text-xs font-mono opacity-40">
        <span>INTERACTIVE SPATIAL DIAGRAM</span>
        <span>HOVER TO EXPLORE</span>
      </div>
    </section>
  );
};

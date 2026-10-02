'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, { useEffect, useRef, useState } from 'react';
import LiquidEther from '@/components/backgrounds/LiquidEther';
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
      className="relative w-full h-screen min-h-[100vh] bg-black text-[#F2E9D8] overflow-hidden select-none border-t border-white/5"
      style={{
        background:
          'radial-gradient(circle at 50% 50%, rgba(224, 169, 59, 0.05) 0%, rgba(0, 0, 0, 1) 70%)',
      }}
    >
      {/* LiquidEther WebGL Fluid Simulation Background */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <LiquidEther
          colors={['#E0A93B', '#F5D061', '#9A6B1F']}
          mouseForce={12}
          cursorSize={90}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.25}
          autoIntensity={1.0}
          takeoverDuration={0.4}
          autoResumeDelay={3000}
          autoRampDuration={1.2}
        />
      </div>

      {/* Top Header Label */}
      <div className="absolute top-6 left-6 right-6 md:top-10 md:left-12 md:right-12 z-10 flex items-center justify-between pointer-events-none">
        <p className="text-xs uppercase tracking-[0.25em] font-mono text-[#E0A93B] opacity-80">
          CRAFT & DISCIPLINE / ACHIEVEMENTS
        </p>
        <span className="text-xs font-mono text-white/40">05 DISCIPLINES</span>
      </div>

      {/* Spatial Stage (5 Synchronized Positions: 4 Corners + Exact Center) */}
      <div className="relative z-10 w-full h-full pointer-events-none">
        {achievementsContent.map((item, idx) => {
          const isCenter = item.id === 'table-tennis';

          return (
            <div
              key={item.id}
              ref={(el) => {
                itemsRef.current[idx] = el;
              }}
              className="absolute pointer-events-auto"
              style={{
                top: item.position.top,
                left: item.position.left,
                transform: 'translate(-50%, -50%)', // Completely straight 0-deg rotation
              }}
            >
              <div className="flex flex-col items-center text-center p-2">
                <h3
                  className={`tracking-tight leading-none whitespace-nowrap ${
                    isCenter ? 'text-6xl md:text-8xl lg:text-9xl text-[#FFF4E0]' : 'text-4xl md:text-6xl lg:text-7xl text-[#F2E9D8]'
                  }`}
                  style={{
                    fontFamily: item.fontFamily,
                  }}
                >
                  {item.title}
                </h3>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};


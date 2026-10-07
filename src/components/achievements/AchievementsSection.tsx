'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, { useEffect, useRef, useState } from 'react';
import LiquidEther from '@/components/backgrounds/LiquidEther';
import CursorGrid from '@/components/backgrounds/CursorGrid';
import { achievementsContent, AchievementItem } from '@/content/achievements';
import { AchievementDetailModal } from './AchievementDetailModal';

gsap.registerPlugin(ScrollTrigger);

export const AchievementsSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  const [selectedItem, setSelectedItem] = useState<AchievementItem | null>(null);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const [triggerEl, setTriggerEl] = useState<HTMLElement | null>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    try {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setIsReducedMotion(mq.matches);
    } catch {}
  }, []);

  // GSAP ScrollTrigger Entrance & Float Animations for 5 Spatial Nodes
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

        // Continuous subtle floating animation per node
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

  const handleNodeClick = (item: AchievementItem, idx: number) => {
    const el = itemsRef.current[idx];
    if (el) {
      setOriginRect(el.getBoundingClientRect());
      setTriggerEl(el);
    } else {
      setOriginRect(null);
      setTriggerEl(null);
    }
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
    setOriginRect(null);
  };

  return (
    <section
      id="achievements-section"
      ref={containerRef}
      className="relative w-full h-screen min-h-[100vh] bg-[#0C0907] text-[#F2E9D8] overflow-hidden select-none border-t border-white/5"
      style={{
        background:
          'radial-gradient(circle at 50% 50%, rgba(224, 169, 59, 0.05) 0%, rgba(12, 9, 7, 1) 70%)',
      }}
    >
      {/* Golden Smoke Background Image Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/images/achievements/bg-fluid.png"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover opacity-80 filter brightness-110 contrast-105"
        />
      </div>

      {/* LiquidEther WebGL Fluid Simulation & CursorGrid Background (Paused when modal open) */}
      <div
        className={`absolute inset-0 z-0 pointer-events-auto transition-opacity duration-400 ${
          selectedItem ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {/* Interactive Cursor Grid Background */}
        <div className="absolute inset-0 z-0 opacity-40">
          <CursorGrid
            cellSize={70}
            color="#E0A93B"
            radius={150}
            falloff="smooth"
            holdTime={400}
            fadeDuration={800}
            lineWidth={1.2}
            maxOpacity={0.8}
            fillOpacity={0.08}
            gridOpacity={0.05}
            cellRadius={8}
            clickPulse
            pulseSpeed={600}
          />
        </div>

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
          paused={Boolean(selectedItem)}
        />
      </div>

      {/* Top Header Label */}
      <div className="absolute top-6 left-6 right-6 md:top-10 md:left-12 md:right-12 z-10 flex items-center justify-between pointer-events-none">
        <p className="text-xs uppercase tracking-[0.25em] font-mono text-[#E0A93B] opacity-80">
          CRAFT & DISCIPLINE / ACHIEVEMENTS
        </p>
        <span className="text-xs font-mono text-white/40">05 DISCIPLINES</span>
      </div>

      {/* Spatial Stage (5 Synchronized Node Positions) */}
      <div
        className={`relative z-10 w-full h-full pointer-events-none transition-opacity duration-500 ${
          selectedItem ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {achievementsContent.map((item, idx) => {
          const isCenter = item.id === 'table-tennis';

          return (
            <div
              key={item.id}
              ref={(el) => {
                itemsRef.current[idx] = el;
              }}
              onClick={() => handleNodeClick(item, idx)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleNodeClick(item, idx);
                }
              }}
              role="button"
              tabIndex={selectedItem ? -1 : 0}
              aria-label={`Open details for ${item.title}`}
              className="absolute pointer-events-auto cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E0A93B] rounded-xl p-2"
              style={{
                top: item.position.top,
                left: item.position.left,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="flex flex-col items-center text-center p-2">
                <h3
                  className={`tracking-tight leading-none whitespace-nowrap ${
                    isCenter
                      ? 'text-6xl md:text-8xl lg:text-9xl text-[#FFF4E0]'
                      : 'text-4xl md:text-6xl lg:text-7xl text-[#F2E9D8]'
                  } group-hover:text-[#E0A93B] transition-colors duration-300`}
                  style={{
                    fontFamily: item.fontFamily,
                  }}
                >
                  {item.title}
                </h3>
                <span className="text-[11px] font-mono text-white/40 uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {item.subtitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Overlay View Dialog for Selected Discipline */}
      {selectedItem && (
        <AchievementDetailModal
          item={selectedItem}
          disciplineIndex={achievementsContent.findIndex((a) => a.id === selectedItem.id)}
          totalDisciplines={achievementsContent.length}
          originRect={originRect}
          onClose={handleCloseModal}
          triggerElement={triggerEl}
        />
      )}
    </section>
  );
};

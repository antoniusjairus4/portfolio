'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import LiquidEther from '@/components/backgrounds/LiquidEther';
import CursorGrid from '@/components/backgrounds/CursorGrid';
import { achievementsContent, AchievementItem } from '@/content/achievements';
import { AchievementDetailModal } from './AchievementDetailModal';

gsap.registerPlugin(ScrollTrigger);

interface Point {
  x: number;
  y: number;
}

interface LineCoords {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  length: number;
}

export const AchievementsSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  const [selectedItem, setSelectedItem] = useState<AchievementItem | null>(null);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const [triggerEl, setTriggerEl] = useState<HTMLElement | null>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Constellation & Glow state
  const [lines, setLines] = useState<LineCoords[]>([]);
  const [centerPoint, setCenterPoint] = useState<Point>({ x: 0, y: 0 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [glowPos, setGlowPos] = useState<{ x: number; y: number } | null>(null);
  const [glowActive, setGlowActive] = useState(false);
  const [hasHoveredOnce, setHasHoveredOnce] = useState(false);
  const [showHint, setShowHint] = useState(true);

  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    try {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setIsReducedMotion(mq.matches);
    } catch {}
  }, []);

  // Compute SVG constellation endpoints based on bounding boxes
  const updateConstellation = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();

    const centerIdx = achievementsContent.findIndex((item) => item.id === 'table-tennis');
    const centerEl = itemsRef.current[centerIdx];
    if (!centerEl) return;

    const cRect = centerEl.getBoundingClientRect();
    const cx = cRect.left + cRect.width / 2 - containerRect.left;
    const cy = cRect.top + cRect.height / 2 - containerRect.top;
    setCenterPoint({ x: cx, y: cy });

    const newLines: LineCoords[] = [];

    achievementsContent.forEach((item, idx) => {
      if (item.id === 'table-tennis') return;
      const el = itemsRef.current[idx];
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const nodeX = rect.left + rect.width / 2 - containerRect.left;
      const nodeY = rect.top + rect.height / 2 - containerRect.top;

      // Vector toward center
      const dx = cx - nodeX;
      const dy = cy - nodeY;
      const dist = Math.hypot(dx, dy);

      if (dist === 0) return;

      // End line 90px short of center to avoid crossing text
      const shortenAmount = Math.min(90, dist * 0.35);
      const targetX = cx - (dx / dist) * shortenAmount;
      const targetY = cy - (dy / dist) * shortenAmount;

      const lineLen = Math.hypot(targetX - nodeX, targetY - nodeY);

      newLines.push({
        id: item.id,
        x1: nodeX,
        y1: nodeY,
        x2: targetX,
        y2: targetY,
        length: lineLen,
      });
    });

    setLines(newLines);
  }, []);

  useEffect(() => {
    updateConstellation();
    window.addEventListener('resize', updateConstellation);
    return () => window.removeEventListener('resize', updateConstellation);
  }, [updateConstellation]);

  // GSAP ScrollTrigger Entrance & Float Animations
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

  // Handle word hover & hint line timeout
  const handleMouseEnter = (item: AchievementItem, idx: number) => {
    setHoveredId(item.id);
    setHasHoveredOnce(true);
    setShowHint(false);

    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }

    const el = itemsRef.current[idx];
    if (el && containerRef.current) {
      const cRect = containerRef.current.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      setGlowPos({
        x: rect.left + rect.width / 2 - cRect.left,
        y: rect.top + rect.height / 2 - cRect.top,
      });
      setGlowActive(true);
    }
  };

  const handleMouseLeave = () => {
    setHoveredId(null);
    setGlowActive(false);

    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setShowHint(true);
    }, 4000);
  };

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
      className="relative w-full h-screen min-h-[100vh] bg-[#0C0907] text-[#F2E9D8] overflow-hidden select-none border-t border-white/5 font-sans"
      style={{
        background:
          'radial-gradient(circle at 50% 50%, rgba(217, 155, 38, 0.08) 0%, rgba(12, 9, 7, 1) 75%)',
      }}
    >
      {/* Full-Screen WebGL LiquidEther Fluid Simulation & CursorGrid Background */}
      <div
        className={`absolute inset-0 z-0 pointer-events-auto transition-opacity duration-700 ease-out ${
          selectedItem ? 'opacity-15' : 'opacity-100'
        }`}
      >
        {/* Film Grain & Edge Vignette Overlay */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none opacity-45 mix-blend-overlay"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, transparent 25%, rgba(10, 9, 8, 0.65) 70%, rgba(10, 9, 8, 0.95) 100%)',
          }}
        />

        {/* Local Hover Glow Bloom Layer */}
        <div
          className={`absolute pointer-events-none z-[1] rounded-full filter blur-3xl transition-all duration-500 ease-out mix-blend-screen ${
            glowActive ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
          style={{
            left: glowPos ? `${glowPos.x}px` : '50%',
            top: glowPos ? `${glowPos.y}px` : '50%',
            width: '420px',
            height: '420px',
            transform: 'translate(-50%, -50%)',
            background:
              hoveredId === 'table-tennis'
                ? 'radial-gradient(circle, rgba(217, 155, 38, 0.15) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(217, 155, 38, 0.35) 0%, transparent 70%)',
          }}
        />

        {/* Interactive Cursor Grid Background */}
        <div className="absolute inset-0 z-[1] opacity-100 pointer-events-none">
          <CursorGrid
            cellSize={70}
            color="#E0A93B"
            radius={200}
            falloff="smooth"
            holdTime={400}
            fadeDuration={800}
            lineWidth={1.2}
            maxOpacity={0.8}
            fillOpacity={0.2}
            gridOpacity={0.02}
            cellRadius={8}
            clickPulse
            pulseSpeed={600}
          />
        </div>

        <LiquidEther
          colors={['#0A0908', '#9A6318', '#F5B031', '#FFD275']}
          mouseForce={28}
          cursorSize={160}
          isViscous={true}
          viscous={45}
          iterationsViscous={40}
          iterationsPoisson={48}
          resolution={0.75}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.55}
          autoIntensity={3.5}
          takeoverDuration={0.3}
          autoResumeDelay={1500}
          autoRampDuration={0.8}
          backgroundColor="#0A0908"
        />
      </div>

      {/* FAINT CONSTELLATION OVERLAY LAYER (Option 3) */}
      <svg
        ref={svgRef}
        className={`absolute inset-0 z-[5] w-full h-full pointer-events-none transition-opacity duration-400 ${
          selectedItem ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <defs>
          <linearGradient id="constellation-pulse-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D99B26" stopOpacity="0" />
            <stop offset="50%" stopColor="#FFF4E6" stopOpacity="1" />
            <stop offset="100%" stopColor="#D99B26" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Thin background orbit arc around center */}
        {centerPoint.x > 0 && (
          <circle
            cx={centerPoint.x}
            cy={centerPoint.y}
            r="38%"
            fill="none"
            stroke="#D99B26"
            strokeWidth="1"
            strokeDasharray="4 8"
            className="opacity-[0.07]"
          />
        )}

        {/* Hairline connection lines from 4 corners to center */}
        {lines.map((line) => {
          const isHovered = hoveredId === line.id;
          const isOtherHovered = hoveredId && hoveredId !== line.id;

          let strokeOpacity = 0.14;
          if (isHovered) strokeOpacity = 0.6;
          else if (isOtherHovered) strokeOpacity = 0.08;

          return (
            <g key={`constellation-group-${line.id}`}>
              {/* Connection line */}
              <line
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="#D99B26"
                strokeWidth="1"
                strokeOpacity={strokeOpacity}
                className="transition-all duration-300 ease-out"
              />

              {/* Node Endpoint Dot (at corner word) */}
              <circle
                cx={line.x1}
                cy={line.y1}
                r={isHovered ? '4' : '2.5'}
                fill="#D99B26"
                fillOpacity={isHovered ? 0.9 : 0.4}
                className="transition-all duration-300 ease-out"
              />

              {/* Light pulse animation traveling on hover */}
              {isHovered && (
                <circle r="3" fill="#FFF4E6" className="animate-pulse">
                  <animateMotion
                    path={`M ${line.x1} ${line.y1} L ${line.x2} ${line.y2}`}
                    dur="0.8s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          );
        })}
      </svg>

      {/* Top Header Label */}
      <div className="absolute top-6 left-6 right-6 md:top-10 md:left-12 md:right-12 z-10 flex items-center justify-between pointer-events-none font-mono">
        <p className="text-xs uppercase tracking-[0.18em] text-[#E0A030] opacity-85">
          CRAFT & DISCIPLINE / ACHIEVEMENTS
        </p>
        <span className="text-xs uppercase tracking-[0.18em] text-white/40">05 DISCIPLINES</span>
      </div>

      {/* Spatial Stage (5 Synchronized Node Positions with Inter Font) */}
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
              onMouseEnter={() => handleMouseEnter(item, idx)}
              onMouseLeave={handleMouseLeave}
              onFocus={() => handleMouseEnter(item, idx)}
              onBlur={handleMouseLeave}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleNodeClick(item, idx);
                }
              }}
              role="button"
              tabIndex={selectedItem ? -1 : 0}
              aria-label={`Open details for ${item.title}`}
              className="absolute pointer-events-auto cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E0A030] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C0907] rounded-xl p-2"
              style={{
                top: item.position.top,
                left: item.position.left,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="flex flex-col items-center text-center p-2">
                <h3
                  className={`leading-none whitespace-nowrap font-medium tracking-[-0.02em] transition-colors duration-200 ${
                    isCenter
                      ? 'text-[clamp(56px,7vw,110px)] text-[#FFF4E6]'
                      : 'text-[clamp(28px,3vw,48px)] text-[#FFF4E6]'
                  } group-hover:text-[#E0A030]`}
                  style={{
                    fontFamily: "'Inter', 'Manrope', sans-serif",
                  }}
                >
                  {item.title}
                </h3>
                <span className="text-[11px] font-mono text-white/40 uppercase tracking-[0.18em] mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {item.subtitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* HINT LINE (Option 6) */}
      <div
        className={`absolute bottom-8 left-0 right-0 z-10 flex items-center justify-center space-x-2 pointer-events-none font-mono text-[11px] uppercase tracking-[0.3em] text-[#8A7A62] transition-opacity duration-300 ${
          showHint && !selectedItem ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="animate-pulse">SELECT A DISCIPLINE</span>
        <svg
          className="w-3.5 h-3.5 text-[#E0A030] animate-bounce"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
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

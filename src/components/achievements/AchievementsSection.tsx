'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, { useEffect, useRef, useState } from 'react';
import LiquidEther from '@/components/backgrounds/LiquidEther';
import { achievementsContent } from '@/content/achievements';

gsap.registerPlugin(ScrollTrigger);

const SPEAKING_TEXT =
  'Spoke before Sid Ahmed and Sivakarthikeyan and 15,000 people organized 7+ events won 3rd in Book Festival Coimbatore in English edition';

export const AchievementsSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [typedText, setTypedText] = useState('');
  const canDismissRef = useRef(false);

  useEffect(() => {
    try {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setIsReducedMotion(mq.matches);
    } catch {}
  }, []);

  // Typewriter effect when Speaking detail opens
  useEffect(() => {
    if (selectedId !== 'speaking') {
      setTypedText('');
      canDismissRef.current = false;
      return;
    }

    let idx = 0;
    setTypedText('');
    canDismissRef.current = false;

    // Enable mousemove dismissal after 400ms to avoid immediate click dismissal
    const enableDismissTimer = setTimeout(() => {
      canDismissRef.current = true;
    }, 400);

    const typeInterval = setInterval(() => {
      if (idx < SPEAKING_TEXT.length) {
        setTypedText((prev) => SPEAKING_TEXT.slice(0, idx + 1));
        idx++;
      } else {
        clearInterval(typeInterval);
      }
    }, 28);

    return () => {
      clearTimeout(enableDismissTimer);
      clearInterval(typeInterval);
    };
  }, [selectedId]);

  // Handle mouse movement to dismiss detail view and return to 5 words
  const handleMouseMove = () => {
    if (selectedId && canDismissRef.current) {
      setSelectedId(null);
    }
  };

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
      onMouseMove={handleMouseMove}
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
      <div
        className={`relative z-10 w-full h-full pointer-events-none transition-opacity duration-500 ${
          selectedId ? 'opacity-0 pointer-events-none' : 'opacity-100'
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
              onClick={() => {
                if (item.id === 'speaking') {
                  setSelectedId('speaking');
                }
              }}
              className="absolute pointer-events-auto cursor-pointer group"
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
                  } group-hover:text-[#E0A93B] transition-colors duration-300`}
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

      {/* Detail Overlay View for Speaking */}
      {selectedId === 'speaking' && (
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-8 md:p-14 pointer-events-auto bg-black animate-fadeIn">
          {/* Content Layout: Left Text & Right Overlapping Tilted Photo Stack */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-7xl mx-auto w-full my-auto z-10">
            {/* Left Column: Heading + Typewriter Text */}
            <div className="lg:col-span-5 space-y-6">
              <h2
                className="text-6xl md:text-8xl text-[#E0A93B] tracking-tight leading-none"
                style={{ fontFamily: "'Syne Tactile', cursive" }}
              >
                Speaking.
              </h2>
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md shadow-2xl">
                <p className="font-mono text-base md:text-xl text-white leading-relaxed min-h-[7rem]">
                  {typedText}
                  <span className="inline-block w-2.5 h-5 bg-[#E0A93B] ml-1.5 animate-pulse align-middle" />
                </p>
              </div>
            </div>

            {/* Right Column: Asymmetric Editorial Photo Composition */}
            <div className="lg:col-span-7 relative flex items-center justify-center lg:justify-start lg:pl-6 my-auto">
              <div className="relative w-full max-w-[500px] aspect-[4/5] flex items-center justify-center">
                {/* Primary Hero Image (Podium Speaking Photo - Large) */}
                <div className="relative z-10 w-[78%] h-[82%] rounded-lg overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.9)] transition-transform duration-500 hover:scale-[1.015]">
                  <img
                    src="/images/achievements/public-speaking/Pasted image.png"
                    alt="Speaking Podium Presentation"
                    className="w-full h-full object-cover object-center"
                  />
                  {/* Subtle inner gold accent border line */}
                  <div className="absolute inset-0 border border-[#E0A93B]/20 pointer-events-none rounded-lg" />
                </div>

                {/* Secondary Image (Event/Festival Stage Photo - Smaller, Overlapping Lower Right) */}
                <div
                  className="absolute bottom-0 right-0 z-20 w-[50%] h-[52%] rounded-lg overflow-hidden border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.95)] transition-all duration-500 hover:scale-105 hover:rotate-0 hover:border-[#E0A93B]/40"
                  style={{ transform: 'rotate(-3deg) translate(5%, 5%)' }}
                >
                  <img
                    src="/images/achievements/public-speaking/Pasted image (2).png"
                    alt="Speaking Event Stage"
                    className="w-full h-full object-cover object-center"
                  />
                  {/* Subtle inner vignette shadow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Dismissal Hint Footer */}
          <div className="text-right">
            <span className="text-xs font-mono text-white/40 tracking-widest uppercase">
              Move mouse to exit
            </span>
          </div>
        </div>
      )}
    </section>
  );
};


'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { usePreloaderProgress } from './usePreloaderProgress';

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [skipped, setSkipped] = useState(false);
  const [isServing, setIsServing] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Check reduced motion & session storage on mount
  useEffect(() => {
    try {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setIsReducedMotion(mediaQuery.matches);

      const hasVisited = sessionStorage.getItem('jairus_portfolio_visited');
      if (hasVisited) {
        setSkipped(true);
        onComplete();
        setIsDismissed(true);
      }
    } catch {
      // Fallback if sessionStorage is disabled/blocked
    }
  }, [onComplete]);

  const { progress, isDone } = usePreloaderProgress({
    minDurationMs: 3000,
    maxDurationMs: 4800,
  });

  const handleFinish = useCallback(() => {
    try {
      sessionStorage.setItem('jairus_portfolio_visited', 'true');
    } catch {
      // Ignore storage error
    }

    onComplete();

    if (isReducedMotion) {
      setIsDismissed(true);
      return;
    }

    // Trigger serve animation & wipe
    setIsServing(true);
    setTimeout(() => {
      setIsDismissed(true);
    }, 700);
  }, [isReducedMotion, onComplete]);

  useEffect(() => {
    if (isDone && !isServing && !isDismissed && !skipped) {
      handleFinish();
    }
  }, [isDone, isServing, isDismissed, skipped, handleFinish]);

  const handleSkip = () => {
    setSkipped(true);
    handleFinish();
  };

  if (isDismissed || skipped) {
    return <div className="hidden pointer-events-none" aria-hidden="true" />;
  }

  const formattedCounter = String(progress).padStart(2, '0');

  return (
    <div
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Site preloader"
      className={`fixed inset-0 z-50 flex flex-col justify-between p-6 sm:p-10 bg-[#0C0907] select-none pointer-events-auto transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isServing ? '-translate-y-full' : 'translate-y-0'
      }`}
      style={{ willChange: 'transform' }}
    >
      {/* Screen reader live region */}
      <div className="sr-only" aria-live="polite">
        {progress < 100 ? `Loading ${progress}%` : 'Loaded'}
      </div>

      {/* Top bar with minimal skip button */}
      <div className="flex justify-end w-full z-40">
        <button
          type="button"
          onClick={handleSkip}
          className="text-xs uppercase tracking-widest text-[#A89880] hover:text-[#E0A93B] focus-visible:ring-2 focus-visible:ring-[#E0A93B] transition-colors py-2 px-3 rounded"
        >
          Skip
        </button>
      </div>

      {/* Main Counter Display (Behind Ball) */}
      <div className="flex flex-col items-center justify-center flex-1 my-auto z-10">
        <span className="font-display-enormous text-[#F2E9D8] tracking-tighter tabular-nums opacity-90">
          {formattedCounter}
        </span>
      </div>

      {/* Table Tennis Ball & Settling Bounce Arena (In Front of Counter) */}
      <div className="relative w-full h-[65vh] max-h-[600px] overflow-hidden flex items-end justify-center pb-12 z-30 pointer-events-none">
        {/* Table Line */}
        <div className="absolute bottom-12 left-0 right-0 h-[2px] bg-[#E0A93B]/40 shadow-[0_0_12px_rgba(224,169,59,0.3)]" />

        {/* Dynamic Contact Shadow */}
        {!isReducedMotion && (
          <div
            className={`absolute bottom-[42px] w-[clamp(60px,8vw,140px)] h-3 rounded-[50%] bg-[#E0A93B]/30 blur-sm transition-all ${
              isServing ? 'animate-shadow-serve' : 'animate-shadow-bounce'
            }`}
          />
        )}

        {/* Large Ember Ball (clamp 96px to 220px) with Gold Glow */}
        {!isReducedMotion && (
          <div
            className={`w-[clamp(96px,12vw,220px)] h-[clamp(96px,12vw,220px)] rounded-full bg-[#E8481F] shadow-[0_0_50px_rgba(224,169,59,0.45),0_0_20px_rgba(232,72,31,0.8)] border border-[#E0A93B]/30 ${
              isServing ? 'animate-ball-serve' : 'animate-ball-bounce-settle'
            }`}
          />
        )}
      </div>

      {/* Keyframe animation inline styles for 60fps settling bounce with squash & stretch */}
      <style jsx>{`
        @keyframes ballBounceSettle {
          /* Bounce 1: Highest (approx 60% of viewport) */
          0% {
            transform: translateY(-55vh) scale(0.9, 1.15);
            animation-timing-function: cubic-bezier(0.75, 0.05, 0.85, 0.3);
          }
          14% {
            transform: translateY(0) scale(1.25, 0.75);
            animation-timing-function: cubic-bezier(0.15, 0.7, 0.25, 1);
          }
          /* Peak 2: ~38% viewport */
          28% {
            transform: translateY(-38vh) scale(0.92, 1.1);
            animation-timing-function: cubic-bezier(0.75, 0.05, 0.85, 0.3);
          }
          40% {
            transform: translateY(0) scale(1.2, 0.8);
            animation-timing-function: cubic-bezier(0.15, 0.7, 0.25, 1);
          }
          /* Peak 3: ~20% viewport */
          52% {
            transform: translateY(-20vh) scale(0.95, 1.05);
            animation-timing-function: cubic-bezier(0.75, 0.05, 0.85, 0.3);
          }
          62% {
            transform: translateY(0) scale(1.15, 0.85);
            animation-timing-function: cubic-bezier(0.15, 0.7, 0.25, 1);
          }
          /* Peak 4: ~8% viewport */
          72% {
            transform: translateY(-8vh) scale(0.98, 1.02);
            animation-timing-function: cubic-bezier(0.75, 0.05, 0.85, 0.3);
          }
          80% {
            transform: translateY(0) scale(1.08, 0.92);
            animation-timing-function: cubic-bezier(0.15, 0.7, 0.25, 1);
          }
          100% {
            transform: translateY(0) scale(1, 1);
          }
        }

        @keyframes shadowBounce {
          0%, 28%, 52%, 72% {
            transform: scale(0.3);
            opacity: 0.2;
          }
          14%, 40%, 62%, 80%, 100% {
            transform: scale(1);
            opacity: 0.8;
          }
        }

        @keyframes ballServe {
          0% {
            transform: translateY(0) scale(1);
          }
          15% {
            transform: translateY(20px) scale(1.3, 0.7);
          }
          100% {
            transform: translateY(-140vh) scale(0.75, 1.25);
            opacity: 0.9;
          }
        }

        @keyframes shadowServe {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          100% {
            transform: scale(0.1);
            opacity: 0;
          }
        }

        .animate-ball-bounce-settle {
          animation: ballBounceSettle 3.0s infinite;
          transform-origin: bottom center;
        }

        .animate-shadow-bounce {
          animation: shadowBounce 3.0s infinite;
        }

        .animate-ball-serve {
          animation: ballServe 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform-origin: bottom center;
        }

        .animate-shadow-serve {
          animation: shadowServe 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

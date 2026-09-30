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
    minDurationMs: 2400,
    maxDurationMs: 3800,
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
    }, 600);
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

  if (isDismissed || skipped) return null;

  const formattedCounter = String(progress).padStart(2, '0');

  return (
    <div
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Site preloader"
      className={`fixed inset-0 z-50 flex flex-col justify-between p-8 bg-[#0C0907] select-none pointer-events-auto transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isServing ? '-translate-y-full' : 'translate-y-0'
      }`}
      style={{ willChange: 'transform' }}
    >
      {/* Screen reader live region */}
      <div className="sr-only" aria-live="polite">
        {progress < 100 ? `Loading ${progress}%` : 'Loaded'}
      </div>

      {/* Top bar with minimal skip button */}
      <div className="flex justify-end w-full">
        <button
          type="button"
          onClick={handleSkip}
          className="text-xs uppercase tracking-widest text-[#A89880] hover:text-[#E0A93B] focus-visible:ring-2 focus-visible:ring-[#E0A93B] transition-colors py-2 px-3 rounded"
        >
          Skip
        </button>
      </div>

      {/* Main Counter Display */}
      <div className="flex flex-col items-center justify-center flex-1 my-auto">
        <span className="font-display-enormous text-[#F2E9D8] tracking-tighter tabular-nums">
          {formattedCounter}
        </span>
      </div>

      {/* Table Tennis Ball & Gold Line Animation Area */}
      <div className="relative w-full h-32 overflow-hidden flex items-end justify-center pb-8">
        {/* Table line */}
        <div className="absolute bottom-8 left-0 right-0 h-[1px] bg-[#E0A93B]/40" />

        {/* Ember Ball */}
        {!isReducedMotion && (
          <div
            className={`w-6 h-6 rounded-full bg-[#E8481F] shadow-[0_0_20px_rgba(232,72,31,0.6)] transition-all duration-500 ${
              isServing ? 'animate-ball-serve' : 'animate-ball-bounce'
            }`}
          />
        )}
      </div>

      {/* Keyframe animation inline styles */}
      <style jsx>{`
        @keyframes ballBounce {
          0%, 100% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: translateY(-60px);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }

        @keyframes ballServe {
          0% {
            transform: translateY(0) scale(1);
          }
          100% {
            transform: translateY(-120vh) scale(0.6);
            opacity: 0.8;
          }
        }

        .animate-ball-bounce {
          animation: ballBounce 0.6s infinite;
        }

        .animate-ball-serve {
          animation: ballServe 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

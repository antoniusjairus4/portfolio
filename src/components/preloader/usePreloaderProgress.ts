import { useEffect, useState } from 'react';

export interface PreloaderOptions {
  minDurationMs?: number; // Default 6000ms
  maxDurationMs?: number; // Default 8000ms
  onComplete?: () => void;
}

export function computeSmoothedProgress(
  elapsedMs: number,
  assetLoaded: boolean,
  minDurationMs = 6000,
  maxDurationMs = 8000
): number {
  if (elapsedMs <= 0) return 0;

  // Hard maximum constraint
  if (elapsedMs >= maxDurationMs) return 100;

  const targetDuration = assetLoaded ? minDurationMs : maxDurationMs;
  const rawRatio = Math.min(1, elapsedMs / targetDuration);

  // Smooth decelerating curve (quick early, slowing near 90, confident finish to 100)
  const easedRatio = 1 - Math.pow(1 - rawRatio, 2.2);

  if (assetLoaded) {
    return Math.min(100, Math.floor(easedRatio * 100));
  }

  // Cap at 95% if assets are still loading before maxDurationMs
  return Math.min(95, Math.floor(easedRatio * 100));
}

export function usePreloaderProgress({
  minDurationMs = 6000,
  maxDurationMs = 8000,
  onComplete,
}: PreloaderOptions = {}) {
  const [progress, setProgress] = useState<number>(0);
  const [isDone, setIsDone] = useState<boolean>(false);
  const [assetLoaded, setAssetLoaded] = useState<boolean>(false);

  useEffect(() => {
    // Check asset loading status
    if (typeof window !== 'undefined') {
      if (document.readyState === 'complete') {
        setAssetLoaded(true);
      } else {
        const handleLoad = () => setAssetLoaded(true);
        window.addEventListener('load', handleLoad);
        return () => window.removeEventListener('load', handleLoad);
      }
    }
  }, []);

  useEffect(() => {
    const startTime = performance.now();
    let animationFrameId: number;

    const update = () => {
      const elapsed = performance.now() - startTime;
      const currentProgress = computeSmoothedProgress(
        elapsed,
        assetLoaded,
        minDurationMs,
        maxDurationMs
      );

      setProgress(currentProgress);

      if (currentProgress >= 100) {
        setIsDone(true);
        if (onComplete) onComplete();
      } else {
        animationFrameId = requestAnimationFrame(update);
      }
    };

    animationFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId);
  }, [assetLoaded, minDurationMs, maxDurationMs, onComplete]);

  return { progress, isDone };
}

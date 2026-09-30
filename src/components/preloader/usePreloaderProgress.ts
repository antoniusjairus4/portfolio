import { useEffect, useState } from 'react';

export interface PreloaderOptions {
  minDurationMs?: number; // Default 3000ms
  maxDurationMs?: number; // Default 4800ms
  onComplete?: () => void;
}

export function computeSmoothedProgress(
  elapsedMs: number,
  assetLoaded: boolean,
  minDurationMs = 3000,
  maxDurationMs = 4800
): number {
  if (elapsedMs <= 0) return 0;

  // Hard maximum constraint
  if (elapsedMs >= maxDurationMs) return 100;

  // Base progress based on elapsed time vs max duration
  const timeProgress = (elapsedMs / maxDurationMs) * 100;

  if (assetLoaded) {
    // If assets are ready, scale progress so it reaches 100% at minDurationMs
    const assetProgress = Math.min(100, (elapsedMs / minDurationMs) * 100);
    return Math.max(timeProgress, assetProgress);
  }

  // Cap at 95% if assets are still loading before maxDurationMs
  return Math.min(95, timeProgress);
}

export function usePreloaderProgress({
  minDurationMs = 3000,
  maxDurationMs = 4800,
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

      setProgress(Math.floor(currentProgress));

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

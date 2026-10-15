import { useEffect, useState } from 'react';

export type ReadinessStatus = 'loading' | 'ready' | 'degraded';

export interface CriticalReadiness {
  status: ReadinessStatus;
  completed: number;
  total: number;
  progress: number;
}

const INITIAL: CriticalReadiness = { status: 'loading', completed: 0, total: 2, progress: 0 };

export function criticalProgress(completed: number, total: number) {
  return total === 0 ? 100 : Math.round((completed / total) * 100);
}

function waitForHeroPortrait() {
  const image = document.querySelector<HTMLImageElement>('img[alt="Jairus Portfolio Cover"]');
  if (image?.decode) return image.decode();

  return new Promise<void>((resolve, reject) => {
    const fallback = new Image();
    fallback.onload = () => resolve();
    fallback.onerror = () => reject(new Error('Hero portrait unavailable'));
    fallback.src = '/images/cover-1536.jpeg';
  });
}

function waitForIdentityFont() {
  if (!document.fonts?.load) return Promise.resolve();
  return document.fonts.load('700 32px "Cinzel Decorative"').then((faces) => {
    if (faces.length === 0) throw new Error('Identity font unavailable');
  });
}

/** Progress counts successfully prepared resources; timeout is a separate failure release. */
export function useCriticalReadiness(timeoutMs = 8000): CriticalReadiness {
  const [readiness, setReadiness] = useState<CriticalReadiness>(INITIAL);

  useEffect(() => {
    let cancelled = false;
    let settled = 0;
    let completed = 0;
    let failed = false;
    let finished = false;
    const total = 2;

    const timeout = window.setTimeout(() => {
      if (cancelled || finished) return;
      finished = true;
      setReadiness({
        status: 'degraded',
        completed,
        total,
        progress: criticalProgress(completed, total),
      });
    }, timeoutMs);

    for (const resource of [waitForHeroPortrait(), waitForIdentityFont()]) {
      resource.then(
        () => settle(false),
        () => settle(true),
      );
    }

    function settle(didFail: boolean) {
      if (cancelled || finished) return;
      settled += 1;
      if (!didFail) completed += 1;
      failed ||= didFail;
      if (settled === total) {
        finished = true;
        window.clearTimeout(timeout);
      }
      setReadiness({
        status: finished ? (failed ? 'degraded' : 'ready') : 'loading',
        completed,
        total,
        progress: criticalProgress(completed, total),
      });
    }

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [timeoutMs]);

  return readiness;
}

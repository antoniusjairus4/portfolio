import { useCallback, useEffect, useMemo, useState } from 'react';

export type ReadinessStatus = 'loading' | 'ready' | 'degraded';
export type ResourceStatus = 'pending' | 'ready' | 'deferred';
export type CriticalResource = 'system' | 'images' | 'type' | 'scenes' | 'motion';

export interface CriticalReadiness {
  status: ReadinessStatus;
  completed: number;
  total: number;
  progress: number;
  resources: Record<CriticalResource, ResourceStatus>;
}

interface CriticalReadinessOptions {
  environmentReady: boolean;
  timeoutMs?: number;
}

const RESOURCE_WEIGHTS: Record<CriticalResource, number> = {
  system: 10,
  images: 28,
  type: 22,
  scenes: 25,
  motion: 15,
};

const INITIAL_RESOURCES: Record<CriticalResource, ResourceStatus> = {
  system: 'pending',
  images: 'pending',
  type: 'pending',
  scenes: 'pending',
  motion: 'pending',
};

export function criticalProgress(completed: number, total: number) {
  return total === 0 ? 100 : Math.round((completed / total) * 100);
}

function waitForDocument() {
  if (document.readyState !== 'loading') return Promise.resolve();
  return new Promise<void>((resolve) => {
    document.addEventListener('DOMContentLoaded', () => resolve(), { once: true });
  });
}

async function decodeImage(image: HTMLImageElement) {
  if (!image.complete) {
    await new Promise<void>((resolve, reject) => {
      image.addEventListener('load', () => resolve(), { once: true });
      image.addEventListener('error', () => reject(new Error('Critical image unavailable')), {
        once: true,
      });
    });
  }

  if (image.naturalWidth === 0) throw new Error('Critical image unavailable');
  if (image.decode) await image.decode();
}

async function waitForHeroMedia() {
  const mountedHero = document.querySelector<HTMLImageElement>('#hero img');
  if (mountedHero) {
    await decodeImage(mountedHero);
    return;
  }

  const preload = new Image();
  preload.decoding = 'async';
  preload.src = '/images/cover-1536.avif';
  await decodeImage(preload);
}

async function waitForCriticalFonts() {
  if (!document.fonts?.load) return;

  await document.fonts.ready;
  await Promise.all([
    document.fonts.load('700 96px "Clash Display"'),
    document.fonts.load('700 72px "Cinzel Decorative"'),
    document.fonts.load('400 12px "JetBrains Mono"'),
  ]);
}

function waitForMotionSetup() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

/** Tracks only resources required for the first safe paint. */
export function useCriticalReadiness({
  environmentReady,
  timeoutMs = 10_000,
}: CriticalReadinessOptions): CriticalReadiness {
  const [resources, setResources] = useState(INITIAL_RESOURCES);

  const settle = useCallback((resource: CriticalResource, state: ResourceStatus) => {
    setResources((current) => {
      if (current[resource] !== 'pending') return current;
      return { ...current, [resource]: state };
    });
  }, []);

  useEffect(() => {
    if (environmentReady) settle('scenes', 'ready');
  }, [environmentReady, settle]);

  useEffect(() => {
    let cancelled = false;

    const track = (resource: CriticalResource, task: Promise<unknown>) => {
      void task.then(
        () => {
          if (!cancelled) settle(resource, 'ready');
        },
        () => {
          if (!cancelled) settle(resource, 'deferred');
        },
      );
    };

    track('system', waitForDocument());
    track('images', waitForHeroMedia());
    track('type', waitForCriticalFonts());
    track('motion', waitForMotionSetup());

    return () => {
      cancelled = true;
    };
  }, [settle]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setResources((current) => {
        const next = { ...current };
        (Object.keys(next) as CriticalResource[]).forEach((resource) => {
          if (next[resource] === 'pending') next[resource] = 'deferred';
        });
        return next;
      });
    }, timeoutMs);

    return () => window.clearTimeout(timeout);
  }, [timeoutMs]);

  return useMemo(() => {
    const entries = Object.entries(resources) as [CriticalResource, ResourceStatus][];
    const settled = entries.filter(([, state]) => state !== 'pending');
    const weightedProgress = settled.reduce(
      (total, [resource]) => total + RESOURCE_WEIGHTS[resource],
      0,
    );
    const finished = settled.length === entries.length;
    const degraded = entries.some(([, state]) => state === 'deferred');

    return {
      status: finished ? (degraded ? 'degraded' : 'ready') : 'loading',
      completed: entries.filter(([, state]) => state === 'ready').length,
      total: entries.length,
      progress: Math.min(100, weightedProgress),
      resources,
    };
  }, [resources]);
}

import type { MutableRefObject, RefObject } from 'react';

export interface ChapterProgressController {
  progress: MutableRefObject<number>;
  subscribe: (listener: () => void) => () => void;
  dispose: () => void;
}

export function getChapterProgress(rectTop: number, height: number, viewportHeight: number) {
  const distance = Math.max(1, height - viewportHeight);
  return Math.min(1, Math.max(0, -rectTop / distance));
}

export function createChapterProgressController(
  sectionRef: RefObject<HTMLElement | null>,
): ChapterProgressController {
  const progress = { current: 0 };
  const listeners = new Set<() => void>();
  let frame = 0;

  const update = () => {
    frame = 0;
    const section = sectionRef.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const next = getChapterProgress(rect.top, rect.height, window.innerHeight);
    if (Math.abs(next - progress.current) < 0.0001) return;
    progress.current = next;
    for (const listener of listeners) listener();
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  update();

  return {
    progress,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispose() {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
      listeners.clear();
    },
  };
}

'use client';

import { type RefObject, useEffect, useState } from 'react';

export type ChapterActivity = 'inactive' | 'approaching' | 'active' | 'leaving';

/** Position-derived state: reverses and direct jumps do not depend on past callbacks. */
export function classifyChapter(
  top: number,
  bottom: number,
  viewportHeight: number,
): ChapterActivity {
  if (bottom < -viewportHeight * 0.5 || top > viewportHeight * 1.5) return 'inactive';
  if (top >= viewportHeight) return 'approaching';
  if (bottom <= viewportHeight * 0.25) return 'leaving';
  return 'active';
}

export function useChapterActivity(ref: RefObject<HTMLElement | null>): ChapterActivity {
  const [activity, setActivity] = useState<ChapterActivity>('inactive');

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const next = classifyChapter(rect.top, rect.bottom, window.innerHeight);
      setActivity((current) => (current === next ? current : next));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ref]);

  return activity;
}

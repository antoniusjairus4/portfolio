import { SCROLL_STORY } from '../../../motion/tokens';


export function getStripCount(viewportWidth: number): number {
  if (viewportWidth >= 1024) return SCROLL_STORY.strips.desktop; // 7
  if (viewportWidth >= 640) return SCROLL_STORY.strips.tablet;  // 5
  return SCROLL_STORY.strips.mobile;                              // 4
}

// Simple deterministic PRNG seeded pseudo-random generator
export function pseudoRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export interface StripMathParams {
  stripIndex: number;
  totalStrips: number;
  overallProgress: number; // 0.0 to 1.0 (Beat D progress)
  staggerOverlap?: number;
}

export function computeStripProgress({
  stripIndex,
  totalStrips,
  overallProgress,
  staggerOverlap = SCROLL_STORY.strips.staggerOverlap,
}: StripMathParams): number {
  if (overallProgress <= 0) return 0;
  if (overallProgress >= 1) return 1;

  // Order: Right-to-Left (Strip totalStrips - 1 goes first, strip 0 goes last)
  const orderIndex = totalStrips - 1 - stripIndex;
  const maxStart = 1.0 - staggerOverlap;
  const start = (orderIndex / Math.max(1, totalStrips - 1)) * maxStart;
  const end = start + staggerOverlap;

  if (overallProgress <= start) return 0;
  if (overallProgress >= end) return 1;

  return (overallProgress - start) / (end - start);
}


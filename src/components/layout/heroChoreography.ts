import { SCROLL_STORY } from '@/motion/tokens';

export type HeroChoreographyState =
  | 'portrait'
  | 'opening'
  | 'identity'
  | 'exit-preparation'
  | 'collapse'
  | 'handoff';

export function clampHeroProgress(progress: number) {
  return Math.min(Math.max(progress, 0), 1);
}

export function getHeroChoreographyState(progress: number): HeroChoreographyState {
  const value = clampHeroProgress(progress);
  const { revealEnd, readEnd, holdEnd, collapseEnd } = SCROLL_STORY.beats;

  // Scrubbed timelines can settle a fraction above zero after returning to the top.
  if (value <= 0.005) return 'portrait';
  if (value < revealEnd) return 'opening';
  if (value < readEnd) return 'identity';
  if (value < holdEnd) return 'exit-preparation';
  if (value < collapseEnd) return 'collapse';
  return 'handoff';
}

export function getHeroCollapseProgress(progress: number) {
  const value = clampHeroProgress(progress);
  const { holdEnd, collapseEnd } = SCROLL_STORY.beats;
  return clampHeroProgress((value - holdEnd) / (collapseEnd - holdEnd));
}

export const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';
export const EASE_IN_OUT = 'cubic-bezier(0.76, 0, 0.24, 1)';

export const DURATION = {
  fast: 0.3,
  base: 0.6,
  slow: 1.2,
} as const;

export const COLOR_TOKENS = {
  base: '#0C0907',
  surface: '#17110C',
  ivory: '#F2E9D8',
  muted: '#A89880',
  gold: '#E0A93B',
  ember: '#E8481F',
} as const;

// Phase 2: Pinned Scroll Story Beats & Distances
export const SCROLL_STORY = {
  totalDistanceVh: 350,
  beats: {
    revealEnd: 0.35, // 0% to 35%: Photo split + text reveal
    readEnd: 0.55,   // 35% to 55%: Rest & read stable text
    exitEnd: 1.00,   // 55% to 100%: Halves off-screen + text scale up/fade
  },
} as const;

// Phase 2: Longer Preloader Timing (6.0s - 8.0s)
export const PRELOADER_TIMINGS = {
  minDurationMs: 6000,
  maxDurationMs: 8000,
  targetMs: 6500,
} as const;

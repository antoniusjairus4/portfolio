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

// Phase 3: Typographic Physics Collapse Story Beats & Distances
export const COLLAPSE_SCROLL_DISTANCE_VH = 200; // 2.0 viewport heights allocated for Beat D

export const SCROLL_STORY = {
  totalDistanceVh: 550, // 5.5 viewport heights of total scroll pin
  beats: {
    revealEnd: 0.22, // Beat A: 0% to 22% (photo halves split & text reveals)
    readEnd: 0.35,   // Beat B: 22% to 35% (rest & read intact name page)
    exitEnd: 0.60,   // Beat C: 35% to 60% (halves slide off-screen; text stays rest & intact)
    holdEnd: 0.64,   // Clean Hold: 60% to 64% (~5% scroll story hold)
    collapseEnd: 1.00, // Beat D: 64% to 100% (Physics collapse & background crossfade)
  },
} as const;

// Phase 2: Longer Preloader Timing (6.0s - 8.0s)
export const PRELOADER_TIMINGS = {
  minDurationMs: 6000,
  maxDurationMs: 8000,
  targetMs: 6500,
} as const;

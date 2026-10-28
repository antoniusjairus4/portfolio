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

export const SCROLL_STORY = {
  totalDistanceVh: 420,
  beats: {
    revealEnd: 0.24,
    readEnd: 0.42,
    exitEnd: 0.62,
    holdEnd: 0.66,
    collapseEnd: 0.94,
    handoffEnd: 1,
  },
} as const;

// Deliberate blueprint calibration window. Critical assets continue warming behind the loader.
export const PRELOADER_TIMINGS = {
  minDurationMs: 15000,
  maxDurationMs: 20000,
  targetMs: 16500,
} as const;

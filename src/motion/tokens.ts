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

// Phase 3: Pinned Scroll Story Beats & Distances (Split Reveal + 3D Strip Tear)
export const NAME_EXIT_SCALE_END = 1.3;
export const TEAR_SCROLL_DISTANCE_VH = 220; // 2.2 viewport heights

export const SCROLL_STORY = {
  totalDistanceVh: 570, // 350 + 220 vh total scroll story
  nameExitScaleEnd: NAME_EXIT_SCALE_END,
  tearScrollDistanceVh: TEAR_SCROLL_DISTANCE_VH,
  beats: {
    revealEnd: 0.20, // 0% -> 20%: Photo split + text reveal (Beat A)
    readEnd: 0.32,   // 20% -> 32%: Rest & read stable text (Beat B)
    exitEnd: 0.57,   // 32% -> 57%: Photo halves slide off-screen, text scale 1.0 -> 1.3 (Beat C)
    holdEnd: 0.61,   // 57% -> 61%: Clean hold (5% of story)
    tearEnd: 1.00,   // 61% -> 100%: 3D vertical strip tear transition (Beat D)
  },
  strips: {
    desktop: 7, // >= 1024px
    tablet: 5,  // 640px - 1023px
    mobile: 4,  // < 640px
    staggerOverlap: 0.45,
  },
} as const;


// Phase 2: Longer Preloader Timing (6.0s - 8.0s)
export const PRELOADER_TIMINGS = {
  minDurationMs: 6000,
  maxDurationMs: 8000,
  targetMs: 6500,
} as const;

import type { AchievementDisciplineKey } from '@/content/achievementsKinetic';

export type AchievementPanelKey = 'intro' | AchievementDisciplineKey | 'finale';

export function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function smoothstep(value: number) {
  const value01 = clamp01(value);
  return value01 * value01 * (3 - 2 * value01);
}

export function rangeProgress(progress: number, start: number, end: number) {
  return clamp01((progress - start) / (end - start));
}

export function getAchievementBeat(panel: AchievementPanelKey, progress: number) {
  const value = clamp01(progress);
  if (panel === 'intro') {
    if (value < 0.2) return 'archive';
    if (value < 0.68) return 'disciplines';
    return 'handoff';
  }
  if (panel === 'table-tennis') {
    if (value < 0.18) return 'serve';
    if (value < 0.48) return 'trajectory';
    if (value < 0.82) return 'peak';
    return 'handoff';
  }
  if (panel === 'karate') {
    if (value < 0.24) return 'stillness';
    if (value < 0.42) return 'impact';
    if (value < 0.82) return 'stillness';
    return 'handoff';
  }
  if (panel === 'chess') {
    if (value < 0.22) return 'possibilities';
    if (value < 0.55) return 'calculation';
    if (value < 0.84) return 'ratings';
    return 'handoff';
  }
  if (panel === 'public-speaking') {
    if (value < 0.3) return 'voice';
    if (value < 0.78) return 'audience';
    if (value < 0.9) return 'presence';
    return 'silence';
  }
  if (value < 0.3) return 'disciplines';
  if (value < 0.58) return 'principles';
  return 'statement';
}

export function getDisciplineMotion(panel: AchievementDisciplineKey, progress: number) {
  return getAchievementMotion(panel, progress);
}

export function getAchievementMotion(panel: AchievementPanelKey, progress: number) {
  const value = clamp01(progress);
  const exit = smoothstep(rangeProgress(value, 0.84, 0.98));

  if (panel === 'intro') {
    const title = 0.45 + smoothstep(rangeProgress(value, 0.02, 0.2)) * 0.55;
    const split = smoothstep(rangeProgress(value, 0.24, 0.55));
    return {
      '--achievement-exit': exit,
      '--intro-title': title,
      '--intro-split': split,
      '--intro-scale': 1.08 - title * 0.08 - split * 0.05,
      '--intro-beyond': smoothstep(rangeProgress(value, 0.14, 0.34)),
      '--intro-word-one': 0.16 + smoothstep(rangeProgress(value, 0.17, 0.32)) * 0.84,
      '--intro-word-two': 0.12 + smoothstep(rangeProgress(value, 0.23, 0.38)) * 0.88,
      '--intro-word-three': 0.08 + smoothstep(rangeProgress(value, 0.29, 0.44)) * 0.92,
      '--intro-word-four': 0.05 + smoothstep(rangeProgress(value, 0.35, 0.5)) * 0.95,
    };
  }

  if (panel === 'table-tennis') {
    const title = smoothstep(rangeProgress(value, 0.01, 0.16));
    const trajectory = smoothstep(rangeProgress(value, 0.08, 0.58));
    const impactIn = smoothstep(rangeProgress(value, 0.25, 0.34));
    const impactOut = smoothstep(rangeProgress(value, 0.48, 0.64));
    return {
      '--tt-title': title,
      '--tt-trajectory': trajectory,
      '--tt-impact':
        impactIn * (1 - impactOut) + smoothstep(rangeProgress(value, 0.6, 0.72)) * 0.18,
      '--tt-resolve': smoothstep(rangeProgress(value, 0.42, 0.68)),
    };
  }

  if (panel === 'karate') {
    const title = smoothstep(rangeProgress(value, 0.02, 0.18));
    const impactIn = smoothstep(rangeProgress(value, 0.16, 0.25));
    const impactOut = smoothstep(rangeProgress(value, 0.33, 0.48));
    return {
      '--karate-title': title,
      '--karate-grid': smoothstep(rangeProgress(value, 0.04, 0.22)),
      '--karate-impact': impactIn * (1 - impactOut),
      '--karate-settle': smoothstep(rangeProgress(value, 0.36, 0.56)),
      '--karate-words': smoothstep(rangeProgress(value, 0.3, 0.52)),
    };
  }

  if (panel === 'chess') {
    return {
      '--chess-grid': smoothstep(rangeProgress(value, 0.03, 0.24)),
      '--chess-path': smoothstep(rangeProgress(value, 0.16, 0.54)),
      '--chess-pieces': smoothstep(rangeProgress(value, 0.12, 0.48)),
      '--chess-focus': smoothstep(rangeProgress(value, 0.42, 0.68)),
      '--chess-one': 0.12 + smoothstep(rangeProgress(value, 0.18, 0.35)) * 0.88,
      '--chess-two': smoothstep(rangeProgress(value, 0.34, 0.51)),
      '--chess-three': smoothstep(rangeProgress(value, 0.5, 0.67)),
    };
  }

  if (panel === 'public-speaking') {
    const audience = smoothstep(rangeProgress(value, 0.34, 0.61));
    return {
      '--speaking-build': 0.14 + smoothstep(rangeProgress(value, 0.03, 0.23)) * 0.86,
      '--speaking-stage': smoothstep(rangeProgress(value, 0.02, 0.28)),
      '--speaking-mic': smoothstep(rangeProgress(value, 0.12, 0.42)),
      '--speaking-speaker': smoothstep(rangeProgress(value, 0.24, 0.52)),
      '--speaking-audience': audience,
      '--speaking-scale': 0.72 + audience * 0.28,
      '--speaking-reach': smoothstep(rangeProgress(value, 0.54, 0.73)),
    };
  }

  return {
    '--achievement-exit': 0,
    '--final-statement': 0.2 + smoothstep(rangeProgress(value, 0.02, 0.24)) * 0.8,
    '--final-wash': smoothstep(rangeProgress(value, 0.16, 0.72)),
  };
}

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

function pulse(progress: number, start: number, peak: number, end: number) {
  return (
    smoothstep(rangeProgress(progress, start, peak)) *
    (1 - smoothstep(rangeProgress(progress, peak, end)))
  );
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
    if (value < 0.82) return 'champion';
    return 'handoff';
  }
  if (panel === 'karate') {
    if (value < 0.24) return 'stillness';
    if (value < 0.42) return 'impact';
    if (value < 0.82) return 'discipline';
    return 'handoff';
  }
  if (panel === 'chess') {
    if (value < 0.22) return 'possibilities';
    if (value < 0.55) return 'calculation';
    if (value < 0.84) return 'decision';
    return 'handoff';
  }
  if (panel === 'public-speaking') {
    if (value < 0.3) return 'voice';
    if (value < 0.62) return 'audience';
    if (value < 0.84) return 'presence';
    return 'handoff';
  }
  if (value < 0.3) return 'disciplines';
  if (value < 0.58) return 'principles';
  return 'statement';
}

export function getAchievementMotion(panel: AchievementPanelKey, progress: number) {
  const value = clamp01(progress);
  const exit = smoothstep(rangeProgress(value, 0.84, 0.98));

  if (panel === 'intro') {
    const title = smoothstep(rangeProgress(value, 0.02, 0.2));
    const split = smoothstep(rangeProgress(value, 0.24, 0.55));
    return {
      '--achievement-exit': exit,
      '--intro-title': title,
      '--intro-split': split,
      '--intro-scale': 1.08 - title * 0.08 - split * 0.05,
    };
  }

  if (panel === 'table-tennis') {
    const travel = smoothstep(rangeProgress(value, 0.06, 0.52));
    return {
      '--achievement-exit': exit,
      '--tt-title': smoothstep(rangeProgress(value, 0.02, 0.2)),
      '--tt-ball-x': -46 + travel * 92,
      '--tt-ball-y': Math.sin(travel * Math.PI * 3) * -12,
      '--tt-rule-turn': travel * -6,
      '--tt-impact': pulse(value, 0.39, 0.45, 0.53),
      '--tt-resolve': smoothstep(rangeProgress(value, 0.39, 0.58)),
    };
  }

  if (panel === 'karate') {
    const lock = smoothstep(rangeProgress(value, 0.13, 0.33));
    return {
      '--achievement-exit': exit,
      '--karate-lock': lock,
      '--karate-impact': pulse(value, 0.27, 0.34, 0.43),
      '--karate-words': smoothstep(rangeProgress(value, 0.39, 0.66)),
    };
  }

  if (panel === 'chess') {
    return {
      '--achievement-exit': exit,
      '--chess-grid': smoothstep(rangeProgress(value, 0.03, 0.24)),
      '--chess-path': smoothstep(rangeProgress(value, 0.16, 0.54)),
      '--chess-one': smoothstep(rangeProgress(value, 0.18, 0.35)),
      '--chess-two': smoothstep(rangeProgress(value, 0.34, 0.51)),
      '--chess-three': smoothstep(rangeProgress(value, 0.5, 0.67)),
    };
  }

  if (panel === 'public-speaking') {
    const audience = smoothstep(rangeProgress(value, 0.34, 0.61));
    return {
      '--achievement-exit': exit,
      '--speaking-build': smoothstep(rangeProgress(value, 0.03, 0.23)),
      '--speaking-audience': audience,
      '--speaking-scale': 0.72 + audience * 0.28,
      '--speaking-reach': smoothstep(rangeProgress(value, 0.54, 0.73)),
    };
  }

  const concepts = smoothstep(rangeProgress(value, 0.22, 0.47));
  const statement = smoothstep(rangeProgress(value, 0.48, 0.72));
  return {
    '--achievement-exit': 0,
    '--final-disciplines': 1 - smoothstep(rangeProgress(value, 0.2, 0.42)),
    '--final-concepts': concepts * (1 - smoothstep(rangeProgress(value, 0.52, 0.69))),
    '--final-statement': statement,
    '--final-wash': smoothstep(rangeProgress(value, 0.65, 0.96)),
  };
}

import type { AchievementDisciplineKey } from '@/content/achievementsKinetic';

export type AchievementBeat =
  | 'entry'
  | 'trajectory'
  | 'peak'
  | 'exit'
  | 'anticipation'
  | 'impact'
  | 'stillness'
  | 'calculation'
  | 'ratings'
  | 'speeches'
  | 'amplification'
  | 'audience'
  | 'silence';

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

export function getAchievementBeat(
  discipline: AchievementDisciplineKey,
  progress: number,
): AchievementBeat {
  const value = clamp01(progress);
  if (discipline === 'table-tennis') {
    if (value < 0.16) return 'entry';
    if (value < 0.43) return 'trajectory';
    if (value < 0.82) return 'peak';
    return 'exit';
  }
  if (discipline === 'karate') {
    if (value < 0.24) return 'anticipation';
    if (value < 0.4) return 'impact';
    if (value < 0.84) return 'stillness';
    return 'exit';
  }
  if (discipline === 'chess') {
    if (value < 0.18) return 'entry';
    if (value < 0.55) return 'calculation';
    if (value < 0.84) return 'ratings';
    return 'exit';
  }
  if (value < 0.2) return 'speeches';
  if (value < 0.48) return 'amplification';
  if (value < 0.78) return 'audience';
  return 'silence';
}

export function getDisciplineMotion(discipline: AchievementDisciplineKey, progress: number) {
  const value = clamp01(progress);
  const exit = smoothstep(rangeProgress(value, 0.82, 0.98));

  if (discipline === 'table-tennis') {
    const travel = smoothstep(rangeProgress(value, 0.08, 0.5));
    const resolve = smoothstep(rangeProgress(value, 0.3, 0.54));
    return {
      '--achievement-exit': exit,
      '--tt-ball-x': -44 + travel * 88,
      '--tt-ball-y': Math.sin(travel * Math.PI * 2.5) * -13,
      '--tt-rule-turn': travel * -7,
      '--tt-resolve': resolve,
    };
  }

  if (discipline === 'karate') {
    const lock = smoothstep(rangeProgress(value, 0.16, 0.34));
    const impactIn = smoothstep(rangeProgress(value, 0.24, 0.31));
    const impactOut = 1 - smoothstep(rangeProgress(value, 0.36, 0.47));
    return {
      '--achievement-exit': exit,
      '--karate-lock': lock,
      '--karate-impact': impactIn * impactOut,
      '--karate-offset': 1 - lock,
    };
  }

  if (discipline === 'chess') {
    return {
      '--achievement-exit': exit,
      '--chess-grid': smoothstep(rangeProgress(value, 0.08, 0.25)),
      '--chess-one': smoothstep(rangeProgress(value, 0.2, 0.36)),
      '--chess-two': smoothstep(rangeProgress(value, 0.34, 0.5)),
      '--chess-three': smoothstep(rangeProgress(value, 0.48, 0.64)),
    };
  }

  const speechesOut = smoothstep(rangeProgress(value, 0.36, 0.48));
  const audience = smoothstep(rangeProgress(value, 0.49, 0.62));
  const audiencePeak = smoothstep(rangeProgress(value, 0.62, 0.72));
  const silence = smoothstep(rangeProgress(value, 0.76, 0.97));
  return {
    '--achievement-exit': 0,
    '--speaking-build': smoothstep(rangeProgress(value, 0.03, 0.18)),
    '--speaking-speeches-out': speechesOut,
    '--speaking-audience': audience,
    '--speaking-scale': 0.44 + audience * 0.5 + audiencePeak * 0.35,
    '--speaking-silence': silence,
  };
}

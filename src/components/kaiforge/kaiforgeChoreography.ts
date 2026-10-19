export type KaiForgeBeat = 'recognition' | 'approach' | 'impact' | 'understanding' | 'release';

export const KAI_FORGE_BEATS = {
  recognitionEnd: 0.18,
  approachEnd: 0.39,
  impactEnd: 0.54,
  understandingEnd: 0.82,
} as const;

export function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function rangeProgress(progress: number, start: number, end: number) {
  return clamp01((progress - start) / (end - start));
}

export function smoothstep(value: number) {
  const value01 = clamp01(value);
  return value01 * value01 * (3 - 2 * value01);
}

export function getKaiForgeBeat(progress: number): KaiForgeBeat {
  if (progress < KAI_FORGE_BEATS.recognitionEnd) return 'recognition';
  if (progress < KAI_FORGE_BEATS.approachEnd) return 'approach';
  if (progress < KAI_FORGE_BEATS.impactEnd) return 'impact';
  if (progress < KAI_FORGE_BEATS.understandingEnd) return 'understanding';
  return 'release';
}

export function getBeatOpacity(
  progress: number,
  center: number,
  halfWidth: number,
  holdHalfWidth = 0,
) {
  const distance = Math.abs(progress - center);
  return smoothstep(1 - Math.max(0, distance - holdHalfWidth) / (halfWidth - holdHalfWidth));
}

export function getImpactProgress(progress: number) {
  return smoothstep(rangeProgress(progress, 0.34, 0.49));
}

export function getUnderstandingProgress(progress: number) {
  return smoothstep(rangeProgress(progress, 0.52, 0.7));
}

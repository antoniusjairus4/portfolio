export type NeuroShieldBeat =
  | 'observation'
  | 'hypothesis'
  | 'experiment'
  | 'evidence'
  | 'uncertainty';

export const NEUROSHIELD_BEATS = {
  observationEnd: 0.2,
  hypothesisEnd: 0.42,
  experimentEnd: 0.64,
  evidenceEnd: 0.84,
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

export function getNeuroShieldBeat(progress: number): NeuroShieldBeat {
  if (progress < NEUROSHIELD_BEATS.observationEnd) return 'observation';
  if (progress < NEUROSHIELD_BEATS.hypothesisEnd) return 'hypothesis';
  if (progress < NEUROSHIELD_BEATS.experimentEnd) return 'experiment';
  if (progress < NEUROSHIELD_BEATS.evidenceEnd) return 'evidence';
  return 'uncertainty';
}

export function getBeatOpacity(progress: number, center: number, halfWidth: number) {
  return smoothstep(1 - Math.abs(progress - center) / halfWidth);
}

export function getHypothesisProgress(progress: number) {
  return smoothstep(rangeProgress(progress, 0.13, 0.38));
}

export function getExperimentProgress(progress: number) {
  return smoothstep(rangeProgress(progress, 0.34, 0.6));
}

export function getEvidenceProgress(progress: number) {
  return smoothstep(rangeProgress(progress, 0.56, 0.82));
}

export function getUncertaintyProgress(progress: number) {
  return smoothstep(rangeProgress(progress, 0.78, 0.96));
}

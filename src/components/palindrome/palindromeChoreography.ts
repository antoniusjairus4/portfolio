export type PalindromeBeat =
  | 'ordinary'
  | 'fragmentation'
  | 'relationships'
  | 'organization'
  | 'control';

export const PALINDROME_BEATS = {
  ordinaryEnd: 0.2,
  fragmentationEnd: 0.42,
  relationshipsEnd: 0.63,
  organizationEnd: 0.84,
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

export function getPalindromeBeat(progress: number): PalindromeBeat {
  if (progress < PALINDROME_BEATS.ordinaryEnd) return 'ordinary';
  if (progress < PALINDROME_BEATS.fragmentationEnd) return 'fragmentation';
  if (progress < PALINDROME_BEATS.relationshipsEnd) return 'relationships';
  if (progress < PALINDROME_BEATS.organizationEnd) return 'organization';
  return 'control';
}

export function getBeatOpacity(progress: number, center: number, halfWidth: number) {
  // Keep a readable plateau within each existing beat, then ease across its edges.
  return smoothstep((halfWidth - Math.abs(progress - center)) / (halfWidth * 0.55));
}

export function getFragmentationProgress(progress: number) {
  return smoothstep(rangeProgress(progress, 0.18, 0.36));
}

export function getRelationshipProgress(progress: number) {
  return smoothstep(rangeProgress(progress, 0.43, 0.58));
}

export function getOrganizationProgress(progress: number) {
  return smoothstep(rangeProgress(progress, 0.65, 0.78));
}

export function getControlProgress(progress: number) {
  return smoothstep(rangeProgress(progress, 0.85, 0.95));
}

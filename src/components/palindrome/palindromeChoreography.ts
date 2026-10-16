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
  return smoothstep(1 - Math.abs(progress - center) / halfWidth);
}

export function getFragmentationProgress(progress: number) {
  return smoothstep(rangeProgress(progress, 0.13, 0.37));
}

export function getRelationshipProgress(progress: number) {
  return smoothstep(rangeProgress(progress, 0.35, 0.61));
}

export function getOrganizationProgress(progress: number) {
  return smoothstep(rangeProgress(progress, 0.57, 0.82));
}

export function getControlProgress(progress: number) {
  return smoothstep(rangeProgress(progress, 0.8, 0.96));
}

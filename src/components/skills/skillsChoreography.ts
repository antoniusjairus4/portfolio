export type SkillCategoryKey =
  | 'programming'
  | 'web'
  | 'backend'
  | 'cybersecurity'
  | 'tools'
  | 'ai-tools';

export const SKILLS_CENTERS = [0.06, 0.23, 0.4, 0.58, 0.76, 0.92] as const;
export const SKILLS_KEYS: readonly SkillCategoryKey[] = [
  'programming',
  'web',
  'backend',
  'cybersecurity',
  'tools',
  'ai-tools',
];

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

export function getSkillsCategoryIndex(progress: number) {
  const value = clamp01(progress);
  for (let index = 0; index < SKILLS_CENTERS.length - 1; index += 1) {
    const boundary = (SKILLS_CENTERS[index] + SKILLS_CENTERS[index + 1]) / 2;
    if (value < boundary) return index;
  }
  return SKILLS_CENTERS.length - 1;
}

export function getSkillsCategory(progress: number): SkillCategoryKey {
  return SKILLS_KEYS[getSkillsCategoryIndex(progress)];
}

export function getCategoryOpacity(progress: number, index: number) {
  const center = SKILLS_CENTERS[index];
  const previous = SKILLS_CENTERS[Math.max(0, index - 1)];
  const next = SKILLS_CENTERS[Math.min(SKILLS_CENTERS.length - 1, index + 1)];
  const halfWidth = Math.max(0.115, Math.min(center - previous || 0.16, next - center || 0.16));
  const centeredOpacity = smoothstep(1 - Math.abs(progress - center) / halfWidth);
  if (index === 0) {
    return centeredOpacity * smoothstep(rangeProgress(progress, 0.03, 0.055));
  }
  return centeredOpacity;
}

export function getLandscapeProgress(progress: number) {
  return smoothstep(rangeProgress(progress, 0.02, 0.94));
}

export function getDepthCollapse(progress: number) {
  return smoothstep(rangeProgress(progress, 0.9, 0.995));
}

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
  const start = index === 0 ? 0.025 : (SKILLS_CENTERS[index - 1] + SKILLS_CENTERS[index]) / 2;
  const end = index === 5 ? 0.982 : (SKILLS_CENTERS[index] + SKILLS_CENTERS[index + 1]) / 2;
  // Long reading plateaus, with only a short overlap at the domain seams.
  return (
    smoothstep(rangeProgress(progress, start - 0.012, start + 0.014)) *
    (1 - smoothstep(rangeProgress(progress, end - 0.014, end + 0.012)))
  );
}

// Each recognition window is a reversible sample of chapter progress, never a
// trigger/timer. A narrow window leaves a quiet road interval between landmarks.
export function getSkillRecognition(
  progress: number,
  domain: number,
  skill: number,
  count: number,
) {
  const start = domain === 0 ? 0.025 : (SKILLS_CENTERS[domain - 1] + SKILLS_CENTERS[domain]) / 2;
  const end = domain === 5 ? 0.978 : (SKILLS_CENTERS[domain] + SKILLS_CENTERS[domain + 1]) / 2;
  const ordinal = ((progress - start) / (end - start)) * count - 0.5;
  return 1 - smoothstep((Math.abs(ordinal - skill) - 0.18) / 0.23);
}

export function getLandscapeProgress(progress: number) {
  return smoothstep(rangeProgress(progress, 0.02, 0.94));
}

export function getDepthCollapse(progress: number) {
  return smoothstep(rangeProgress(progress, 0.9, 0.995));
}

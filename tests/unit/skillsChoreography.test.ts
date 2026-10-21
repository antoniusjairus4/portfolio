import { describe, expect, it } from 'vitest';
import {
  getCategoryOpacity,
  getDepthCollapse,
  getLandscapeProgress,
  getSkillsCategory,
  getSkillsCategoryIndex,
} from '@/components/skills/skillsChoreography';

describe('Skills choreography', () => {
  it('maps progress directly to all six authored categories', () => {
    expect(getSkillsCategory(0.06)).toBe('programming');
    expect(getSkillsCategory(0.23)).toBe('web');
    expect(getSkillsCategory(0.4)).toBe('backend');
    expect(getSkillsCategory(0.58)).toBe('cybersecurity');
    expect(getSkillsCategory(0.76)).toBe('tools');
    expect(getSkillsCategory(0.92)).toBe('ai-tools');
    expect(getSkillsCategoryIndex(0.06)).toBe(0);
    expect(getSkillsCategoryIndex(1)).toBe(5);
  });

  it('reconstructs travel and exit collapse from current progress alone', () => {
    expect(getLandscapeProgress(-1)).toBe(0);
    expect(getLandscapeProgress(1)).toBe(1);
    expect(getDepthCollapse(0.89)).toBe(0);
    expect(getDepthCollapse(1)).toBe(1);
    expect(getSkillsCategory(0.92)).toBe('ai-tools');
    expect(getSkillsCategory(0.23)).toBe('web');
  });

  it('gives each category one readable center', () => {
    // The existing entrance starts at .013; .02 is already inside its fade.
    expect(getCategoryOpacity(0.01, 0)).toBe(0);
    expect(getCategoryOpacity(0.02, 0)).toBeGreaterThan(0);
    expect(getCategoryOpacity(0.02, 0)).toBeLessThan(1);
    expect(getCategoryOpacity(0.06, 0)).toBe(1);
    expect(getCategoryOpacity(0.4, 2)).toBe(1);
    expect(getCategoryOpacity(0.92, 2)).toBe(0);
  });
});

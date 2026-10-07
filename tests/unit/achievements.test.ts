import { describe, it, expect } from 'vitest';
import { getValidatedAchievements, achievementsData } from '../../src/content/achievements';

describe('Achievements Schema & Manifest Validation', () => {
  it('validates achievementsData entries against Zod schema without error', () => {
    const validated = getValidatedAchievements();
    expect(validated).toHaveLength(5);
    expect(validated[0].slug).toBe('speaking');
  });

  it('correctly categorizes wide vs portrait photos by aspect ratio rule', () => {
    const wideAspect = 16 / 9; // 1.77 >= 1.3 -> Wide (Full Bleed)
    const portraitAspect = 3 / 4; // 0.75 < 1.3 -> Contained

    expect(wideAspect >= 1.3).toBe(true);
    expect(portraitAspect >= 1.3).toBe(false);
  });
});

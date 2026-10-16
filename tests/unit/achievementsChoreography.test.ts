import { describe, expect, it } from 'vitest';
import {
  getAchievementBeat,
  getDisciplineMotion,
} from '@/components/achievements-kinetic/achievementsChoreography';

describe('Achievements kinetic choreography', () => {
  it('maps all four disciplines to distinct authored beats', () => {
    expect(getAchievementBeat('table-tennis', 0.3)).toBe('trajectory');
    expect(getAchievementBeat('karate', 0.3)).toBe('impact');
    expect(getAchievementBeat('chess', 0.65)).toBe('ratings');
    expect(getAchievementBeat('public-speaking', 0.62)).toBe('audience');
  });

  it('reconstructs reverse and direct jumps from current progress', () => {
    expect(getAchievementBeat('public-speaking', 0.92)).toBe('silence');
    expect(getAchievementBeat('karate', 0.3)).toBe('impact');
    expect(getAchievementBeat('table-tennis', 0.58)).toBe('peak');
    expect(getAchievementBeat('chess', 0.25)).toBe('calculation');
  });

  it('keeps motion values finite and clamps out-of-range progress', () => {
    for (const discipline of ['table-tennis', 'karate', 'chess', 'public-speaking'] as const) {
      for (const progress of [-2, 0, 0.5, 1, 3]) {
        for (const value of Object.values(getDisciplineMotion(discipline, progress))) {
          expect(Number.isFinite(value)).toBe(true);
        }
      }
    }
  });
});

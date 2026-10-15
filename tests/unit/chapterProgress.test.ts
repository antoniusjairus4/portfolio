import { describe, expect, it } from 'vitest';
import { getChapterProgress } from '@/experience/chapterProgress';

describe('chapter progress', () => {
  it('derives normalized progress from current document geometry', () => {
    expect(getChapterProgress(900, 4500, 900)).toBe(0);
    expect(getChapterProgress(0, 4500, 900)).toBe(0);
    expect(getChapterProgress(-1800, 4500, 900)).toBe(0.5);
    expect(getChapterProgress(-3600, 4500, 900)).toBe(1);
    expect(getChapterProgress(-9000, 4500, 900)).toBe(1);
  });
});

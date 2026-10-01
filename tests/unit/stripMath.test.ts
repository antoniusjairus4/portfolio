import { describe, expect, it } from 'vitest';
import { computeStripProgress, getStripCount, pseudoRandom } from '../../src/components/layout/tear/stripMath';
import { SCROLL_STORY } from '../../src/motion/tokens';

describe('Phase 3: 3D Strip Tear Math & Breakpoint Logic', () => {
  it('returns correct strip count per breakpoint', () => {
    expect(getStripCount(1440)).toBe(SCROLL_STORY.strips.desktop); // 7
    expect(getStripCount(1024)).toBe(SCROLL_STORY.strips.desktop); // 7
    expect(getStripCount(900)).toBe(SCROLL_STORY.strips.tablet);   // 5
    expect(getStripCount(640)).toBe(SCROLL_STORY.strips.tablet);   // 5
    expect(getStripCount(390)).toBe(SCROLL_STORY.strips.mobile);   // 4
    expect(getStripCount(320)).toBe(SCROLL_STORY.strips.mobile);   // 4
  });

  it('orders strips right-to-left (right-most strip starts first)', () => {
    const totalStrips = 7;
    // Progress = 0.05: right-most strip (index 6) should have started, index 0 should be 0
    const pRightMost = computeStripProgress({ stripIndex: 6, totalStrips, overallProgress: 0.05 });
    const pLeftMost = computeStripProgress({ stripIndex: 0, totalStrips, overallProgress: 0.05 });

    expect(pRightMost).toBeGreaterThan(0);
    expect(pLeftMost).toBe(0);
  });

  it('is strictly monotonic and every strip reaches 1.0 at 100% progress', () => {
    const totalStrips = 7;
    for (let i = 0; i < totalStrips; i++) {
      let prevP = 0;
      for (let step = 0; step <= 20; step++) {
        const p = step / 20;
        const stripP = computeStripProgress({ stripIndex: i, totalStrips, overallProgress: p });
        expect(stripP).toBeGreaterThanOrEqual(prevP);
        prevP = stripP;
      }
      expect(prevP).toBe(1);
    }
  });


  it('generates deterministic pseudo-random values with same seed', () => {
    const rng1 = pseudoRandom(42);
    const rng2 = pseudoRandom(42);

    const val1 = Array.from({ length: 5 }, () => rng1());
    const val2 = Array.from({ length: 5 }, () => rng2());

    expect(val1).toEqual(val2);
  });
});

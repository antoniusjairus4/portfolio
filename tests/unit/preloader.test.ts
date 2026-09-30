import { describe, expect, it } from 'vitest';
import { computeSmoothedProgress } from '../../src/components/preloader/usePreloaderProgress';

describe('Preloader Progress Timing Logic', () => {
  it('starts at 0% when elapsed time is 0', () => {
    expect(computeSmoothedProgress(0, false)).toBe(0);
  });

  it('reaches 100% at minDurationMs (3000ms) when assets are loaded', () => {
    const progress = computeSmoothedProgress(3000, true, 3000, 4800);
    expect(progress).toBe(100);
  });

  it('hard caps at 100% at maxDurationMs (4800ms) even if assets are slow', () => {
    const progress = computeSmoothedProgress(4800, false, 3000, 4800);
    expect(progress).toBe(100);
  });

  it('is monotonic (never decreases over time)', () => {
    let lastProgress = 0;
    for (let time = 0; time <= 5000; time += 100) {
      const current = computeSmoothedProgress(time, time > 2000, 3000, 4800);
      expect(current).toBeGreaterThanOrEqual(lastProgress);
      lastProgress = current;
    }
  });

  it('does not exceed 95% before maxDurationMs if assets are not loaded', () => {
    const progress = computeSmoothedProgress(4000, false, 3000, 4800);
    expect(progress).toBeLessThanOrEqual(95);
  });
});

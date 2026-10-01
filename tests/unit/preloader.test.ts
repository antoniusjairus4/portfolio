import { describe, expect, it } from 'vitest';
import { heroContent } from '../../src/content/heroContent';
import { computeSmoothedProgress } from '../../src/components/preloader/usePreloaderProgress';
import { PRELOADER_TIMINGS, SCROLL_STORY } from '../../src/motion/tokens';


describe('Preloader Progress Timing & Beat Boundary Logic', () => {
  it('starts at 0% when elapsed time is 0', () => {
    expect(computeSmoothedProgress(0, false)).toBe(0);
  });

  it('reaches 100% at minDurationMs (6000ms) when assets are loaded', () => {
    const progress = computeSmoothedProgress(
      PRELOADER_TIMINGS.minDurationMs,
      true,
      PRELOADER_TIMINGS.minDurationMs,
      PRELOADER_TIMINGS.maxDurationMs
    );
    expect(progress).toBe(100);
  });

  it('hard caps at 100% at maxDurationMs (8000ms) even if assets are slow', () => {
    const progress = computeSmoothedProgress(
      PRELOADER_TIMINGS.maxDurationMs,
      false,
      PRELOADER_TIMINGS.minDurationMs,
      PRELOADER_TIMINGS.maxDurationMs
    );
    expect(progress).toBe(100);
  });

  it('is monotonic (never decreases over time)', () => {
    let lastProgress = 0;
    for (let time = 0; time <= 8500; time += 100) {
      const current = computeSmoothedProgress(
        time,
        time > 3000,
        PRELOADER_TIMINGS.minDurationMs,
        PRELOADER_TIMINGS.maxDurationMs
      );
      expect(current).toBeGreaterThanOrEqual(lastProgress);
      lastProgress = current;
    }
  });

  it('does not exceed 95% before maxDurationMs if assets are not loaded', () => {
    const progress = computeSmoothedProgress(
      7000,
      false,
      PRELOADER_TIMINGS.minDurationMs,
      PRELOADER_TIMINGS.maxDurationMs
    );
    expect(progress).toBeLessThanOrEqual(95);
  });

  it('exports valid scroll story beat boundary constants', () => {
    expect(SCROLL_STORY.beats.revealEnd).toBe(0.22);
    expect(SCROLL_STORY.beats.readEnd).toBe(0.35);
    expect(SCROLL_STORY.beats.exitEnd).toBe(0.60);
    expect(SCROLL_STORY.beats.holdEnd).toBe(0.64);
    expect(SCROLL_STORY.beats.collapseEnd).toBe(1.00);
    expect(SCROLL_STORY.totalDistanceVh).toBe(550);
  });

  it('contains the updated role copy: Student, Freelancer, Entrepreneur', () => {
    expect(heroContent.roles).toEqual(['Student', 'Freelancer', 'Entrepreneur']);
  });
});



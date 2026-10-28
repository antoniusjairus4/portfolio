import { describe, expect, it } from 'vitest';
import { criticalProgress } from '../../src/components/preloader/useCriticalReadiness';
import { heroContent } from '../../src/content/heroContent';
import { SCROLL_STORY } from '../../src/motion/tokens';

describe('Preloader readiness and story constants', () => {
  it('reports completed resources, not elapsed time', () => {
    expect(criticalProgress(0, 2)).toBe(0);
    expect(criticalProgress(1, 2)).toBe(50);
    expect(criticalProgress(2, 2)).toBe(100);
  });

  it('exports valid scroll story beat boundary constants', () => {
    expect(SCROLL_STORY.beats.revealEnd).toBe(0.03);
    expect(SCROLL_STORY.beats.readEnd).toBe(0.05);
    expect(SCROLL_STORY.beats.exitEnd).toBe(0.08);
    expect(SCROLL_STORY.beats.holdEnd).toBe(0.08);
    expect(SCROLL_STORY.beats.collapseEnd).toBe(0.88);
    expect(SCROLL_STORY.totalDistanceVh).toBe(180);
  });

  it('contains the updated role copy: Student, Freelancer, Entrepreneur', () => {
    expect(heroContent.roles).toEqual(['Student', 'Freelancer', 'Entrepreneur']);
  });
});

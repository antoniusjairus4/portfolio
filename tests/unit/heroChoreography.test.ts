import { describe, expect, it } from 'vitest';
import {
  getHeroChoreographyState,
  getHeroCollapseProgress,
} from '../../src/components/layout/heroChoreography';
import { heroContent } from '../../src/content/heroContent';

describe('Hero choreography contract', () => {
  it('publishes the complete identity', () => {
    expect(heroContent.name).toBe('ANTONIUS JAIRUS');
  });

  it('derives every state from current progress in both directions', () => {
    expect(getHeroChoreographyState(0)).toBe('portrait');
    expect(getHeroChoreographyState(0.02)).toBe('opening');
    expect(getHeroChoreographyState(0.04)).toBe('identity');
    expect(getHeroChoreographyState(0.06)).toBe('exit-preparation');
    expect(getHeroChoreographyState(0.5)).toBe('collapse');
    expect(getHeroChoreographyState(1)).toBe('handoff');
    expect(getHeroChoreographyState(0.04)).toBe('identity');
    expect(getHeroChoreographyState(0)).toBe('portrait');
  });

  it('clamps physics playback to its owned interval', () => {
    expect(getHeroCollapseProgress(0.05)).toBe(0);
    expect(getHeroCollapseProgress(0.5)).toBeGreaterThan(0);
    expect(getHeroCollapseProgress(0.5)).toBeLessThan(1);
    expect(getHeroCollapseProgress(1)).toBe(1);
  });
});

import { describe, expect, it } from 'vitest';
import {
  getBeatOpacity,
  getImpactProgress,
  getKaiForgeBeat,
  getUnderstandingProgress,
  rangeProgress,
} from '@/components/kaiforge/kaiforgeChoreography';

describe('KaiForge choreography', () => {
  it('maps direct progress jumps to deterministic narrative beats', () => {
    expect(getKaiForgeBeat(0)).toBe('recognition');
    expect(getKaiForgeBeat(0.28)).toBe('approach');
    expect(getKaiForgeBeat(0.455)).toBe('impact');
    expect(getKaiForgeBeat(0.67)).toBe('understanding');
    expect(getKaiForgeBeat(0.91)).toBe('release');
    expect(getKaiForgeBeat(0.1)).toBe('recognition');
  });

  it('clamps local action progress for reverse and direct reconstruction', () => {
    expect(rangeProgress(-1, 0.2, 0.4)).toBe(0);
    expect(rangeProgress(0.3, 0.2, 0.4)).toBeCloseTo(0.5);
    expect(rangeProgress(2, 0.2, 0.4)).toBe(1);
    expect(getImpactProgress(0.2)).toBe(0);
    expect(getImpactProgress(0.6)).toBe(1);
    expect(getUnderstandingProgress(0.4)).toBe(0);
    expect(getUnderstandingProgress(0.8)).toBe(1);
  });

  it('gives each copy beat one clear readable center', () => {
    expect(getBeatOpacity(0.28, 0.28, 0.15)).toBe(1);
    expect(getBeatOpacity(0.6, 0.28, 0.15)).toBe(0);
  });
});

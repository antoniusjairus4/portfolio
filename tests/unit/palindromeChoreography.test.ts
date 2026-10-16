import { describe, expect, it } from 'vitest';
import {
  getBeatOpacity,
  getControlProgress,
  getFragmentationProgress,
  getOrganizationProgress,
  getPalindromeBeat,
  getRelationshipProgress,
  rangeProgress,
} from '@/components/palindrome/palindromeChoreography';

describe('Palindrome choreography', () => {
  it('maps current progress directly to all five narrative beats', () => {
    expect(getPalindromeBeat(0.08)).toBe('ordinary');
    expect(getPalindromeBeat(0.29)).toBe('fragmentation');
    expect(getPalindromeBeat(0.515)).toBe('relationships');
    expect(getPalindromeBeat(0.735)).toBe('organization');
    expect(getPalindromeBeat(0.92)).toBe('control');
    expect(getPalindromeBeat(0.1)).toBe('ordinary');
  });

  it('clamps every transformation for reverse and direct reconstruction', () => {
    expect(rangeProgress(-1, 0.2, 0.4)).toBe(0);
    expect(rangeProgress(2, 0.2, 0.4)).toBe(1);
    expect(getFragmentationProgress(0.1)).toBe(0);
    expect(getFragmentationProgress(0.5)).toBe(1);
    expect(getRelationshipProgress(0.3)).toBe(0);
    expect(getRelationshipProgress(0.7)).toBe(1);
    expect(getOrganizationProgress(0.5)).toBe(0);
    expect(getOrganizationProgress(0.9)).toBe(1);
    expect(getControlProgress(0.75)).toBe(0);
    expect(getControlProgress(1)).toBe(1);
  });

  it('gives supporting copy a single readable center', () => {
    expect(getBeatOpacity(0.515, 0.515, 0.14)).toBe(1);
    expect(getBeatOpacity(0.8, 0.515, 0.14)).toBe(0);
  });
});

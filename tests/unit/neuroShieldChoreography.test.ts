import { describe, expect, it } from 'vitest';
import {
  getBeatOpacity,
  getEvidenceProgress,
  getExperimentProgress,
  getHypothesisProgress,
  getNeuroShieldBeat,
  getUncertaintyProgress,
  rangeProgress,
} from '@/components/neuroshield/neuroShieldChoreography';

describe('NeuroShield choreography', () => {
  it('maps current progress directly to all five research beats', () => {
    expect(getNeuroShieldBeat(0.08)).toBe('observation');
    expect(getNeuroShieldBeat(0.29)).toBe('hypothesis');
    expect(getNeuroShieldBeat(0.52)).toBe('experiment');
    expect(getNeuroShieldBeat(0.74)).toBe('evidence');
    expect(getNeuroShieldBeat(0.92)).toBe('uncertainty');
    expect(getNeuroShieldBeat(0.08)).toBe('observation');
  });

  it('clamps every structure reveal for reverse and direct reconstruction', () => {
    expect(rangeProgress(-1, 0.2, 0.4)).toBe(0);
    expect(rangeProgress(2, 0.2, 0.4)).toBe(1);
    expect(getHypothesisProgress(0.1)).toBe(0);
    expect(getHypothesisProgress(0.5)).toBe(1);
    expect(getExperimentProgress(0.3)).toBe(0);
    expect(getExperimentProgress(0.7)).toBe(1);
    expect(getEvidenceProgress(0.5)).toBe(0);
    expect(getEvidenceProgress(0.9)).toBe(1);
    expect(getUncertaintyProgress(0.7)).toBe(0);
    expect(getUncertaintyProgress(1)).toBe(1);
  });

  it('keeps supporting copy centered on a single readable beat', () => {
    expect(getBeatOpacity(0.52, 0.52, 0.14)).toBe(1);
    expect(getBeatOpacity(0.8, 0.52, 0.14)).toBe(0);
  });
});

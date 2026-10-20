import { Vector3 } from 'three';
import { rangeProgress, smoothstep } from '@/components/neuroshield/neuroShieldChoreography';

export const scanRamp = (p: number, a: number, b: number) => smoothstep(rangeProgress(p, a, b));

export const SCAN_LENGTH = 32;
export const SCAN_EXIT = 1.12;

export function scanSpread(p: number) {
  return 0.09 + 0.91 * scanRamp(p, 0.35, 0.51);
}

// A spatial study of supplied 2D sources, not a registered clinical volume.
// The lower path is deliberately abstract; it makes no anatomical claims.
export function scanPath(t: number, spread: number, out: Vector3) {
  const bounded = Math.max(0, Math.min(1, t));
  return out.set(
    Math.sin(bounded * Math.PI) * 0.85 * spread * scanRamp(bounded, 0.18, 0.4),
    // In the head's acquisition frame, positive Y follows the posterior
    // direction. Negative Y would bend the descent forward toward the lap.
    3.2 * scanRamp(bounded, 0.35, 1) * spread,
    -SCAN_LENGTH * t * spread,
  );
}

export function scanCursor(p: number) {
  return -0.055 + (SCAN_EXIT + 0.055) * scanRamp(p, 0.48, 0.9);
}

// The spine is revealed only after the camera clears the cervical entry.
export function spineReveal(p: number) {
  return scanRamp(scanCursor(p), 0.12, 0.2);
}

// These are the existing environment's first six section frames. The final
// extracted boundaries converge here before the chapter takes ownership.
export const RESEARCH_FRAMES = [
  { at: [-4.5, 2.1, 3.5], turn: [0, 0.58, 0], size: [4.4, 6.4] },
  { at: [4.7, 2, -0.6], turn: [0, -0.72, 0], size: [4.7, 6.6] },
  { at: [-4.1, 1.5, -7], turn: [0, 0.38, 0.04], size: [4, 5.6] },
  { at: [4.6, 2.4, -11], turn: [0, -0.47, -0.04], size: [4.8, 6] },
  { at: [-4.6, 2, -17], turn: [0, 0.62, 0], size: [4.2, 6.2] },
  { at: [4.4, 2.8, -23], turn: [0, -0.4, -0.04], size: [5, 6.5] },
] as const;

import { CatmullRomCurve3, Vector3 } from 'three';
import { smoothstep, rangeProgress } from '@/components/kaiforge/kaiforgeChoreography';

export const PALETTE = {
  ink: '#111111',
  parchment: '#F2E8D5',
  mineral: '#c5bbaa',
  crimson: '#8B1E2D',
};
export const CONTACT = new Vector3(-1.2514, 1.3125, 0.0638);
export const BLADE = new Vector3(-1.2764, 1.3125, 0.0638);
export const ROOT = new Vector3(-1.95, 0.025, 0.38);
const vectors = (points: number[][]) => points.map(([x, y, z]) => new Vector3(x, y, z));
export const CAMERAS = {
  desktop: vectors([
    [0, 2.5, 5.8],
    [-1.5, 2.1, 4.6],
    [-1.65, 1.9, 4.6],
    [1.7, 2.7, 4.7],
    [0, 3.35, 5.6],
  ]),
  desktopTargets: vectors([
    [0, 0.95, 0],
    [-0.6, 1, 0],
    [-1.22, 1.08, 0.05],
    [-0.3, 1.05, -0.05],
    [0, 1.1, -0.1],
  ]),
  portrait: vectors([
    [0, 3.9, 12.5],
    [-1.35, 2.9, 8.2],
    [-1.55, 2.4, 6.8],
    [1.1, 3.5, 9.3],
    [0, 4.3, 12.8],
  ]),
  portraitTargets: vectors([
    [0, 0.9, 0],
    [-0.9, 1, 0],
    [-1.05, 1.12, 0.05],
    [-0.55, 1.05, -0.05],
    [0, 1.15, -0.1],
  ]),
};
export function sampleCamera(points: Vector3[], progress: number, out: Vector3) {
  const scaled = Math.min(4, Math.max(0, progress * 4));
  const index = Math.min(3, Math.floor(scaled));
  return out.copy(points[index]).lerp(points[index + 1], smoothstep(scaled - index));
}
export const releaseProgress = (p: number) => smoothstep(rangeProgress(p, 0.82, 1));
// A single contact punctuation: absolute progress, never a completion callback.
export const impactPulse = (p: number) => Math.sin(Math.PI * rangeProgress(p, 0.405, 0.54));

export function createTrajectory() {
  return new CatmullRomCurve3([
    CONTACT.clone(),
    new Vector3(-0.58, 1.43, 0.02),
    new Vector3(0.05, 1.13, -0.05),
    new Vector3(0.75, 0.78, -0.16),
    new Vector3(1.25, 1.05, -0.22),
  ]);
}

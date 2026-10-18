import { describe, expect, it } from 'vitest';
import { PerspectiveCamera, Vector3 } from 'three';
import {
  CAMERAS,
  CONTACT,
  BLADE,
  createTrajectory,
  sampleCamera,
  impactPulse,
} from '@/webgl/scenes/kaiforge/staging';

describe('KaiForge production metre staging', () => {
  it('preserves the projected center seam at entry and exit on both camera paths', () => {
    for (const portrait of [false, true]) {
      const camera = new PerspectiveCamera(
        portrait ? 46 : 39,
        portrait ? 390 / 844 : 1440 / 900,
        0.1,
        50,
      );
      for (const p of [0, 1]) {
        sampleCamera(portrait ? CAMERAS.portrait : CAMERAS.desktop, p, camera.position);
        camera.lookAt(
          sampleCamera(
            portrait ? CAMERAS.portraitTargets : CAMERAS.desktopTargets,
            p,
            new Vector3(),
          ),
        );
        camera.updateMatrixWorld();
        expect(new Vector3(0, 0.83625, 0).project(camera).x).toBeCloseTo(0, 10);
      }
    }
  });
  it('keeps the illustrative physical ball above table and net, starting at the locked face', () => {
    const curve = createTrajectory();
    expect(curve.getPoint(0).distanceTo(CONTACT)).toBe(0);
    expect(CONTACT.distanceTo(BLADE)).toBeCloseTo(0.025, 10);
    for (let i = 0; i <= 1000; i++) {
      const point = curve.getPoint(i / 1000);
      expect(point.y - 0.02).toBeGreaterThanOrEqual(0.759); // 1 mm contact tolerance at bounce
      if (Math.abs(point.x) < 0.02) expect(point.y - 0.02).toBeGreaterThan(0.9125);
    }
  });
  it('reconstructs camera and crimson from progress independent of sampling history', () => {
    const baseline = sampleCamera(CAMERAS.desktop, 0.455, new Vector3()).toArray();
    const scratch = new Vector3();
    for (const p of [0.9, 0, 0.67, 1, 0.455]) sampleCamera(CAMERAS.desktop, p, scratch);
    expect(scratch.toArray()).toEqual(baseline);
    expect(impactPulse(0.2)).toBe(0);
    expect(impactPulse(0.8)).toBeCloseTo(0, 10);
  });
});

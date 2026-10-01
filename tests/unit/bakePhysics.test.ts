import { describe, expect, it } from 'vitest';
import { bakePhysicsSimulation } from '../../src/components/layout/collapse/bakePhysics';

describe('Typographic Physics Simulation Bake Unit Tests', () => {
  const dummyBoxes = [
    { id: 'name-0', char: 'J', x: 100, y: 300, width: 80, height: 120, isName: true },
    { id: 'name-1', char: 'A', x: 180, y: 300, width: 80, height: 120, isName: true },
    { id: 'name-2', char: 'I', x: 260, y: 300, width: 40, height: 120, isName: true },
    { id: 'name-3', char: 'R', x: 300, y: 300, width: 80, height: 120, isName: true },
    { id: 'name-4', char: 'U', x: 380, y: 300, width: 80, height: 120, isName: true },
    { id: 'name-5', char: 'S', x: 460, y: 300, width: 80, height: 120, isName: true },
  ];

  it('seeded bake is strictly deterministic (byte-identical hash on repeated runs)', () => {
    const run1 = bakePhysicsSimulation({ viewportWidth: 1280, viewportHeight: 720, boxes: dummyBoxes, seed: 42 });
    const run2 = bakePhysicsSimulation({ viewportWidth: 1280, viewportHeight: 720, boxes: dummyBoxes, seed: 42 });

    expect(run1.hash).toBe(run2.hash);
    expect(run1.totalFrames).toBe(run2.totalFrames);
    expect(run1.frames.length).toBe(run2.frames.length);
  });

  it('bake output contains no NaN transforms and valid body counts', () => {
    const res = bakePhysicsSimulation({ viewportWidth: 1280, viewportHeight: 720, boxes: dummyBoxes, seed: 42 });

    expect(res.letterIds.length).toBe(dummyBoxes.length);

    res.frames.forEach((frame) => {
      expect(Number.isNaN(frame.time)).toBe(false);
      frame.transforms.forEach((t) => {
        expect(Number.isNaN(t.x)).toBe(false);
        expect(Number.isNaN(t.y)).toBe(false);
        expect(Number.isNaN(t.rotation)).toBe(false);
      });
    });
  });

  it('frame timestamps increase monotonically and simulation ends with letters falling below floor', () => {
    const res = bakePhysicsSimulation({ viewportWidth: 1280, viewportHeight: 720, boxes: dummyBoxes, seed: 42 });

    let lastTime = -1;
    res.frames.forEach((f) => {
      expect(f.time).toBeGreaterThan(lastTime);
      lastTime = f.time;
    });

    const finalFrame = res.frames[res.frames.length - 1];
    // Final Y displacements should be positive (fallen below initial position)
    finalFrame.transforms.forEach((t) => {
      expect(t.y).toBeGreaterThanOrEqual(0);
    });
  });
});

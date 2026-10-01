import { bakePhysicsSimulation, BakeResult, LetterBox } from './bakePhysics';

export interface PhysicsCollapseController {
  bakeResult: BakeResult | null;
  bakeTimeMs: number;
  isBaking: boolean;
  bake: (viewportWidth: number, viewportHeight: number, boxes: LetterBox[]) => BakeResult | null;
  applyFrame: (progress: number, letterElementsMap: Map<string, HTMLElement>) => void;
  resetTransforms: (letterElementsMap: Map<string, HTMLElement>) => void;
}

export function createPhysicsCollapseController(): PhysicsCollapseController {
  let bakeResult: BakeResult | null = null;
  let bakeTimeMs = 0;
  let isBaking = false;

  const bake = (viewportWidth: number, viewportHeight: number, boxes: LetterBox[]) => {
    if (boxes.length === 0 || viewportWidth === 0 || viewportHeight === 0) return null;
    isBaking = true;
    const start = performance.now();

    try {
      bakeResult = bakePhysicsSimulation({
        viewportWidth,
        viewportHeight,
        boxes,
        seed: 42,
      });
      bakeTimeMs = performance.now() - start;
    } catch (err) {
      console.warn('Physics bake failed, falling back to crossfade:', err);
      bakeResult = null;
    } finally {
      isBaking = false;
    }

    return bakeResult;
  };

  const applyFrame = (progress: number, letterElementsMap: Map<string, HTMLElement>) => {
    if (!bakeResult || bakeResult.frames.length === 0) return;

    const clampedP = Math.min(Math.max(progress, 0), 1);
    const frameFloat = clampedP * (bakeResult.totalFrames - 1);
    const frameLow = Math.floor(frameFloat);
    const frameHigh = Math.min(frameLow + 1, bakeResult.totalFrames - 1);
    const lerpFactor = frameFloat - frameLow;

    const f1 = bakeResult.frames[frameLow];
    const f2 = bakeResult.frames[frameHigh];

    bakeResult.letterIds.forEach((id: string, idx: number) => {
      const el = letterElementsMap.get(id);
      if (!el) return;

      const t1 = f1.transforms[idx];
      const t2 = f2.transforms[idx];

      const x = t1.x + (t2.x - t1.x) * lerpFactor;
      const y = t1.y + (t2.y - t1.y) * lerpFactor;
      const r = t1.rotation + (t2.rotation - t1.rotation) * lerpFactor;

      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0px) rotate(${r.toFixed(3)}rad)`;
    });
  };

  const resetTransforms = (letterElementsMap: Map<string, HTMLElement>) => {
    letterElementsMap.forEach((el) => {
      el.style.transform = '';
    });
  };

  return {
    get bakeResult() {
      return bakeResult;
    },
    get bakeTimeMs() {
      return bakeTimeMs;
    },
    get isBaking() {
      return isBaking;
    },
    bake,
    applyFrame,
    resetTransforms,
  };
}

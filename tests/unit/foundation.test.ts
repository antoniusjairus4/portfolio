import { describe, expect, it, vi } from 'vitest';
import { classifyChapter } from '../../src/experience/useChapterActivity';
import { ScrollLockManager } from '../../src/motion/lenis/ScrollLockManager';

describe('scroll lock ownership', () => {
  it('holds nested locks and restores original styles exactly once', () => {
    const onChange = vi.fn();
    const manager = new ScrollLockManager(onChange);
    document.documentElement.style.overflow = 'scroll';
    document.body.style.overflow = 'auto';

    const releaseA = manager.acquire();
    const releaseB = manager.acquire();
    expect(manager.locked).toBe(true);
    expect(document.documentElement.style.overflow).toBe('hidden');
    releaseA();
    expect(manager.locked).toBe(true);
    releaseB();
    releaseB();

    expect(manager.locked).toBe(false);
    expect(document.documentElement.style.overflow).toBe('scroll');
    expect(document.body.style.overflow).toBe('auto');
    expect(onChange.mock.calls).toEqual([[true], [false]]);
    manager.dispose();
  });

  it('blocks page wheel and keyboard scrolling, then releases listeners on dispose', () => {
    const manager = new ScrollLockManager(() => {});
    manager.acquire();
    const wheel = new WheelEvent('wheel', { bubbles: true, cancelable: true });
    document.dispatchEvent(wheel);
    expect(wheel.defaultPrevented).toBe(true);
    const key = new KeyboardEvent('keydown', { key: 'PageDown', bubbles: true, cancelable: true });
    document.dispatchEvent(key);
    expect(key.defaultPrevented).toBe(true);

    manager.dispose();
    expect(manager.locked).toBe(false);
    const after = new WheelEvent('wheel', { bubbles: true, cancelable: true });
    document.dispatchEvent(after);
    expect(after.defaultPrevented).toBe(false);
  });
});

describe('chapter activity classification', () => {
  it('derives activity from position without historical state', () => {
    expect(classifyChapter(1500, 2000, 800)).toBe('inactive');
    expect(classifyChapter(900, 1300, 800)).toBe('approaching');
    expect(classifyChapter(100, 900, 800)).toBe('active');
    expect(classifyChapter(-700, 100, 800)).toBe('leaving');
    expect(classifyChapter(100, 900, 800)).toBe('active');
  });
});

const SCROLL_KEYS = new Set([
  'ArrowDown',
  'ArrowUp',
  'ArrowLeft',
  'ArrowRight',
  'PageDown',
  'PageUp',
  'Home',
  'End',
  ' ',
  'Spacebar',
]);

export class ScrollLockManager {
  private locks = new Set<symbol>();
  private previousStyles: { htmlOverflow: string; bodyOverflow: string } | null = null;

  constructor(private onChange: (locked: boolean) => void) {}

  get locked() {
    return this.locks.size > 0;
  }

  acquire(): () => void {
    const token = Symbol('scroll-lock');
    this.locks.add(token);
    if (this.locks.size === 1) this.activate();

    let released = false;
    return () => {
      if (released) return;
      released = true;
      this.locks.delete(token);
      if (this.locks.size === 0) this.deactivate();
    };
  }

  dispose() {
    this.locks.clear();
    // Provider teardown must restore DOM state without restarting Lenis or
    // refreshing ScrollTriggers that React is concurrently unmounting.
    this.deactivate(false);
  }

  private preventScroll = (event: Event) => {
    if (event.target instanceof Element && event.target.closest('[data-scroll-lock-allow]')) return;
    event.preventDefault();
  };

  private preventKeys = (event: KeyboardEvent) => {
    if (!SCROLL_KEYS.has(event.key)) return;
    const target = event.target;
    if (target instanceof Element && target.closest('[data-scroll-lock-allow]')) return;
    if (
      target instanceof HTMLElement &&
      (target.isContentEditable ||
        target.closest('input, textarea, select, button, [role="button"]'))
    ) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  };

  private activate() {
    this.previousStyles = {
      htmlOverflow: document.documentElement.style.overflow,
      bodyOverflow: document.body.style.overflow,
    };
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.addEventListener('wheel', this.preventScroll, { passive: false, capture: true });
    document.addEventListener('touchmove', this.preventScroll, { passive: false, capture: true });
    document.addEventListener('keydown', this.preventKeys, true);
    this.onChange(true);
  }

  private deactivate(notify = true) {
    if (!this.previousStyles) return;
    document.documentElement.style.overflow = this.previousStyles.htmlOverflow;
    document.body.style.overflow = this.previousStyles.bodyOverflow;
    this.previousStyles = null;
    document.removeEventListener('wheel', this.preventScroll, true);
    document.removeEventListener('touchmove', this.preventScroll, true);
    document.removeEventListener('keydown', this.preventKeys, true);
    if (notify) this.onChange(false);
  }
}

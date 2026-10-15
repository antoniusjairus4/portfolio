# Phase 0 foundation contract

The [Experience Bible](./EXPERIENCE_BIBLE.md) remains the creative authority. This file records the small runtime boundaries added before any new world is built.

## Scroll

The browser document position is authoritative. `LenisProvider` owns the only Lenis instance and its named GSAP ticker callback. `ScrollTrigger` reads Lenis scroll updates, and continues to work with native scrolling when reduced motion disables Lenis. The provider no longer forces the page to the top or overrides browser restoration. Consumers receive the live Lenis instance after it exists; they can fall back to native scrolling while it is absent.

`ScrollLockManager` owns page overflow and wheel, touch, and keyboard scroll blocking. Every caller acquires a release function, including the preloader and the legacy modal/terminal. Locks are reference-counted, idempotently released, and cleared when the provider unmounts. Internal scroll regions can opt in with `data-scroll-lock-allow`. Future modal or transition code must use this manager rather than manipulating body overflow or directly stopping Lenis.

## Readiness

The current preloader counts two real critical resources: the Hero portrait's decoded image and the Cinzel Decorative identity font. It exits once both settle. An eight-second failure timeout releases the page as a degraded state without claiming false progress. Skip and reduced-motion paths release promptly. The preloader visual remains unchanged. Future chapter assets are intentionally absent from this initial gate; compressed assets can later be prefetched ahead of their chapters.

## Activity and renderer boundary

`useChapterActivity` supplies approximate, position-derived `inactive`, `approaching`, `active`, and `leaving` states. It is for prefetch and pause decisions, not high-frequency camera animation. Reversal or a direct jump recomputes from the document position.

No empty R3F canvas is mounted in Phase 0. The future shared renderer belongs above the project and Skills chapters, reads the same chapter activity/progress, and owns only the active world plus a bounded transition neighbor. Existing raw Three effects stay separate until their migration is justified. Achievements and Contact remain DOM/CSS chapters. The story must work without the renderer: essential names, descriptions, facts, and links belong in semantic HTML.

`GlobalEtherProvider` explicitly sets legacy global Ether to `enabled`, `paused`, or `disabled`. `disabled` unmounts the renderer. Reduced motion and no-WebGL fallback avoid mounting it; a paused mode retains its current frame. Future Contact must select `disabled`. Local `LiquidEther` instances now also respect reduced motion and the quality tier, but their chapter-specific ownership still requires review during the relevant chapter work.

## Environment

`ExperienceEnvironmentProvider` owns the live reduced-motion and fine-pointer media queries. Its quality tier uses WebGL availability plus coarse/small viewport as conservative signals, with DPR caps of 2 or 1.5. Reduced motion and quality are separate. No continuous pointer tracking or cursor rendering has been introduced. Future worlds can add pointer position only when they need it, using local event handling without an idle RAF loop.

## Deliberately deferred

- Shared R3F renderer and project scene resources, pending a real scene prototype.
- Asset and GPU memory budgets, pending actual models and textures.
- Future Contact shutdown wiring; Contact does not exist yet, but Ether now has an explicit disable control.
- Replacement of old visual chapters and stale tests that assert the old five-discipline modal or unmounted project demos.
- Visual art direction, factual copy, and the Hero's full-name composition.

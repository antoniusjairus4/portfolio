# Phase 0 foundation contract

**Status:** Current foundation contract, updated after completion of Phases 1–7.

The [Experience Bible](./EXPERIENCE_BIBLE.md) remains the creative authority. This file records the small runtime boundaries added before any new world is built.

## Scroll

The browser document position is authoritative. `LenisProvider` owns the only Lenis instance and its named GSAP ticker callback. `ScrollTrigger` reads Lenis scroll updates, and continues to work with native scrolling when reduced motion disables Lenis. Consumers receive the live Lenis instance after it exists; they can fall back to native scrolling while it is absent.

The document scroll contract distinguishes navigation types. Fresh entry and intentional reload without a hash begin at the Hero. Back/Forward traversal keeps native `history.scrollRestoration = 'auto'` and is never reset by `pageshow`, including bfcache restoration. Because the pinned Hero and long chapters establish their final document height after hydration, the outgoing history entry records its browser scroll coordinate and reapplies it once after readiness only when a non-bfcache Back/Forward load needs repair. This one-shot repair does not become a scroll owner. Direct hashes are resolved after the preloader releases its lock. Back to Top is a native in-page anchor, does not reload, and does not replay the preloader.

`ScrollLockManager` owns page overflow and wheel, touch, and keyboard scroll blocking. Every caller acquires a release function, including the preloader and the legacy modal/terminal. Locks are reference-counted, idempotently released, and cleared when the provider unmounts. Internal scroll regions can opt in with `data-scroll-lock-allow`. Future modal or transition code must use this manager rather than manipulating body overflow or directly stopping Lenis.

## Readiness

The current preloader counts two real critical resources: the Hero portrait's decoded image and the Cinzel Decorative identity font. It exits once both settle. An eight-second failure timeout releases the page as a degraded state without claiming false progress. Skip and reduced-motion paths release promptly. The preloader visual remains unchanged. Future chapter assets are intentionally absent from this initial gate; compressed assets can later be prefetched ahead of their chapters.

## Activity and renderer boundary

`useChapterActivity` supplies approximate, position-derived `inactive`, `approaching`, `active`, and `leaving` states. It is for prefetch and pause decisions, not high-frequency camera animation. Reversal or a direct jump recomputes from the document position.

The shared R3F renderer now lives above KaiForge, Palindrome, NeuroShield, and Skills. It reads the same position-derived chapter activity and progress, mounts only the selected world, uses demand rendering, and releases before Achievements. Existing raw Three Ether remains a separately controlled legacy renderer. Achievements and Contact are DOM/CSS chapters. The story works without WebGL because essential names, descriptions, facts, and links remain in semantic HTML.

`GlobalEtherProvider` retains the legacy `enabled`, `paused`, and `disabled` control API while old chapter code remains under review. The global Liquid Ether renderer is no longer mounted by the current layout because no accepted Phase 1–7 chapter uses it. This removes a confirmed second canvas beneath KaiForge without deleting the historical implementation. Reduced motion, no-WebGL, Achievements, and Contact contain no Ether canvas.

## Environment

`ExperienceEnvironmentProvider` owns the live reduced-motion and fine-pointer media queries. Its quality tier uses WebGL availability plus coarse/small viewport as conservative signals, with DPR caps of 2 or 1.5. Reduced motion and quality are separate. No continuous pointer tracking or cursor rendering has been introduced. Future worlds can add pointer position only when they need it, using local event handling without an idle RAF loop.

## Deliberately deferred

- Production asset loading, decode/upload scheduling, disposal policy, and GPU memory budgets, pending actual models and textures.
- Final real-device, screen-reader, zoom, QR, and GPU-memory validation.
- Approved removal of safely unmounted legacy implementations.
- Human verification of unresolved public claims in `PUBLICATION_VERIFICATION.md`.

# Pre-production gate contract

**Status:** GREYBOX MASTER LOCK — READY. The actionable technical P1 gate closed on 2026-10-17. Factual verification and the manual/device checks below remain publication and production-art gates rather than foundation blockers.

**Current journey:** Preloader → Hero → KaiForge → Palindrome → NeuroShield → Skills → Achievements → Contact → End / Back to Top.

## Scroll and navigation

- Fresh navigation and reload without a hash begin at the Hero.
- Back/Forward navigation uses native automatic restoration, including bfcache `pageshow`. A saved browser coordinate is reapplied once after readiness only when hydration-time document growth would otherwise clamp a non-bfcache restoration.
- Direct hashes resolve after the preloader releases its scroll lock.
- Back to Top uses `href="#top"`, stays in the document, and does not replay the preloader.
- Native document position remains authoritative; Lenis is the single optional smooth-scroll owner.

## Production lint gate

`pnpm lint:production` runs Biome's linter against the mounted journey and its active runtime dependencies through `biome.production.json`. It intentionally excludes unmounted historical components, capture/diagnostic scripts, generated exports, and archived assets. Repository-wide `pnpm lint` remains a legacy-health report until that historical material is reviewed; it is not the production release gate.

The legacy global Liquid Ether source is retained but is not mounted in the current journey. Production scenes must not reintroduce it as an ambient second renderer.

## Production asset loading

The next architecture phase must implement **prefetch aggressively; activate selectively** and track four separate states:

1. **Downloaded:** compressed asset bytes are cached ahead of likely entry without allocating scene resources.
2. **Decoded / prepared:** model parsing, texture decoding, and worker preparation occur near entry under a bounded concurrency and memory budget.
3. **GPU resident:** only the active world and a strictly bounded transition neighbor may own uploaded geometry, textures, render targets, and materials.
4. **Disposed:** retired scene resources, object URLs, workers, listeners, render targets, and GPU allocations are released and can be reconstructed from current scroll position.

The loader must retain the current DPR quality tiers, avoid loading all worlds at entry, prioritize Hero readiness, expose semantic fallbacks throughout, and record per-scene compressed, decoded, and GPU budgets before production assets are accepted.

## Manual gates that automation does not replace

- Human review of uninterrupted pacing and every transition at desktop and portrait sizes.
- NVDA/VoiceOver or equivalent screen-reader review, keyboard review, and real browser zoom review.
- Real-device QR scanning and touch-device testing.
- GPU-memory profiling on representative desktop and mobile hardware.
- Verification of every unchecked item in `PUBLICATION_VERIFICATION.md`.

## Validation record

- TypeScript and the Next.js 16.3.7 production static-export build pass.
- All 33 unit tests pass.
- All 69 active-journey browser cases have passed after replacing two superseded placeholder selectors; the seven-case master journey suite passes as a single run.
- The active-production Biome lint gate passes with 13 nonblocking warnings in accepted CSS and collapse code. Repository-wide Biome still fails on historical/unmounted material and remains outside this gate.
- Automated traversal covers 1440×900, 1920×1080 sanity, 390×844, rapid/reverse jumps, direct hashes, history restoration, Back to Top, reduced motion, no WebGL, practical 200%/400% reflow, keyboard focus, and Contact cooldown.
- The built journey holds one shared canvas across each project/Skills world and zero canvases at Contact, including after reverse remount.

# Production Phase 0 — asset lifecycle and loading infrastructure

**Verdict:** PRODUCTION ASSET INFRASTRUCTURE — READY.

**Scope:** Infrastructure only. Baseline was clean `main` at `c13e000` (`phase 6 build 3`). The four production planning documents were committed and present. No scene, camera, geometry, typography, chapter timing, claim, dependency or production asset changed.

## Architecture consistency

The current runtime and locked documents agree: native document position is authoritative; Lenis is the only optional smooth-scroll owner; Hero retains GSAP/ScrollTrigger; project chapters and Achievements reconstruct from direct normalized progress; one demand-driven R3F canvas owns KaiForge through Skills; reduced-motion/no-WebGL use semantic static compositions; Skills releases the renderer before Achievements and Contact. No serious contradiction blocked implementation. Historical Phase documents mentioning Hero Ether or earlier one-world renderer behavior remain historical.

## Implemented boundary

`AssetLifecycleManager` is a framework-independent controller. It separates compressed byte availability, CPU preparation, GPU residency and scene activity. It contains bounded queues of two requests and one preparation by default, generation tokens for late-result rejection, abortable fetch, one controlled retry, stable session variant selection, explicit chapter/shared ownership, shared leases and safe reacquisition after disposal.

The runtime manifest is deliberately empty. No production URL exists until a GLB passes the Blender/export gate. Runtime metadata contains only fields needed to load: stable ID, owner, resource type/driver, priority, variants and eligibility, dependencies, prefetch policy, disposal policy and allowed shared consumers.

The driver boundary owns resource-specific preparation, upload and cleanup. A future GLB driver may parse/decompress bytes without a renderer; its `makeResident` call must receive the existing R3F renderer/context through a scene activation. The manager never creates a renderer. When the last lease releases, a resource becomes temporarily retained or is disposed according to policy. If an established next chapter requests disposal before the old scene releases its lease, disposal is remembered and completes on final release. Shared resources cannot be disposed while another lease remains.

## Existing runtime integration

Preloader completion sets one coarse `criticalReady` value. `ProjectExperienceProvider` creates one session manager after environment detection and calls `coordinateProductionAssets` inside its existing scene-selection RAF. The coordinator reads existing section rectangles and controller progress; it adds no wheel handler, scroll listener, observer, timer or RAF.

Implemented thresholds follow the production plan:

- KaiForge bytes: after critical Hero readiness; prepare within two viewports.
- Palindrome bytes: KaiForge progress 0.18 or six-viewports proximity; prepare at KaiForge 0.70 or two-viewports proximity.
- NeuroShield and Skills: corresponding 0.20 request / 0.70 prepare or six/two-viewports proximity.
- Previous owner disposal: incoming chapter progress 0.12.
- Contact-side Skills boundary: dispose all and return before any speculative request.

These thresholds control future byte/preparation state only. Existing `0.45 * innerHeight` scene ownership remains unchanged. Current procedural scenes do not pass through the asynchronous pipeline.

Reduced motion or fallback quality makes coordination ineligible. With no WebGL, no production requests, preparation workers or models begin. Direct Contact also makes no fixture request. Direct/reverse entries reconstruct from current section state. A disposed record retains its selected variant but no application byte/prepared/resident object; re-entry requests it again, normally using the browser's HTTP cache.

## States and observability

Observable states are `not-requested`, `downloading`, `downloaded`, `prepared`, `gpu-resident`, `active`, `inactive-retained`, `disposed`, and `failed`. The separate operation field reports `requesting`, `preparing`, or `uploading`. Snapshots expose owner, selected variant, byte/prepared/resident/active flags, lease and retry counts, and error text.

Development builds expose a read-only `window.__portfolioAssetLifecycle.snapshot()` hook. There is no production HUD or console logging. The hook exists only after manager creation and is removed with the provider.

## Fixture and proof boundary

`public/test-fixtures/asset-lifecycle.txt` is a tiny, plainly labelled text fixture. It is registered only in development when the query contains `assetLifecycleFixture`; the default and production journeys never register or request it. It proves that network prefetch starts only after critical readiness, preparation waits for proximity, later-chapter progress disposes it, reverse navigation reacquires it, reduced motion/no-WebGL request nothing, and direct Contact remains zero-canvas with no fixture request.

Unit tests use an in-memory driver to prove the complete transition through GPU-resident/active states, shared lease protection, cancellation, failure, controlled retry, stable variant selection, retention, disposal and reacquisition. This does not claim actual GLB parsing, KTX2 transcode, Meshopt decode, shader compilation or driver-level GPU memory release.

## Validation record

- TypeScript: passed.
- Production Biome: passed with the same 13 accepted warnings in existing CSS/collapse files; zero new warnings.
- Lifecycle unit proof: 8 passed.
- Focused lifecycle browser proof: 4 passed in installed Chrome.
- Full unit, active journey browser regression, production build and final desktop/mobile visual sanity: recorded after the final validation run for this phase.

## Remaining first-GLB work

The first approved KaiForge fixture must implement the real GLTF driver, loader/decoder configuration, parse cancellation semantics, explicit Three geometry/material/texture/ImageBitmap disposal, renderer upload/compile behavior, measured byte/memory ledger and shader-hitch validation. Meshopt/KTX2 remain candidates pending that measured fixture. These are asset-integration tasks, not reasons to redesign the lifecycle controller.

Blender may begin only after this phase's complete regression/build gate passes and the separately required character reference, rights, Blender version and source-storage decisions are approved. Phase 0 itself creates no Blender work.

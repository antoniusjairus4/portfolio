# Phase 1 Hero contract

The Hero keeps the existing full-screen portrait, central split, Cinzel Decorative identity,
reading hold, atmospheric revealed layer, and deterministic typographic collapse. It does not
contain KaiForge or a transition into KaiForge.

## Composition

`ANTONIUS JAIRUS` uses a fixed two-line composition. A one-line treatment either reduced the
identity to ordinary heading scale or cropped too much of the name on portrait screens. Two lines
keep both words monumental, keep the portrait dominant before the split, and preserve the center
axis and negative space on desktop and portrait layouts.

## Choreography

One scoped GSAP timeline owns the animated path: `portrait` → `opening` → `identity` →
`exit-preparation` → `collapse` → `handoff`. The current state is derived from scroll progress and
published on `#hero[data-hero-state]`; `--hero-progress` publishes normalized progress without a
React render per frame. Reverse scroll and direct jumps therefore reconstruct the same state.

The reading hold runs from normalized progress `0.24` through `0.42`. The pin distance is 4.2
viewports, reduced from 5.5. Reduced motion has no Hero ScrollTrigger or pin: the portrait, full
identity, and roles share one static composition.

## Lifecycle

Matter.js runs only as a deterministic frame bake. Its temporary engine and world are cleared as
soon as frames are recorded; rebakes replace the prior frame set and component cleanup releases the
controller. The Hero Liquid Ether disposes when the chapter is leaving or inactive. While the Hero
owns the viewport, the global Ether renderer is unmounted, so the two fluid contexts do not coexist.
Reduced motion and fallback quality do not create the Hero WebGL renderer.

## Hero → KaiForge handoff

**HANDOFF VIABLE.** The Hero finishes on an ink-dark, cleared composition after the two portrait
halves depart symmetrically and the identity collapse completes. Its stable axis is viewport center
(`--hero-seam-x: 0.5`), declared by `data-hero-handoff="center-seam"`. Phase 2 may align the future
table center or perspective axis to that coordinate, but Phase 1 draws no table geometry and performs
no cross-chapter transition.

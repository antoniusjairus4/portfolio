# Phase 3: Typographic Physics Collapse Transition Specifications

## Overview
Phase 3 replaces the page exit with a deterministic, 2D rigid-body physics collapse. The 35+ individual glyph letters of `JAIRUS` and the three roles (`Student`, `Freelancer`, `Entrepreneur`) come loose in a right-to-left sequence, drop under gravity, bounce off the bottom screen floor and side walls like ping-pong balls with high restitution, and slide off-screen as the floor tilts. Simultaneously, the background image crossfades into the next page (`#page-1-placeholder`).

---

## 1. Key Architecture & Bake Strategy

To guarantee **60 FPS scrubbing**, zero runtime physics drift, and full reverse scroll capability:
- **Bake-Once Architecture**: Matter.js computes a fixed-timestep (1/60s) deterministic simulation for 3.2 seconds (~192 frames) during post-preloader idle time.
- **Transform Application**: During scroll, progress ($0.0 \to 1.0$) maps directly to linear interpolation across baked frames, applying `translate3d(x, y, 0) rotate(r)` strictly to the DOM letter elements.
- **Zero DOM Handoff / Canvas**: Frame 0 is 100% pixel-identical to the static page, preventing flickering or visual jumps.

---

## 2. Beat Timeline & Constants

| Constant | Value | Description |
| :--- | :--- | :--- |
| `COLLAPSE_SCROLL_DISTANCE_VH` | `200` | Scroll distance allocated for Beat D (2.0 viewport heights) |
| `SCROLL_STORY.totalDistanceVh` | `550` | Total scroll story pin length (5.5 viewport heights) |
| `SCROLL_STORY.beats.revealEnd` | `0.22` | Beat A completion (photo split opens & text reveals) |
| `SCROLL_STORY.beats.readEnd` | `0.35` | Beat B completion (rest & read intact name page) |
| `SCROLL_STORY.beats.exitEnd` | `0.60` | Beat C completion (halves slide off-screen; text stays intact) |
| `SCROLL_STORY.beats.holdEnd` | `0.64` | Clean Hold completion (~5% scroll story hold) |
| `SCROLL_STORY.beats.collapseEnd` | `1.00` | Beat D completion (physics collapse & background crossfade) |

---

## 3. Physics Simulation Dynamics (Matter.js)

- **Engine Bundle**: `matter-js` v0.20.0 (measured minified bundle file size: **81.5 KB**).
- **Colliders**: Rounded-rectangle rigid bodies generated per glyph box (shrunk by 10% to eliminate artificial gaps).
- **Ping-Pong Restitution**:
  - Name letters: `restitution: 0.70`, `density: 0.003` (heavy impact).
  - Role letters: `restitution: 0.60`, `density: 0.001` (lighter bounce).
- **Sequenced Release**: Letters detach right-to-left (staggered by 40ms) with seeded impulse forces.
- **Tilt & Slide Away**: At $t \ge 1.9\text{s}$, the left wall opens and the floor tilts clockwise by $18^\circ$, sliding the letters off the left edge.

---

## 4. Fallbacks & Accessibility

- **Reduced Motion**: If `prefers-reduced-motion` is active, physics engine loading and baking are bypassed; Beat D uses a simple CSS opacity crossfade.
- **Accessibility Tree**: The semantic `<h1>` and `<ul>` text remains intact in DOM accessibility tree; per-letter spans are `aria-hidden="true"`.
- **Debug Mode**: Dev-only overlay enabled via `?physDebug=1` displaying frame index, body count, bake timing, and deterministic FNV-1a hash.

---

## 5. Test Results

- **Vitest Unit Suite**: 10/10 Passed (verifying PRNG determinism, byte-identical hashes, zero NaN transforms).
- **Playwright E2E Suite**: 4/4 Passed (verifying 5-beat story, keyboard path, and preloader regression).
- **Performance**: 60.0 FPS average during continuous scrub; 0.00 CLS layout shift.

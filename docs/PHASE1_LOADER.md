# Phase 1: Preloader, Photo Cover & Split Reveal Specifications

> **Status**: Phase 1 Complete (Loader Page, Cover & Split Reveal Implemented & Debugged)

---

## 1. Sequence Timeline & Animation Choreography

```
Time (s)     Visual & State Transition
0.0s ───────► Preloader container mounts over full viewport (#0C0907).
              Large Ember ball (clamp(96px, 12vw, 220px)) with gold glow begins 4-bounce settling loop on gold table line.
              Counter climbs monotonically from 00 to 100 in Bricolage Grotesque (clamp: 6rem-36vw).
3.0s ───────► Minimum duration threshold reached. If asset loading complete, counter reaches 100.
4.8s ───────► Hard maximum duration cap. Counter reaches 100 regardless of network speed.
              Ball makes final bounce & serves vertically off-screen top (-140vh).
4.8s–5.5s ──► Preloader panel wipes upward (translateY(-100%)) following the ball.
              Full-screen photo cover revealed.
              Lenis smooth scroll unlocked (lenis.start()).
5.5s+ ──────► Visitor scrolls down. GSAP ScrollTrigger pins cover and scrubs dual-image split reveal:
              Left half moves -100% X (translate3d), Right half moves +100% X (translate3d).
              Page 1 text-free placeholder scales from 0.94 -> 1.0 beneath the opening halves.
```

---

## 2. Root Cause Investigation & Resolution of Split Reveal

### Confirmed Root Causes:
1. **Document Height Collapse (`scrollHeight == innerHeight`)**:
   - *Evidence*: `document.scrollingElement.scrollHeight` equalled `720px` (exactly 1 viewport height).
   - *Cause*: `globals.css` set `html, body { height: 100%; }` and `PhotoCoverSplit` set `h-[100svh] overflow-hidden`. When GSAP inserted `.pin-spacer` (height: 1440px), the outer document height failed to expand due to fixed height declarations. The browser was unable to scroll at all, leaving `window.scrollY` pinned at `0px`.
   - *Fix*: Removed `height: 100%` from `html` and `body` in `src/styles/globals.css`, replacing it with `min-height: 100%`.

2. **Unrefreshed ScrollTrigger Bounds on Preloader Dismissal**:
   - *Evidence*: `ScrollTrigger` created initial triggers while `Preloader` was fixed over the viewport and Lenis was stopped.
   - *Fix*: Added `ScrollTrigger.refresh()` callback on image `onLoad` and upon preloader dismissal in `LenisProvider.tsx`.

---

## 3. Large Ember Ball & Settling Bounce Specifications

- **Ball Diameter**: `clamp(96px, 12vw, 220px)`.
- **Color & Glow**: `--color-ember` (`#E8481F`) with soft gold outer glow (`shadow-[0_0_50px_rgba(224,169,59,0.45)]`).
- **Layering**: Layered at `z-30`, in front of the giant counter (`z-10`), guaranteeing high visibility.
- **Settling Bounces**: 4 distinct bounces with squash & stretch transform physics (`scale(1.25, 0.75)` on impact, `scale(0.9, 1.15)` at peak):
  - Bounce 1: ~55–65% viewport height
  - Bounce 2: ~38% viewport height
  - Bounce 3: ~20% viewport height
  - Bounce 4: ~8% viewport height
  - Final Serve: Serves upward to `-140vh`.

---

## 4. Focal-Point Mathematics & Aspect Ratio Seam Alignment

- **Source Image**: `images_offl/Image_0.png` (1536 x 1024 px, 3:2 Aspect Ratio).
- **Focal Point**: $X_{\text{focal}} = 0.485$ (48.5% from left edge of original photo).
- **Split Seam**: $X_{\text{seam}} = 0.500$ (50.0% center of viewport).
- **Landscape Viewports ($\ge 1.5$)**: `object-position: 51.5% 50%`.
- **9:16 Portrait Phones**: `object-position: 47.6% 50%`.

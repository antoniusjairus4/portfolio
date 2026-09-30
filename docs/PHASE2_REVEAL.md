# Phase 2: Pinned Scroll Story Reveal & Preloader Expansion

> **Status**: Phase 2 Complete (Centre Content, 3-Beat Pinned Story, Instrument Serif Italic, Page 1 Placeholder & 6.0s–8.0s Preloader Implemented)

---

## 1. 3-Beat Pinned Scroll Story Timeline

Total pinned scroll distance: **350vh** (`SCROLL_STORY.totalDistanceVh = 350`). Driven by GSAP `ScrollTrigger` scrubbing through Lenis.

```
Scroll %      Beat           Visual & Motion Animation
0% ──────────► Beat A Start  Photo cover 100% full viewport, seamless. Text hidden behind halves.
0% ──► 35% ──► Beat A        Photo halves slide outward to -50% / +50%.
                             Name letters ("JAIRUS") stagger-rise (yPercent: 120 -> 0) & fade in.
                             3 Role lines ("Student", "Freelancer", "Founder") stagger-rise (yPercent: 60 -> 0) & fade in.
35% ──► 55% ─► Beat B        READ MOMENT. Photo halves rest at 50% partial opening.
                             Text is fully visible, stable, and readable.
55% ──► 100% ─► Beat C       Photo halves slide completely off-screen (-100% / +100%).
                             Text block scales up (1x -> 3.5x), letter-spacing expands (0.08em).
                             As scale passes ~3x (75% -> 100%), text fades out (opacity: 1 -> 0).
100%+ ───────► Pin Release   Pin releases onto Page 1 text-free placeholder (#0C0907 + soft gold radial glow).
```

---

## 2. Centre Content Typography Specifications

- **Content File**: Defined in `src/content/heroContent.ts` (independent of component logic).
- **Name**: `JAIRUS`
  - Font: `Bricolage Grotesque Variable`, weight 800.
  - Size: `clamp(4.5rem, 18vw, 24rem)`, leading `0.8`, tracking `-0.04em`, color `--color-ivory` (`#F2E9D8`).
  - Accessibility: Accessible `<h1>` with screen-reader text (`sr-only`), letter spans marked `aria-hidden="true"`.
- **Three Roles**: `Student`, `Freelancer`, `Founder`
  - Font: `Instrument Serif`, 400 Italic (`@fontsource/instrument-serif`).
  - Size: `clamp(1.8rem, 5vw, 6rem)`, line height `1.15`, color `--color-gold` (`#E0A93B`).
  - Accessibility: Semantic `<ul>` / `<li>` list.

---

## 3. Preloader 6.0s–8.0s Timing & 8-Bounce Settling Physics

- **Min Duration**: `6000ms` (6.0 seconds).
- **Max Duration**: `8000ms` (8.0 seconds).
- **Target Duration**: `6500ms` (6.5 seconds).
- **Counter Curve**: Smooth decelerating power curve (`1 - Math.pow(1 - t, 2.2)`), quick early, slowing near 90, finishing at 100.
- **Settling Ball Physics**: 8 distinct bounces with squash & stretch transform scaling (`scale(1.25, 0.75)` on bounce impact, `scale(0.9, 1.15)` at peak) and dynamic contact shadow scaling.

# Achievements Data-Driven Template Architecture

## Overview
The Achievements detail view ([`AchievementDetailModal.tsx`](file:///home/jairus/Antonius%20Jairus/Projects/Portfolio/src/components/achievements/AchievementDetailModal.tsx)) is constructed as a single data-driven template serving all five disciplines (*Speaking*, *Table Tennis*, *Karate*, *Chess*, *Music*).

## Architecture Highlights

1. **Automated Manifest Build Pipeline (`scripts/build-achievements.mjs`)**:
   - Integrated into `predev`, `prebuild`, and `achievements:build`.
   - Reads `assets-src/achievements/<slug>/` and outputs optimized variants (`1280`, `1920`, `2560` in AVIF/WebP/JPEG) and 32px ambient backdrops.
   - Automatically calculates photo aspect ratios (`isWide` if `aspect >= 1.3`).
   - Outputs typed manifest at `src/content/achievements.manifest.json`.

2. **Schema & Data Model (`src/content/achievements.ts`)**:
   - Validated at build time via Zod (`AchievementEntrySchema`).
   - Defines position, order, stats (0-3 items with value count-up parsing), optional line, and per-photo focal point/zoom overrides.

3. **Cinematic View Rendering**:
   - **Wide Photos**: Full-bleed background with slow 14s Ken Burns transform drift.
   - **Contained Photos**: Max height 80vh surrounded by pre-baked ambient 32px blurred fill.
   - **Giant Stat Numbers**: Clash Display numbers with GSAP count-up effect; plain accessible sentences rendered for screen readers.
   - **Photo Controls**: Edge arrow buttons, bottom progress dashes, keyboard arrow listeners (`ArrowLeft`/`ArrowRight`), and touch swipe handling.

4. **Resource & Scroll Management**:
   - Stops Lenis smooth scroll provider on mount and restores on close.
   - Pauses `LiquidEther` WebGL context ticks via `paused` prop to conserve GPU power.

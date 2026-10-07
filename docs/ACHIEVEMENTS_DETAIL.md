# Achievements Detail View Architectural Specification

## Overview
The Achievements Detail View component ([`AchievementDetailModal.tsx`](file:///home/jairus/Antonius%20Jairus/Projects/Portfolio/src/components/achievements/AchievementDetailModal.tsx)) provides an editorial modal dialog for each of the 5 spatial discipline nodes (*Speaking*, *Karate*, *Table Tennis*, *Chess*, *Music*).

## Key Architectural Principles

### 1. Backdrop Layering & GPU Optimization
- **Pre-blurred 32px Backdrops**: Generated at build time via `sharp` to eliminate heavy runtime CSS filter costs.
- **Radial Glow & Film Grain**: Soft gold radial gradient (`#E0A93B` at 12% opacity) combined with an inline SVG noise turbulence filter.
- **WebGL Pausing**: Controls the `paused` prop on `LiquidEther.tsx` to halt animation loops while the modal is open, conserving battery and GPU.

### 2. FLIP Shared-Element Animation
- Calculates bounding rectangles between originating node and modal title heading to execute a smooth GSAP scale/position flight.
- Respects `prefers-reduced-motion: reduce` by replacing spatial flights with immediate crossfades.

### 3. Accessible Dialog Architecture
- **Semantics**: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`.
- **Keyboard Control & Focus Trap**: Traps focus inside the active modal; pressing `Escape` triggers closing and returns focus to the origin node.
- **Explicit Dismissal**: Close button top right, backdrop tap, and swipe-down on touch.

### 4. Photo Stack & Fallback Layout
- Responsive WebP and AVIF image variants (`400w`, `640w`, `1024w`).
- Interactive card cycling with keyboard arrows (`ArrowRight`/`ArrowLeft`) and touch swipe gestures.
- Intentional text-only fallback card featuring a gold star emblem (`✦`) for disciplines without image archives.

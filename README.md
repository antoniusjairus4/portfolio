# Jairus Portfolio

## About the project
Personal portfolio of Jairus: cybersecurity student, two-time Tamil Nadu state table tennis champion, and young founder. Built to a competition standard, aiming for Awwards Site of the Day and the Developer award.

## Status
Status: Phase 3.5: Achievements spatial detail view implemented (cinematic FLIP modal, pre-blurred backdrops, photo stack tilt/cycling, accessible dialog controls, WebGL pause).

---

## Goals and Quality Bar
- **Awwards Targets**: Design, Usability, Creativity, Content, Developer
- **Performance Budgets**: Lighthouse 95+ Mobile, LCP < 2.5 s, Initial JS < 200 KB gzipped (WebGL canvas lazy-loaded & excluded), 60 fps frame rate during split reveal
- **Accessibility**: WCAG AA compliance, full keyboard navigation, reduced-motion support (`prefers-reduced-motion: reduce`), no-WebGL fallback
- **Security**: A+ rating on securityheaders.com, strict CSP, Firebase App Check protection

---

## Design Tokens (Tailwind CSS v4 `@theme`)

### Palette & Text Tokens
- `--color-base`: `#0C0907` (warm black)
- `--color-surface`: `#17110C`
- `--color-ivory`: `#F2E9D8` (primary text)
- `--color-muted`: `#A89880`
- `--color-gold`: `#E0A93B` (primary accent)
- `--color-ember`: `#E8481F` (hot accent / ball)
- `--color-hero-name`: `#FFF4E0` (warm white hero name)
- `--color-hero-role`: `rgba(255, 244, 224, 0.65)` (softer warm white hero roles)

### Typography
- **Display**: Clash Display (variable WOFF2 self-hosted in `public/fonts/ClashDisplay-Variable.woff2`)
- **Secondary**: Satoshi (variable WOFF2 self-hosted in `public/fonts/Satoshi-Variable.woff2`)
- **Utility**: JetBrains Mono (variable, self-hosted via Fontsource)
- **Enormous Numeral Class**: `.font-display-enormous` (`clamp(6rem, 25vw, 36vw)`, weight 700, tabular-nums)
- **Hero Name**: `.font-hero-name` (`clamp(3.8rem, 16.5vw, 22rem)`, weight 700)
- **Hero Roles**: `.font-hero-role` (`clamp(1.4rem, 4.2vw, 4.8rem)`, weight 500, upright sentence case)

### Revealed Background Image
- **Original Source**: `assets-src/After_split.png` (1672x941 px, 1.45 MB PNG)
- **Optimized Assets**: `public/images/hero/after_split-1672.avif` (73.5 KB), `after_split-1672.webp` (52.6 KB), `after_split-1672.jpg` (116.1 KB) + blur placeholder.

### Motion Tokens & Beats (Unchanged)
> [!NOTE]
> All animation timing, durations, easing, scroll distances, and beat boundaries remain strictly unchanged.
- `SCROLL_STORY.totalDistanceVh`: `350` (3.5 viewport heights of scroll)
- `SCROLL_STORY.beats`: `revealEnd: 0.35`, `readEnd: 0.55`, `exitEnd: 1.00`
- `PRELOADER_TIMINGS`: `minDurationMs: 6000`, `maxDurationMs: 8000`, `targetMs: 6500`

---

## Installed Packages Manifest

| Package | Version | Type | Note |
| :--- | :--- | :--- | :--- |
| `next` | `16.3.7` | Dependency | App Router Framework |
| `react` / `react-dom` | `19.3.0` | Dependency | React 19 Core |
| `three` | `0.186.1` | Dependency | WebGL Engine |
| `@react-three/fiber` | `9.8.1` | Dependency | R3F React Canvas |
| `gsap` / `@gsap/react` | `3.15.0` / `2.1.2` | Dependency | GSAP Animation |
| `lenis` | `1.3.26` | Dependency | Smooth Scroll |
| `@fontsource-variable/jetbrains-mono` | `5.3.0` | DevDependency | Utility Font |
| `sharp` | `0.35.5` | DevDependency | Image Processing Engine |
| `typescript` | `7.0.2` | DevDependency | Type System |
| `@biomejs/biome` | `2.5.14` | DevDependency | Linter / Formatter |
| `vitest` | `5.0.2` | DevDependency | Unit Testing |
| `@playwright/test` | `1.63.0` | DevDependency | E2E Testing |


---

## Directory Structure

```
Portfolio/
├── docs/
│   ├── PHASE1_LOADER.md          # Timeline sequence & focal point math docs
│   ├── PHASE2_REVEAL.md          # Pinned scroll story beats & centre content docs
│   └── SECTION_BLUEPRINT.md      # Detailed section technical specifications
├── functions/
│   ├── src/                      # Firebase Cloud Functions TypeScript source
│   └── package.json              # Functions package manifest
├── public/
│   ├── images/                   # Optimized cover image variants, manifest & screenshots
│   └── models/                   # Optimized 3D model assets (.glb)
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout with fonts, metadata & LenisProvider
│   │   └── page.tsx              # Page 0 home with Preloader, PhotoCoverSplit & Page 1 Placeholder
│   ├── components/
│   │   ├── layout/
│   │   │   └── PhotoCoverSplit.tsx # Dual-image split reveal with 3-beat GSAP ScrollTrigger timeline
│   │   └── preloader/
│   │       ├── Preloader.tsx     # 6.5s 8-bounce Ember ball, decelerating counter & panel serve wipe
│   │       └── usePreloaderProgress.ts # Smooth decelerating counter hook (6.0s - 8.0s)
│   ├── content/
│   │   └── heroContent.ts        # Hero text content (Name & 3 Roles)
│   ├── motion/
│   │   ├── lenis/
│   │   │   └── LenisProvider.tsx # Lenis smooth scroll provider connected to GSAP ScrollTrigger
│   │   └── tokens.ts             # Motion ease, scroll beats & preloader timing constants
│   ├── styles/
│   │   └── globals.css           # Tailwind CSS v4 setup, @theme design tokens & typography
│   └── types/                    # Global TypeScript interfaces
├── tests/
│   ├── e2e/
│   │   └── loader.spec.ts        # Playwright E2E 5-beat story & keyboard tests
│   └── unit/
│       └── preloader.test.ts     # Vitest progress timing & beat boundary tests
├── biome.json                    # Biome linting and formatting configuration
├── next.config.ts                # Next.js static export build configuration
├── package.json                  # Root dependency manifest and scripts
├── playwright.config.ts          # Playwright test suite configuration
├── postcss.config.mjs            # PostCSS configuration for Tailwind CSS v4
├── README.md                     # Product brief and architecture documentation
├── tsconfig.json                 # Strict TypeScript compiler configuration
└── vitest.config.ts              # Vitest test suite configuration
```

---

## Roadmap

- **Phase 0**: Setup & Infrastructure (Completed)
- **Phase 0.5**: Product Brief & Architectural Specifications (Completed)
- **Phase 1**: Loader Page, Photo Cover & Split Reveal (Completed)
- **Phase 2**: Centre Content & 3-Beat Pinned Scroll Story Reveal (Completed)
- **Phase 3**: Typographic Physics Collapse Transition (Completed)
- **Phase 4**: Ventures / Work Page (Planned)
- **Phase 5**: Contact & Firebase Backend (Planned)
- **Phase 6**: Performance, Accessibility & Security Hardening (Planned)
- **Phase 7**: Launch & Awwards Submission (Planned)

# Jairus Portfolio

## About the project
Personal portfolio of Jairus: cybersecurity student, two-time Tamil Nadu state table tennis champion, and young founder. Built to a competition standard, aiming for Awwards Site of the Day and the Developer award.

## Status
Status: Phase 1: loader page (preloader, photo cover, split reveal implemented).

---

## Goals and Quality Bar
- **Awwards Targets**: Design, Usability, Creativity, Content, Developer
- **Performance Budgets**: Lighthouse 95+ Mobile, LCP < 2.5 s, Initial JS < 200 KB gzipped (WebGL canvas lazy-loaded & excluded), 60 fps frame rate during split reveal
- **Accessibility**: WCAG AA compliance, full keyboard navigation, reduced-motion support (`prefers-reduced-motion: reduce`), no-WebGL fallback
- **Security**: A+ rating on securityheaders.com, strict CSP, Firebase App Check protection

---

## Design Tokens (Tailwind CSS v4 `@theme`)

### Palette
- `--color-base`: `#0C0907` (warm black)
- `--color-surface`: `#17110C`
- `--color-ivory`: `#F2E9D8` (primary text)
- `--color-muted`: `#A89880`
- `--color-gold`: `#E0A93B` (primary accent)
- `--color-ember`: `#E8481F` (hot accent / ball)

### Typography
- **Display**: Bricolage Grotesque (variable, self-hosted via Fontsource)
- **Utility**: JetBrains Mono (variable, self-hosted via Fontsource)
- **Enormous Numeral Class**: `.font-display-enormous` (`clamp(6rem, 25vw, 36vw)`)

### Motion Tokens
- `--ease-out`: `cubic-bezier(0.16, 1, 0.3, 1)`
- `--ease-in-out`: `cubic-bezier(0.76, 0, 0.24, 1)`
- **Durations**: Fast (`0.3s`), Base (`0.6s`), Slow (`1.2s`)
- Exposed as TypeScript constants in `src/motion/tokens.ts`

---

## How Phase 1 Works

1. **Preloader**:
   - Renders inline before JS execution with warm-black background (`#0C0907`) and gold table line (`#E0A93B`).
   - Ember ball (`#E8481F`) bounces with 60fps CSS animation.
   - Monotonic counter climbs from `00` to `100` in Bricolage Grotesque display font. Minimum duration 2.4s, maximum hard cap 3.8s.
   - At 100, the ball serves vertically off-screen, and the preloader panel wipes upward (`translateY(-100%)`).
   - Includes keyboard-accessible skip button and `sessionStorage` caching.

2. **Photo Cover & Dual-Image Split Reveal**:
   - Full viewport photo cover (`100svh / 100vw`).
   - Dual-half clip path architecture (`inset(0 50% 0 0)` and `inset(0 0 0 50%)`) guarantees pixel-perfect seam with zero hairline gap.
   - GSAP `ScrollTrigger` pins the cover and scrubs split reveal on scroll driven by Lenis (`xPercent: -100` left, `xPercent: 100` right).
   - Focal point math aligns 48.5% kiss point to 50% seam across landscape (`51.5% 50%`) and portrait (`47.6% 50%`) aspect ratios.

3. **Page 1 Text-Free Placeholder**:
   - Beneath the split halves sits Page 1 placeholder: `#0C0907` background with soft gold radial glow (`rgba(224, 169, 59, 0.12)`), scaling from `0.94` to `1.0` as split opens. No words.

---

## Installed Packages Manifest

| Package | Version | Type | Note |
| :--- | :--- | :--- | :--- |
| `next` | `16.3.7` | Dependency | App Router Framework |
| `react` / `react-dom` | `19.3.0` | Dependency | React 19 Core |
| `three` | `0.186.1` | Dependency | WebGL Engine |
| `@react-three/fiber` | `9.8.1` | Dependency | R3F React Canvas |
| `@react-three/drei` | `10.7.9` | Dependency | R3F Helpers |
| `gsap` / `@gsap/react` | `3.15.0` / `2.1.2` | Dependency | GSAP Animation |
| `lenis` | `1.3.26` | Dependency | Smooth Scroll |
| `motion` | `13.4.6` | Dependency | Motion Animation |
| `@fontsource-variable/bricolage-grotesque` | `5.3.0` | DevDependency | Display Font |
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
├── .github/
│   └── workflows/                # GitHub Actions CI/CD deployment workflows
├── assets-src/
│   └── Image_0.png               # Uncompressed raw source photo backup (1536x1024)
├── docs/
│   ├── PHASE1_LOADER.md          # Timeline sequence & focal point math docs
│   └── SECTION_BLUEPRINT.md      # Detailed section technical specifications
├── functions/
│   ├── src/                      # Firebase Cloud Functions TypeScript source
│   └── package.json              # Functions package manifest
├── public/
│   ├── fonts/                    # Self-hosted web fonts (WOFF2)
│   ├── images/                   # Optimized AVIF, WebP, JPEG cover image variants & manifest
│   ├── models/                   # Optimized 3D model assets (.glb)
│   ├── og/                       # OpenGraph preview images
│   └── textures/                 # WebGL texture maps
├── scripts/
│   └── generate-assets.js        # Sharp image processing & LQIP generator
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout with fonts, metadata, LenisProvider & LCP preload
│   │   └── page.tsx              # Page 0 home with Preloader, PhotoCoverSplit & Placeholder
│   ├── components/
│   │   ├── layout/
│   │   │   └── PhotoCoverSplit.tsx # Dual-image split reveal with GSAP ScrollTrigger
│   │   └── preloader/
│   │       ├── Preloader.tsx     # 60fps Ember ball bounce, counter & panel serve wipe
│   │       └── usePreloaderProgress.ts # Smooth monotonic counter hook (min 2.4s, max 3.8s)
│   ├── motion/
│   │   ├── lenis/
│   │   │   └── LenisProvider.tsx # Lenis smooth scroll provider connected to GSAP ScrollTrigger
│   │   └── tokens.ts             # Motion ease & duration constants
│   ├── styles/
│   │   └── globals.css           # Tailwind CSS v4 setup & @theme design tokens
│   └── types/                    # Global TypeScript interfaces
├── tests/
│   ├── e2e/
│   │   └── loader.spec.ts        # Playwright E2E smoke tests
│   └── unit/
│       └── preloader.test.ts     # Vitest progress timing & monotonicity unit tests
├── biome.json                    # Biome linting and formatting configuration
├── next.config.ts                # Next.js static export build configuration
├── package.json                  # Root dependency manifest and scripts
├── playwright.config.ts          # Playwright test suite configuration
├── postcss.config.mjs            # PostCSS configuration for Tailwind CSS v4
├── README.md                     # Product brief and architecture documentation
└── tsconfig.json                 # Strict TypeScript compiler configuration
```

---

## Roadmap

- **Phase 0**: Setup & Infrastructure (Completed)
- **Phase 0.5**: Product Brief & Architectural Specifications (Completed)
- **Phase 1**: Loader Page, Photo Cover & Split Reveal (Completed)
- **Phase 2**: Layout & Smooth Scroll (Planned)
- **Phase 3**: Hero & 3D Ball Experience (Planned)
- **Phase 4**: Work & Content Sections (Planned)
- **Phase 5**: Contact & Firebase Backend (Planned)
- **Phase 6**: Performance, Accessibility & Security Hardening (Planned)
- **Phase 7**: Launch & Awwards Submission (Planned)

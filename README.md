# Jairus Portfolio

## About the project
Personal portfolio of Jairus: cybersecurity student, two-time Tamil Nadu state table tennis champion, and young founder. Built to a competition standard, aiming for Awwards Site of the Day and the Developer award.

## Status
Status: Phase 0.5: product brief, no application code written.

> **Note on Design Tokens**: Visual theme, colour palette, and typography are to be decided in the next phase. No placeholder values or default themes are specified here.

---

## Goals and Quality Bar
- **Awwards Targets**: Design, Usability, Creativity, Content, Developer
- **Performance Budgets**: Lighthouse 95+ Mobile, LCP < 2.5 s, Initial JS < 200 KB gzipped (WebGL canvas lazy-loaded & excluded), 60 fps frame rate
- **Accessibility**: WCAG AA compliance, full keyboard navigation, reduced-motion support, no-WebGL fallback
- **Security**: A+ rating on securityheaders.com, strict CSP, Firebase App Check protection

---

## Tech Stack

| Layer | Tools | Purpose & Justification |
| :--- | :--- | :--- |
| **Framework** | Next.js (App Router) + TypeScript | Static export for Firebase Hosting, strict type safety, SSG performance |
| **Package Manager** | pnpm | Fast, deterministic, strict dependency tree management |
| **Motion** | GSAP (ScrollTrigger, SplitText, Flip), Lenis, Motion | Smooth inertia scroll, complex timeline choreography, micro-interactions |
| **3D & Physics** | Three.js, React Three Fiber, drei, postprocessing, Rapier | Performant WebGL canvas, declarative 3D scenes, physics-driven interactive table tennis ball |
| **Styling & UI** | Tailwind CSS v4, Radix Primitives, cmdk, CVA, clsx, tailwind-merge | Unstyled accessible primitives, zero-runtime utility styling, command palette |
| **State & Validation** | Zustand, Zod | Lightweight atomic state management, runtime schema validation |
| **Content** | Sanity (`next-sanity`) | Headless CMS for editorial content management (build-time fetching via rebuild webhook) |
| **Backend & Cloud** | Firebase Hosting, Cloud Functions, Firestore, App Check, Resend | Serverless backend, bot protection, email delivery, hosting with custom domain |
| **Quality & Tooling** | Biome, Vitest, Testing Library, Playwright, Husky, lint-staged, Lighthouse CI | Ultra-fast linting/formatting, unit & E2E testing suite, automated CI quality gates |
| **3D Pipeline** | gltfjsx, gltf-transform (Draco, Meshopt, KTX2) | 3D model compression, optimization, and JSX component codegen |
| **CI/CD** | GitHub Actions | Automated deployment pipeline to Firebase Hosting |

---

## Installed Packages & Version Manifest

| Package | Version | Type | Note |
| :--- | :--- | :--- | :--- |
| `next` | `16.3.7` | Dependency | App Router Framework |
| `react` / `react-dom` | `19.3.0` | Dependency | React 19 Core |
| `three` | `0.186.1` | Dependency | WebGL Engine |
| `@react-three/fiber` | `9.8.1` | Dependency | R3F React Canvas |
| `@react-three/drei` | `10.7.9` | Dependency | R3F Helpers |
| `@react-three/postprocessing` | `3.1.3` | Dependency | Shader Effects |
| `@react-three/rapier` | `2.2.0` | Dependency | 3D Physics Engine |
| `postprocessing` | `6.39.5` | Dependency | Postprocessing Library |
| `gsap` / `@gsap/react` | `3.15.0` / `2.1.2` | Dependency | GSAP Animation |
| `lenis` | `1.3.26` | Dependency | Smooth Scroll |
| `motion` | `13.4.6` | Dependency | Motion Animation |
| `zustand` | `5.0.15` | Dependency | State Management |
| `zod` | `4.6.5` | Dependency | Schema Validation |
| `clsx` / `tailwind-merge` / `cva` | `2.1.1` / `3.7.0` / `0.7.1` | Dependency | Styling Utilities |
| `radix-ui` / `cmdk` | `1.6.7` / `1.1.1` | Dependency | Primitives & Command Palette |
| `next-sanity` / `@sanity/client` | `13.3.4` / `8.9.0` | Dependency | Sanity Client |
| `firebase` | `12.19.0` | Dependency | Firebase Client |
| `typescript` | `7.0.2` | DevDependency | Type System |
| `@biomejs/biome` | `2.5.14` | DevDependency | Linter / Formatter |
| `vitest` | `5.0.2` | DevDependency | Unit Testing |
| `@playwright/test` | `1.63.0` | DevDependency | E2E Testing |
| `@tailwindcss/postcss` / `tailwindcss` | `4.3.3` | DevDependency | Styling Engine |

---

## Sections and Criticality Table

| Section | Tier | Purpose | Signature Interaction |
| :--- | :--- | :--- | :--- |
| **1. Preloader** | Tier 1 (Signature) | First impression & seamless serve transition | Bouncing ball loader with live counter; serve transition into Hero |
| **2. Hero** | Tier 1 (Signature) | State identity in 5s; showcase signature 3D ball | 3D wireframe ball reacting to cursor paddle via Rapier physics |
| **3. Ventures** | Tier 1 (Signature) | Prove product execution (Palindrome, KaiForge, NeuroScan AI) | Case study cards with GLSL liquid distortion hover previews |
| **4. Security Lab** | Tier 1 (Signature) | Interactive cybersecurity proof of work | Working terminal CLI (`whoami`, `sudo hire jairus`) & static CTF route |
| **5. Arena** | Tier 1 (Signature) | Athletic discipline & sports achievements | Physics-driven medal wall & interactive 3D table tennis gear paddle |
| **6. Chess** | Tier 2 (Core) | Strategic calculation & competitive mindset | Live Chess.com ratings card & playable 1.b3 opening board |
| **7. Open Source** | Tier 3 (Supporting) | Community collaboration & contribution history | Live GSSoC 2026 PR feed & hackathon achievements |
| **8. Off the Clock** | Tier 3 (Supporting) | Leadership, public speaking, music & IEEE | Horizontal card deck & playable 8-key mini musical keyboard |
| **9. Timeline** | Tier 3 (Supporting) | Unify personal narrative arc | Scroll-scrubbed interactive milestone path |
| **10. Work With Me** | Tier 2 (Core) | Convert visitors into client leads | Engineering process, live availability badge & client testimonial |
| **11. Contact** | Tier 2 (Core) | Match point contact capture | Form with Zod validation, Cloud Function, App Check, Resend & local time |

---

## Proposal: Runtime Data Flow Architecture

Since Next.js generates a static HTML export deployed to Firebase Hosting, dynamic runtime data (Chess.com ratings, GitHub PRs, availability status, Coimbatore local clock) cannot rely on traditional Node.js SSR.

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Static Export                │
│                 (Deployed to Firebase Hosting)           │
└───────────┬─────────────────────────────────┬───────────┘
            │                                 │
   Build-Time Static Fetch             Client-Side SWR Fetch
            │                                 │
┌───────────▼───────────┐         ┌───────────▼───────────┐
│  Sanity Webhook Hook  │         │ Firebase Cloud Func   │
│  Triggers Rebuild on  │         │ Proxy Layer (Cached)  │
│    Content Update     │         └───────────┬───────────┘
└───────────────────────┘                     │
                                   ┌──────────▼───────────┐
                                   │ External APIs:       │
                                   │ • Chess.com API      │
                                   │ • GitHub REST API    │
                                   └──────────────────────┘
```

1. **Sanity CMS Content**: Fetched at build time. Updates trigger a Firebase deployment via GitHub Actions webhook.
2. **Live Stats Proxy**: Client-side components use SWR to query a cached Firebase Cloud Function proxy endpoint. This avoids CORS issues, enforces strict Content Security Policy (`connect-src`), and protects API rate limits.
3. **Contact Submissions**: Form posts directly to a Firebase Cloud Function protected by Firebase App Check, storing leads in Firestore and sending notification emails via Resend.

---

## Open Architectural Decisions

1. **Sanity CMS vs. MDX Content**:
   - *Option A*: Sanity CMS for headless editorial publishing via webhooks.
   - *Option B*: Local MDX content files compiled at build time for complete repository ownership.
2. **GLSL Shader Loader with Next.js Turbopack**:
   - *Option A*: Custom Turbopack string loaders configured in `next.config.ts`.
   - *Option B*: Inline GLSL shader string exports wrapped in TypeScript modules.
3. **Canvas Architecture**:
   - *Option A*: Single shared overlay `<Canvas>` with viewport intersection-driven scene mounting.
   - *Option B*: Isolated per-section WebGL canvases with strict WebGL context cleanup.
4. **React 19 & `@react-three/*` Peer Compatibility**:
   - Explicit `pnpm.overrides` configuration to align React 19 types across `@react-three/fiber`, `@react-three/drei`, and `@react-three/rapier`.

---

## Directory Structure

```
Portfolio/
├── .github/
│   └── workflows/                # GitHub Actions CI/CD deployment workflows
├── docs/
│   └── SECTION_BLUEPRINT.md      # Detailed section technical specifications
├── functions/
│   ├── src/                      # Firebase Cloud Functions TypeScript source
│   └── package.json              # Functions package manifest
├── public/
│   ├── fonts/                    # Self-hosted web fonts (WOFF2)
│   ├── hdri/                     # HDRI environment maps for 3D lighting
│   ├── models/                   # Optimized 3D model assets (.glb)
│   ├── og/                       # OpenGraph preview images
│   └── textures/                 # WebGL texture maps
├── src/
│   ├── app/                      # Next.js App Router route handlers and static pages
│   ├── components/
│   │   ├── cursor/               # Custom reactive cursor implementation
│   │   ├── layout/               # Layout structures (Header, Footer, Navigation)
│   │   ├── preloader/            # Initial loading screen and asset preloader
│   │   ├── sections/             # Core editorial portfolio page sections
│   │   └── ui/                   # Atomic, accessible Radix-based UI primitives
│   ├── content/                  # Content schemas and queries (Sanity / MDX)
│   ├── hooks/                    # Custom React hooks (accessibility, media queries)
│   ├── lib/                      # Shared utility functions and client instances
│   ├── motion/
│   │   ├── gsap/                 # GSAP timeline and ScrollTrigger registration
│   │   ├── lenis/                # Lenis smooth scroll provider and controls
│   │   └── transitions/          # Page transition animations
│   ├── styles/                   # Global Tailwind CSS v4 stylesheets
│   ├── types/                    # Global TypeScript interfaces and type definitions
│   └── webgl/
│       ├── hooks/                # WebGL canvas and shader animation hooks
│       ├── materials/            # Custom WebGL shader materials
│       ├── physics/              # Rapier 3D physics colliders and forces
│       ├── scenes/               # React Three Fiber 3D scene compositions
│       └── shaders/              # Custom GLSL vertex and fragment shaders
├── studio/                       # Sanity Studio CMS workspace configuration
├── tests/
│   ├── e2e/                      # Playwright end-to-end user journey tests
│   └── unit/                     # Vitest unit & component tests
├── .firebaserc (planned)         # Firebase project aliases configuration
├── biome.json (planned)          # Biome linting and formatting configuration
├── firebase.json (planned)       # Firebase Hosting headers, rewrites, and function config
├── next.config.ts (planned)      # Next.js static export build configuration
├── package.json                  # Root dependency manifest and scripts
├── README.md                     # Product brief and architecture documentation
└── tsconfig.json (planned)       # Strict TypeScript compiler configuration
```

---

## Roadmap

- **Phase 0**: Setup & Infrastructure (Completed)
- **Phase 0.5**: Product Brief & Architectural Specifications (Completed)
- **Phase 1**: Config & Design Tokens (Planned)
- **Phase 2**: Layout & Smooth Scroll (Planned)
- **Phase 3**: Hero & 3D Ball Experience (Planned)
- **Phase 4**: Work & Content Sections (Planned)
- **Phase 5**: Contact & Firebase Backend (Planned)
- **Phase 6**: Performance, Accessibility & Security Hardening (Planned)
- **Phase 7**: Launch & Awwards Submission (Planned)

---

## Conventions

- Strict TypeScript (`noImplicitAny: true`, no `any`)
- Biome formatting & strict linting
- Feature-based modular folder organization
- Conventional git commits

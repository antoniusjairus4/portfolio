# Jairus Portfolio

## About the project
Personal portfolio of Jairus: cybersecurity student, two-time Tamil Nadu state table tennis champion, and young founder. Built to a competition standard, aiming for Awwards Site of the Day and the Developer award.

## Status
Phase 0: setup only, no application code written.

## Goals and quality bar
- Awwards targets: Design, Usability, Creativity, Content, Developer
- Performance: Lighthouse 95+ mobile, LCP < 2.5 s, initial JS < 200 KB gzipped, 60 fps
- Accessibility: WCAG AA, keyboard navigation, reduced-motion support, no-WebGL fallback
- Security: A+ on securityheaders.com, strict CSP, App Check

## Tech stack
| Layer | Tools | Why We Chose Them |
| --- | --- | --- |
| Framework | Next.js (App Router) + TypeScript | Static export for Firebase Hosting, type safety, SSG performance |
| Package Manager | pnpm | Fast, deterministic, strict dependency tree |
| Motion | GSAP (ScrollTrigger, SplitText, Flip), Lenis, Motion | Smooth inertia scroll, complex timeline choreography, micro-interactions |
| 3D & Physics | Three.js, React Three Fiber, drei, postprocessing, Rapier | Performant WebGL canvas, declarative 3D scenes, physics-driven interactive table tennis ball |
| Styling & UI | Tailwind CSS v4, Radix Primitives, cmdk, CVA, clsx, tailwind-merge | Unstyled accessible primitives, zero-runtime utility styling, command palette |
| State & Validation | Zustand, Zod | Lightweight atomic state management, runtime schema validation |
| Content | Sanity (next-sanity) | Headless CMS for real-time editorial content management |
| Backend & Auth | Firebase Hosting, Cloud Functions, Firestore, App Check, Resend | Serverless backend, bot protection, email delivery, hosting with custom domain |
| Quality & Tooling | Biome, Vitest, Testing Library, Playwright, Husky, lint-staged, Lighthouse CI | Ultra-fast linting/formatting, unit & E2E testing suite, automated CI quality gates |
| 3D Pipeline | gltfjsx, gltf-transform (Draco, Meshopt, KTX2) | 3D model compression, optimization, and JSX component codegen |
| CI/CD | GitHub Actions | Automated deployment pipeline to Firebase Hosting |

## How it works (planned)
1. Content lives in Sanity (or MDX) and is fetched at build time.
2. Next.js builds a static export; GitHub Actions deploys it to Firebase Hosting on the custom domain.
3. A Sanity webhook triggers a rebuild when content changes.
4. Lenis drives smooth scrolling; GSAP ScrollTrigger reads that scroll to run page animations.
5. The WebGL scene (React Three Fiber) is lazy-loaded after first paint; Rapier handles physics and the ball reacts to the pointer.
6. The contact form posts to a Firebase Cloud Function, which validates with Zod, checks App Check, stores in Firestore, and emails via Resend.
7. Firebase Hosting serves strict security headers from firebase.json.

## Directory structure
- `src/app/` - Next.js App Router route handlers and static pages
- `src/components/ui/` - Atomic, accessible Radix-based UI primitives
- `src/components/layout/` - Layout structures (Header, Footer, Navigation)
- `src/components/sections/` - Core editorial portfolio page sections
- `src/components/cursor/` - Custom reactive cursor implementation
- `src/components/preloader/` - Initial loading screen and asset preloader
- `src/webgl/scenes/` - React Three Fiber 3D scene compositions
- `src/webgl/shaders/` - Custom GLSL vertex and fragment shaders
- `src/webgl/materials/` - Custom WebGL shader materials
- `src/webgl/physics/` - Rapier 3D physics colliders and forces
- `src/webgl/hooks/` - WebGL canvas and shader animation hooks
- `src/motion/gsap/` - GSAP timeline and ScrollTrigger registration
- `src/motion/lenis/` - Lenis smooth scroll provider and controls
- `src/motion/transitions/` - Page transition animations
- `src/content/` - Content schemas and queries (Sanity / MDX)
- `src/lib/` - Shared utility functions and client instances
- `src/hooks/` - Custom React hooks (accessibility, media queries, reduced motion)
- `src/styles/` - Global Tailwind CSS v4 stylesheets and typography rules
- `src/types/` - Global TypeScript interfaces and type definitions
- `public/fonts/` - Self-hosted web fonts (WOFF2)
- `public/models/` - Optimized 3D model assets (.glb)
- `public/textures/` - WebGL texture maps
- `public/hdri/` - HDRI environment maps for 3D lighting
- `public/og/` - OpenGraph preview images
- `functions/src/` - Firebase Cloud Functions backend logic
- `studio/` - Sanity Studio CMS workspace configuration
- `tests/unit/` - Vitest unit & component tests
- `tests/e2e/` - Playwright end-to-end user journey tests
- `docs/` - Architecture, security compliance, and submission documentation
- `.github/workflows/` - GitHub Actions CI/CD deployment workflows
- `package.json` - Root dependency manifest and scripts
- `tsconfig.json` - Strict TypeScript compiler configuration
- `next.config.ts` - Next.js static export build configuration
- `biome.json` - Biome linting and formatting configuration
- `firebase.json` - Firebase Hosting headers, rewrites, and function deployment config
- `.firebaserc` - Firebase project aliases configuration

## Scripts (planned)
dev, build, lint, test, test:e2e, lighthouse, deploy

## Roadmap
Phase 0 setup, Phase 1 config and design tokens, Phase 2 layout and smooth scroll, Phase 3 hero and 3D ball, Phase 4 work and content pages, Phase 5 contact and Firebase backend, Phase 6 performance, accessibility, security hardening, Phase 7 launch and Awwards submission.

## Conventions
Strict TypeScript, no `any`, Biome formatting, feature-based folders, conventional commits.

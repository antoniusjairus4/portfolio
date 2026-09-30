# Section Blueprint & Technical Specifications

> **Status**: Phase 0.5 Brief (Comprehension & Architectural Specifications)
> **Goal**: Awwards Site of the Day & Developer Award Standards

---

## Architectural Principles & Cross-Cutting Specifications

### 1. Performance & WebGL Budget
- **Performance Targets**: Lighthouse 95+ Mobile, LCP < 2.5s, Initial JS < 200 KB gzipped (WebGL canvas lazy-loaded and excluded), 60 fps steady frame rate.
- **Canvas Strategy**:
  - A single root `<Canvas>` overlay managed by React Three Fiber will be used across the application.
  - Offscreen scenes (e.g. Hero Ball, Arena Gear Paddle, Medal Wall) will be paused, unmounted, or hidden based on `IntersectionObserver` signals to keep GPU draw calls strictly budgeted under 50 per frame.
  - Shader postprocessing passes will automatically adjust or disable based on detected device performance tiers (using `three-perf` / device memory limits).

### 2. Motion & Scroll Orchestration
- Lenis handles inertial smooth scrolling on the main thread.
- GSAP `ScrollTrigger` synchronizes element position transforms based on Lenis scroll updates (`lenis.on('scroll', ScrollTrigger.update)`).
- R3F frame loop (`useFrame`) reads mouse pointer coordinates via interpolated spring values to prevent main-thread layout thrashing.
- Reduced Motion (`prefers-reduced-motion: reduce`) automatically disables smooth scroll, turns off physics simulation loops, and replaces continuous GLSL distortion shaders with static CSS keyframe opacity fades.

### 3. Runtime Data & Static Export Pipeline
- Next.js builds a static HTML export deployed to Firebase Hosting.
- Live dynamic data (Chess.com ratings, GitHub PR feeds, availability status, Coimbatore local clock) use client-side fetching via SWR with a Firebase Cloud Function proxy cache layer to avoid API rate limits and enforce strict Content Security Policy (`connect-src`).

### 4. Security & Privacy Hygiene
- Strict Content Security Policy (CSP), HSTS, XSS protection, and frame options enforced via `firebase.json` security headers (aiming for A+ on securityheaders.com).
- Firebase App Check verification on Cloud Functions.
- Self-contained static CTF challenge with zero production vulnerability; strictly no disclosure of unpatched exploits or sensitive personal data (e.g., date of birth, exact academic grades).

---

## Detailed Section Specifications

### 1. Preloader (Tier 1 - Signature)
- **Purpose**: Serve as the first impression and the seamless "serve" transition into the portfolio story.
- **Experience**: A wireframe table tennis ball bounces in sync with an asset loading counter climbing to 100%. Upon reaching 100%, the serve launches the camera directly into the Hero WebGL viewport without a hard page cut.
- **Real Facts**: Asset preloader for 3D model assets (`.glb`), WOFF2 fonts, and HDRI textures.
- **Technical Fallbacks**:
  - *Reduced Motion*: Displays a minimal text counter and fades out instantly without camera movement.
  - *No WebGL / Low Power*: Standard 2D SVG vector progress bar with instant crossfade.
  - *Slow Network / JS*: Auto-skip button appears after 3.0 seconds to prevent blocking users.
- **Accessibility & ARIA**: `role="progressbar"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`, screen-reader announcements on completion (`aria-live="polite"`).

---

### 2. Hero (Tier 1 - Signature)
- **Purpose**: State Jairus's identity (Student, Freelancer, Founder) in 5 seconds and deliver the signature 3D experience.
- **Experience**: Interactive wireframe 3D table tennis ball controlled by Rapier physics. The cursor transforms into a custom paddle enabling visitors to rally with the ball. Title displays Jairus's name and rotating role titles.
- **Real Facts**: B.E. Computer Science (Cybersecurity) student at SKCET Coimbatore, from Trichy.
- **Technical Fallbacks**:
  - *Reduced Motion*: 3D ball remains stationary with subtle CSS floating keyframes; cursor rally disabled.
  - *No WebGL*: Pre-rendered CSS glassmorphic 2D spherical element with gradient glow.
  - *Mobile Touch*: Touch pointer controls paddle position; touch drag replaces mouse movement.
- **Accessibility & ARIA**: Accessible `<h1>` tag with structured `visually-hidden` fallback text for screen readers; full keyboard focus support for interactive elements.

---

### 3. Ventures (Tier 1 - Signature)
- **Purpose**: Prove Jairus builds, ships, and commercializes real-world AI and software products.
- **Experience**: Editorial mini case studies featuring interactive card hover previews driven by custom GLSL liquid distortion shaders.
- **Real Facts**:
  1. **Palindrome**: Real-time personal finance platform featuring an AI wealth copilot, OCR receipt scanning, live telemetry, tamper-evident hash-chained ledger, and field-level encryption. Live at `palindrome.antoniusjairus.in` (v2 in progress).
  2. **KaiForge**: Table tennis performance analytics platform. Commercially launched and sold (his first sale). Live at `kaiforge.antoniusjairus.in` (full rebuild planned).
  3. **NeuroScan AI**: Deep learning platform utilizing MRI analysis for early Alzheimer's detection, accompanied by the NeuroShield infrastructure security repository (in active development).
- **Technical Fallbacks**:
  - *Reduced Motion / No WebGL*: Liquid distortion shader replaced with CSS transform scale and opacity transition.
- **Accessibility & ARIA**: Semantic `<article>` cards, `aria-label` link descriptions pointing to live products with external link indicators (`target="_blank" rel="noopener noreferrer"`).

---

### 4. Security Lab (Tier 1 - Signature)
- **Purpose**: Showcase Jairus's cybersecurity expertise through a hands-on interactive terminal and CTF challenge rather than static credential badges.
- **Experience**: Interactive command-line interface supporting commands (`whoami`, `ls projects`, `sudo hire jairus`, `help`, `cat info`). Features a hidden CTF route ("hack this page") with a self-contained static cipher/hash puzzle.
- **Real Facts**:
  - **Morena**: Stateful CLI recon & web-asset auditing tool (WeMakeDevs Scrape-Verse hackathon project).
  - **RiskView360 / PWNDORA**: Organizational security posture dashboard (co-developed for BrewingSec CyberDev Summit 2026).
  - **C-DAC Bug Bounty Competition**: Selected finalist and attendee at national competition in Bengaluru.
  - **BOSS OS Audit**: Vulnerability assessment of BOSS OS for security competition PS-04.
- **Technical Safety Rules**: The CTF challenge is strictly static client-side logic with zero vulnerability in the production application. No unpatched exploit details or proprietary audit data are disclosed.
- **Technical Fallbacks**:
  - *JS-Disabled / Accessibility*: Terminal UI falls back to an accessible plain text list of security tools and achievements.
- **Accessibility & ARIA**: ARIA log region (`role="log"`, `aria-live="polite"`), command line input labeled with `aria-label="Security terminal input"`, full keyboard navigation.

---

### 5. Arena (Tier 1 - Signature)
- **Purpose**: Highlight the athletic discipline, national achievements, and competitive mindset behind the engineer.
- **Experience**: Interactive 3D medal wall where medals tumble with Rapier physics on interaction; 3D paddle with clickable gear hotspots; separate karate honors showcase.
- **Real Facts**:
  - **Table Tennis**: 2x Tamil Nadu State Champion, National Gold Medalist (Goa), RDS Gold Medalist, Silver Medalist for SKCET in Anna University selections.
  - **Gear Specifications**: Tibhar Félix Lebrun Hyper Carbon blade, Friendship 729 Battle 2 rubber, practice with Amicus Prime robot.
  - **Karate**: Black belt, 4x National Champion, over 15 state-level medals.
- **Technical Fallbacks**:
  - *Reduced Motion / Low Power*: Physics disabled; medals displayed in a CSS grid with subtle hover highlights; 3D paddle replaced with interactive SVG hotspot diagram.
- **Accessibility & ARIA**: All hotspot buttons equipped with `aria-expanded` and `aria-controls` attributes; accessible text descriptions of all sports achievements and gear specifications.

---

### 6. Chess (Tier 2 - Core)
- **Purpose**: Demonstrate strategic calculation and tactical problem-solving skills.
- **Experience**: Live Chess.com stats display alongside an interactive board showcasing an opening demo of **1.b3** (Nimzowitsch-Larsen Attack).
- **Real Facts**: Chess.com username `GM_Anthya`, moniker `hades crimson`. Favorite opening: 1.b3. Ratings fetched dynamically.
- **Technical Fallbacks**:
  - *API Down*: Shows cached build-time ratings with a clear timestamp badge.
  - *No WebGL/JS*: Interactive board falls back to static PGN move notation display.
- **Accessibility & ARIA**: Chessboard moves accessible via keyboard arrow keys with screen reader move text (`aria-live="assertive"`).

---

### 7. Open Source (Tier 3 - Supporting)
- **Purpose**: Highlight open-source collaboration, community contributions, and code consistency.
- **Experience**: Live pull request activity feed from GirlScript Summer of Code (GSSoC) 2026 and hackathon achievement badges.
- **Real Facts**: GSSoC 2026 contributor to repositories `RestroHub` and `GSoC-Org-Finder`. GitHub username: `antoniusjairus4`.
- **Technical Fallbacks**: Static fallback list of contributions when GitHub API rate limits are reached.
- **Accessibility & ARIA**: Semantic list structure (`<ul>`/`<li>`), external repository links clearly labeled.

---

### 8. Off the Clock (Tier 3 - Supporting)
- **Purpose**: Demonstrate leadership history, public speaking capability, musical certification, and professional organization memberships.
- **Experience**: Smooth horizontal scroll card deck featuring leadership milestones, public speaking achievements, an interactive 8-key playable musical keyboard, and IEEE membership badges.
- **Real Facts**:
  - **Leadership**: School Pupil Leader (2024–2025) and Assistant Leader (2023–2024) at Campion Anglo-Indian Higher Secondary School, Trichy.
  - **Public Speaking**: 3rd place at Coimbatore Book Festival public speaking contest (July 2026).
  - **Music**: 3 graded music examinations certified by Trinity College London.
  - **Professional Memberships**: IEEE member (since Nov 2025), IEEE TEMS member (since Dec 2025).
- **Technical Fallbacks**:
  - *Reduced Motion / Mobile*: Standard vertical stacked card grid with CSS scroll-snap.
  - *Audio Disabled*: Musical keyboard provides visual key press feedback without audio playback errors.
- **Accessibility & ARIA**: Keyboard keys mapped to piano keys (`aria-label="Note C4"`, `role="button"`), accessible tab stops.

---

### 9. Timeline (Tier 3 - Supporting)
- **Purpose**: Connect Jairus's journey from school leadership to college, startups, cyber security competitions, and present day.
- **Experience**: Scroll-scrubbed interactive line path connecting key life milestones chronologically.
- **Real Facts**: Chronological sequence: Trichy (Campion School) -> SKCET Coimbatore -> Table Tennis & Karate Championships -> Startup Launches (KaiForge, Palindrome) -> Security Competitions & Bug Bounties -> Present.
- **Technical Fallbacks**: Vertical static timeline line with standard layout flow under reduced motion.
- **Accessibility & ARIA**: Ordered list (`<ol>`) layout for semantic screen reader navigation.

---

### 10. Work With Me (Tier 2 - Core)
- **Purpose**: Convert portfolio visitors into high-value freelance clients and engineering partners.
- **Experience**: Overview of engineering services offered, development methodology, real-time availability indicator badge, and client testimonial.
- **Real Facts**: Active freelance engineer. Built portfolio website for scientist Yogesh Kumar JS; developed promotional web platform for Jairus High Performance Table Tennis Center. Testimonials displayed only with client consent.
- **Technical Fallbacks**: Static availability badge fallback when real-time backend status is unreachable.
- **Accessibility & ARIA**: Accessible quotation markup (`<blockquote>` and `<cite>`) for client testimonials.

---

### 11. Contact (Tier 2 - Core)
- **Purpose**: Serve as the final interaction ("match point") for client leads and contact inquiries.
- **Experience**: Interactive contact form with real-time schema validation, protected by Firebase App Check, posting to a Firebase Cloud Function for email delivery via Resend; footer featuring live Asia/Kolkata (Coimbatore) local time clock.
- **Real Facts**: Hosted on Firebase under custom domain (`antoniusjairus.in`).
- **Technical Fallbacks**: Native HTML form submission handling with standard browser validation fallback.
- **Accessibility & ARIA**: Explicit form input labels (`for` and `id` bindings), `aria-invalid`, `aria-describedby` for field-level error messages, `aria-live` status regions for submission states.

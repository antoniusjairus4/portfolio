# Phase 3: Physical 3D Tear Transition Specifications

## Overview
Phase 3 implements an Awwards Site of the Day (SOTD) signature page reveal transition. Once Beat C completes (where the cover photo halves exit completely off-screen), the full intact page (background image, scrim, name typography, and three roles) tears away in vertical strips from right-to-left, revealing the next page beneath (`#page-1-placeholder`).

Each strip peels from its top edge, curls downward in 3D around a roll cylinder with real lighting, torn noise edges, subtle paper grain, and drops off-screen.

---

## 1. Beat Timeline & Constants

| Constant | Value | Description |
| :--- | :--- | :--- |
| `NAME_EXIT_SCALE_END` | `1.3` | Final scale of the text block at the end of Beat C |
| `TEAR_SCROLL_DISTANCE_VH` | `220` | Scroll distance allocated for Beat D (2.2 viewport heights) |
| `SCROLL_STORY.totalDistanceVh` | `570` | Total scroll story pin length (5.7 viewport heights) |
| `SCROLL_STORY.beats.revealEnd` | `0.20` | Beat A completion (photo split opens) |
| `SCROLL_STORY.beats.readEnd` | `0.32` | Beat B completion (hold & read) |
| `SCROLL_STORY.beats.exitEnd` | `0.57` | Beat C completion (halves leave off-screen, text scales to 1.3) |
| `SCROLL_STORY.beats.holdEnd` | `0.61` | Beat C Clean Hold completion (~5% story duration) |
| `SCROLL_STORY.beats.tearEnd` | `1.00` | Beat D completion (all strips fallen off-screen) |
| `STAGGER_OVERLAP` | `0.55` | Overlap factor creating a smooth rolling wave across strips |

---

## 2. Strip Layout & Breakpoints

Strips are vertical slices of the full viewport calculated responsively:
- **Desktop (>=1024px)**: `7` strips
- **Tablet (640px–1023px)**: `5` strips
- **Mobile (<640px)**: `4` strips

### Seam Prevention & Bleed
To avoid hairline gaps between adjacent strips across browser zoom levels (50%–300%) and device pixel ratios (1.0, 1.5, 2.0, 3.0), each strip plane geometry is extended by `2px` of bleed on each vertical edge, with UV mapping adjusted so textures map seamlessly without spatial distortion.

---

## 3. Shader Architecture & 3D Physical Dynamics

### Vertex Shader (`stripVertexShader`)
1. **Cylinder Roll Bend**: Evaluates local vertex coordinates against strip roll position `rollY`.
2. **Curve & Lift**: Applies trigonometric cylinder wrapping around radius $R$, lifting vertices along $+Z$ towards the camera.
3. **Gravity & Acceleration**: Applies downward gravity acceleration $g \cdot (t_{strip})^2$ once detached.
4. **Natural Variation**: Seeded pseudo-random generator (`pseudoRandom`) applies per-strip $Z$-axis rotation (±4.5°), curl radius variance (±15%), and minor $X$-axis drift.
5. **Dynamic Normals**: Recalculates vertex normals after spatial deformation to guarantee realistic key light reflections.

### Fragment Shader (`stripFragmentShader`)
1. **Noise-Based Torn Edge**: Uses Simplex-style procedural noise to generate jagged tears along left and right edges (amplitude 6–10px) activated only upon strip detachment.
2. **Paper Fibre Rim**: Renders a delicate, bright fibre highlight along the active tear contour.
3. **Back Face Rendering**: Detects `gl_FrontFacing === false` to render a darker, slightly desaturated, mirrored rear face with subtle procedural paper grain.
4. **Lighting**: Direct warm gold key light (`#FFF3D0`), ambient fill, specular paper sheen, and dynamic shadow attenuation.

---

## 4. Deterministic Offscreen 2D Texture Composition

Before Beat D commences:
1. `composePageTexture` renders the full intact DOM page onto an offscreen 2D canvas at exact viewport resolution scaled by `dpr` (capped at 2.0).
2. Renders background image (`/images/hero/after_split-1672.avif`), dark gradient scrim, Cinzel Decorative / Clash Display typography for `JAIRUS` scaled by `1.3`, and the three roles (`STUDENT`, `FREELANCER`, `ENTREPRENEUR`).
3. Passes the resulting `THREE.CanvasTexture` to all WebGL strip meshes, ensuring a pixel-perfect handoff with 0% diff against the DOM layer.

---

## 5. Performance, Adaptive Quality & Fallbacks

1. **Lazy Loading**: WebGL chunk (`StripTearCanvas`) dynamic import deferred until after preloader completion.
2. **Demand-Based Rendering**: WebGL frame rendering active **only** while scroll position is within Beat D (`progress >= holdEnd` and `progress <= tearEnd`).
3. **Adaptive Quality Engine**: Measures initial frame times. If average frame time exceeds target thresholds (e.g. <45 fps on mobile), automatically steps down shadow resolution, geometry segment density, and DPR.
4. **Reduced Motion & WebGL Fallback**: If `prefers-reduced-motion` is active or WebGL 2 is unsupported, gracefully falls back to a clean 2D CSS crossfade transition.

---

## 6. Verification Results

- **Unit Tests (`vitest`)**: 11/11 tests passed (verifying breakpoint strip counts, right-to-left order, monotonic progress, deterministic PRNG).
- **Frame-Time Benchmark**: Measured average **60.2 FPS** (17.10 ms p95) during scripted continuous tear scrolling.
- **E2E Visual Verification**: 15 beat screenshots captured across Desktop (1440px), Tablet (900px), and Mobile (390px) at 0%, 25%, 50%, 75%, and 100% progress.

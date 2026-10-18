# KaiForge production environment pass

Status: implemented for visual approval, not artist-approved. Baseline `6a60041`, main, clean working tree at task start. No commit or push. No Blender execution, asset editing, GLB loading, or production athlete integration.

## Scope and source of truth

Read production architecture, asset manifest, performance budget, Blender pipeline, and locked KF staging. The metre-scale staging document supersedes the older oversized greybox coordinates in the architecture prose. All five desktop and portrait camera positions/targets are copied from the lock, with the same progress-times-four smoothstep interpolation. FOV remains 39° / 46° from the shared canvas. Root (-1.950,.025,.380), yaw .040 and scale 1 are used by an explicitly named temporary proxy. This is not a character-development pass or a claim that the proxy is the approved production athlete.

The existing chapter controller, five beat thresholds, provider ownership, asset lifecycle, demand rendering, Hero seam and Palindrome boundary remain unchanged. No new loop, scroll listener, wheel interception, renderer, texture download, dependency, or post stack. Procedural resources are scene-owned and disposed on teardown; no empty GLB registry entry was invented.

## Implemented art

A matte, finite parchment working surface occupies the sporting space. Detached offset wall slabs, unequal portal supports and separated ground extensions leave Ink gaps, with deliberately unequal depth/scale. Static camera parallax supplies most movement. Portrait uses fewer/repositioned outer supports, not altered athlete/table staging.

Regulation 2.740×1.525 m table, surface .760 m; thin 40 mm top, sideline/end markings and doubles centerline, joined supports/crossmembers. The net spans 1.525 m, reaches .9125 m, and uses one cheap line-segment grid plus a top band, two posts/clamps. The physical ball radius is .020 m, matte and nonemissive. The five-point conceptual path starts at the locked contact. A 1,001-point test verifies table/net clearance with a 1 mm bounce tolerance.

One warm directional key (1024 shadow map desktop), one hemisphere fill; six shadow-casting meshes. Portrait has zero active shadow passes and two inexpensive opaque contact impressions. No spotlights, red fill, emissive ball, mirror floor, fog sheets, particles or bloom. Ten scene-owned shared material resources including the net line material and contact material; no custom shaders. Meshes are merged by material/lifetime where useful.

### Five beats

- Recognition: actor/table/net relationship in a substantial parchment chamber; no crimson. The original semantic text remains the authority.
- Approach: the exact locked camera moves through unequal architectural depths; no artificial speed ramp or idle architecture.
- Impact: one thin nonemissive crimson directional registration from the contact axis and a 7 cm maximum structural response. No explosion/ring/particle event. The ball departs after proxy contact at .49, rather than leaving before contact.
- Understanding: a neutral main trajectory and up to three neutral echoes (one portrait) reveal progressively. The conceptual, non-telemetry disclosure is unchanged and readable.
- Release: outer architecture recedes, echoes retire in stages, crimson is already gone, and the locked elevated camera returns toward the center axis. Existing Palindrome handoff remains the owner of the next chapter.

DOM text is resized and given opaque editorial Ink/Parchment backing because the prior light text lost contrast on the new lit surfaces; portrait title no longer clips. No navigation/progress UI was added. Reduced-motion/no-WebGL keep semantic HTML and an intentionally static architectural CSS composition, with no canvas.

## Review captures

All paths are relative to `docs/review/kf-environment/`:

- `1440x900-recognition.png`
- `1440x900-approach.png`
- `1440x900-impact.png`
- `1440x900-understanding.png`
- `1440x900-release.png`
- `390x844-recognition.png`
- `390x844-impact.png`
- `390x844-release.png`
- `1920x1080-impact.png`
- `reduced-motion.png`
- `no-webgl.png`
- `metrics.json`

Captured in local system Chrome, headless, DPR 1. Responsive viewport emulation is not a real-phone performance result. Runtime cap is 1.75 desktop / 1.25 portrait, bounded by the existing environment cap.

## Measurements

Visible triangles count frustum-intersecting visible mesh draw ranges (not occlusion/individual triangle clipping). Submitted triangles and calls come from Three renderer.info after rendering, including desktop shadow work. Line primitives are not triangles. Material metrics in JSON count active mesh materials, excluding the line material. Six meshes remain flagged as shadow casters in portrait, but shadows are disabled there.

| Viewport | Beat | Visible mesh triangles | Submitted triangles | Draw calls |
| --- | --- | ---: | ---: | ---: |
| 1440×900 | recognition | 1372 | 2260 | 21 |
| 1440×900 | approach | 1372 | 2260 | 21 |
| 1440×900 | impact | 1384 | 2272 | 22 |
| 1440×900 | understanding | 3356 | 4244 | 25 |
| 1440×900 | release | 2396 | 3284 | 23 |
| 390×844 | recognition | 1386 | 1386 | 17 |
| 390×844 | impact | 1398 | 1398 | 18 |
| 390×844 | release | 2410 | 2410 | 19 |
| 1920×1080 | impact | 1384 | 2272 | 22 |

The environment/proxy pass remains well below KF ceilings. These numbers exclude the future production athlete. Current measured maximum is 25 draws; there is substantial headroom for its later reviewed integration. No hardware FPS, thermal, or GPU-byte acceptance claim is made.

## Validation

- TypeScript: pass (`tsc --noEmit --incremental false`).
- Production lint: pass, 13 existing warnings outside the new systems.
- Seven focused unit tests: pass, including locked center-axis projection, physical curve clearance and reverse camera reconstruction.
- Eleven focused KaiForge browser cases: pass, including two exact canvas-pixel reverse reconstruction checks, responsive overflow, shared renderer, semantics, direct hash/history, reduced motion and no-WebGL.
- Additional existing Hero continuous-Recognition handoff test: pass. No Hero source was edited.
- Production static-export build: pass (`pnpm build`).
- No browser page errors in review captures.

## Known limitations / approval questions

- Proxy anatomy/paddle and rigid pose remain deliberately primitive; evaluate environment rather than character art.
- Desktop shadows are hard-edged under the existing basic-shadow renderer policy; portrait contact impressions are simplified, not physically simulated soft shadows.
- The locked Impact camera intentionally crops the far table edge, especially portrait. Athlete/contact remain readable; cameras were not silently widened.
- The existing Hero horizontal rupture remains briefly visible across early Recognition / direct no-WebGL entry. It originates outside KaiForge; preserved rather than changing the locked Hero in this task.
- The real 40 mm ball is small in the wide portrait Recognition shot. No fake permanent glow or size inflation was introduced.
- Architecture and editorial text treatment need human visual approval. No claim of final production-art approval is made.
- Net aliasing, DPR/fill-rate and future skinned-asset costs require real integrated-laptop/phone measurement. Software/headless captures do not prove 60 FPS. Future integration must recheck silhouettes and contact against the actual athlete.

## Files

Modified: `src/webgl/scenes/KaiForgeScene.tsx`, `src/components/kaiforge/KaiForgeChapter.tsx`.

Added: `src/components/kaiforge/kaiforgeProduction.css`; `src/webgl/scenes/kaiforge/{Architecture,Equipment,Materials,ProxyAthlete,Trajectory}.tsx`; `src/webgl/scenes/kaiforge/{geometry,staging}.ts`; `tests/unit/kaiforgeStaging.test.ts`; `tests/e2e/kaiforge-production.spec.ts`; this report and the review capture directory.

Chapters modified outside KaiForge: **NO**. Shared canvas/provider/lifecycle changed: **NO**. Production athlete integrated: **NO**. Blender used: **NO**. Commits/pushes: **NO**.

**KAI FORGE ENVIRONMENT VISUAL APPROVAL REQUIRED: YES.**

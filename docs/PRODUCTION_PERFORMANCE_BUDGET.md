# Production budgets and acceptance gates

Status: proposed limits, not measured production results. Baseline `15f8aef`; see [architecture](PRODUCTION_ARCHITECTURE.md) and [manifest](PRODUCTION_ASSET_MANIFEST.md). Units: transfer MB decimal; memory MiB binary. Per-world maxima are admission ceilings, not a reason to consume the allowance. Shader, renderer, browser and DOM overhead are additional to asset estimates.

## Device envelope

| Tier | Active-motion target | DPR ceiling | Loaded / visible triangles | Draw calls including shadow passes | Unique materials | Resident asset memory: textures / geometry+animation / total |
| --- | --- | --- | --- | --- | --- | --- |
| High, modern desktop | 60 FPS, p95 frame interval <=20 ms | 2, reduce at large viewport | 150k / 100k | 100 target, 120 ceiling | <=24 | <=64 / 20 / 96 MiB |
| Balanced, integrated laptop | 50–60 FPS, p95 <=25 ms | 1.5 | 100k / 70k | <=75 | <=18 | <=40 / 14 / 64 MiB |
| Low, mid-range phone/weak GPU | 30–45 FPS, p95 <=40 ms | 1–1.25 | 60k / 40k | <=45 | <=12 | <=24 / 8 / 40 MiB |
| No WebGL | Native document interaction | N/A | 0 | 0 | 0 GPU | 0 production 3D |
| Reduced motion | Static editorial chapters | N/A | 0 | 0 | 0 GPU | 0 production 3D |

High is not a gaming-machine-only target. Begin conservative on coarse/small devices, map existing `reduced` to balanced/low policy, and preserve separate portrait composition. These tier names are proposals, not existing API values. Reduced motion is an orthogonal preference overriding motion/3D, not the bottom hardware tier.

No fingerprint-heavy GPU classification. Start from current WebGL/pointer/viewport signals. During actual scroll only, collect a short frame window: repeated >33 ms desktop or >45 ms mobile median frames can downgrade once at a quiet boundary. Never oscillate quality during a shot; do not add a perpetual benchmarking loop. Context loss/allocation failure falls back immediately. DPR downgrade first, then shadows/maps, then asset tier at a hidden boundary. Record actual hardware/browser/temperature in gates.

## Transfer and memory ledger

| Bucket | Desktop target / hard planning ceiling | Mobile target / ceiling | Accounting |
| --- | --- | --- | --- |
| Initial critical HTML/CSS/JS + portrait + needed fonts | 1.5–2.5 / 3 MB | 1–2 / 2.5 MB | Cold compressed transfer, no 3D model; existing preload font/portrait gate stays |
| Early KF prefetch | 3–5 / 6 MB | 1.5–2.5 / 3 MB | After critical readiness; part of KF budget, not additive |
| KF world | 4–6 / 7 MB | 2–3 / 3.5 MB | Athlete+clip+paddle+maps, procedural geometry contributes code |
| PAL world | 3–5 / 6 MB | 1.5–2.5 / 3 MB | Person+kit+maps |
| NS world | .1–.5 / .75 MB | .05–.25 / .4 MB | Code/data/optional approved vectors, no GLB |
| SK world | .1–.5 / .75 MB | .05–.25 / .4 MB | Code/procedural data, no GLB |
| Shared codecs/material maps/environment | .5–1.5 / 2 MB | .3–.8 / 1 MB | Count once; no environment unless justified |
| Entire visited journey cold transfer | 10–16 / 20 MB | 5–9 / 11 MB | Includes critical and all visited worlds; no unused variants or legacy galleries |
| Application compressed-byte cache | <=24 MiB | <=12 MiB | LRU, independently evictable; browser HTTP cache not application-owned |
| Decoded CPU world data incl. transient decode | <=100 MiB active, <=160 peak with neighbor | <=48 active, <=72 peak | Geometry buffers, skin/clip, bitmap/transcode output; drop obsolete results |
| Asset GPU peak with transition neighbor | <=128 MiB high, <=88 balanced | <=48 MiB low | Admission cap overrides per-world sum; never retain two full high sets by default |
| Renderer targets/depth/MSAA/shadow reserve | 32–64 MiB high; 16–40 balanced | 12–24 MiB | Resolution dependent; measure separately, do not hide in texture budget |

Do not add all row ceilings and call the result approved. Total journey ceiling still applies. Infrastructure must measure the current JS/font baseline before optimizing; these figures do not assert the current page meets them. Codec binaries belong in shared download even if embedded in a JS chunk. Code splitting is independent of asset prefetch: future lazy scene modules should not pull all optional decoders into Hero.

Texture GPU estimate: uncompressed width × height × bytes/texel × approximately 4/3 for mipmaps; compressed block formats use actual block dimensions/bytes, not file size. A 2048² RGBA8 map with mips is roughly 21.3 MiB; three such maps can consume the high texture allowance alone if compression falls back. Count cubemap faces, PMREM levels, render targets and shadow depth separately. Geometry estimate uses actual typed arrays/indices/skin attributes, not triangle count × guessed constant. Preserve headroom for duplicated decode/upload buffers. Browser JS heap is not GPU memory and `renderer.info.memory` counts are not byte totals.

### Per-world active ceilings

| World | Loaded triangles high / low | Visible triangles high / low | Draw high / low | Texture MiB high / low | Geometry+clip MiB high / low | Materials high / low |
| --- | --- | --- | --- | --- | --- | --- |
| KF | 75k / 30k | 65k / 28k | 80 / 40 | 48 / 20 | 14 / 6 | 18 / 10 |
| PAL | 65k / 28k | 55k / 25k | 80 / 40 | 40 / 18 | 12 / 5 | 18 / 10 |
| NS | 15k / 6k | 15k / 6k | 45 / 25 | 4 / 2 | 4 / 2 | 8 / 6 |
| SK | 30k / 12k | 18k / 8k | 55 / 30 | 8 / 4 | 6 / 3 | 8 / 6 |

Shared assets count toward each resident-world cap but once in the global ledger. Procedural rows may share materials; summing per-asset slots does not equal unique materials. Shadow passes count as draws. One athlete skeleton, 30–45 bones desktop, <=30 mobile, <=4 weights/vertex, one clip <=3 seconds at authoring sample rate 24–30 FPS; optimize redundant keys after checking contact. CPU pose evaluation target <1 ms desktop/<2 ms mobile per demanded frame. No other runtime skin or autonomous animation.

## Texture, LOD and substitution policy

- Typical authoring/export maps <=2K high; mobile <=1K, low props 512. No 4K default; an exception requires a screenshot proving insufficient texel density and an updated memory admission test.
- Base color sRGB; normal/roughness/metallic/AO data linear. Pack AO/Roughness/Metallic in R/G/B when UVs and resolution match. Do not atlas unrelated lifetimes. Normal maps only where silhouette cannot express necessary surface detail. Use glTF tangent-space convention; test a lit normal-map reference rather than silently flipping channels.
- KTX2/Basis for production surface maps: compare ETC1S for muted color and UASTC for normals/critical gradients, choose visually with actual transcode memory. If fallback expands to RGBA, downgrade map resolution to remain within budget.
- Athlete: 25–40k → 10–16k → optional static silhouette only for fallback. PAL person: 15–24k → 6–10k. Furniture kit: 6–12k → 2–5k. Paddle: 1–2k → .4–.8k. Procedural objects adjust tessellation, not three exported mesh LODs.
- Choose model tier before activation and keep it for the shot. A quality downgrade swaps at scene exit/occlusion, never mid-swing or against a silhouette. Do not crossfade two skinned meshes to hide popping. Reverse entry reselects based on current policy.

| World | Portrait/low substitution | Invariant |
| --- | --- | --- |
| KF | Low athlete/paddle, main trace + one echo, three depth frames, simple net, no realtime shadow | Existing portrait camera, readable action/table, impact, center seam |
| PAL | Low static person/kit, 1K atlas, five principal fragments plus total/three components, no optional prop refinement | Same room/person throughout, existing portrait transforms and five beats |
| NS | Five planes, six essential nodes, five key paths preserving alternative/terminated branch; <=1 transparent layer | Incomplete evidence and all semantic content |
| SK | Low-segment bevels, nearest structures only, no point fill/shadows/pointer offset | Six categories, current+neighbor context, locked traversal/exit |
| Hero/Achievements/Contact | Existing responsive layouts; no new asset-heavy variant | Full semantic facts, typography, QR optional on mobile |

These counts are upper bounds for representation simplification, not permission to delete narrative stages. DOM/CSS fallbacks remain the primary reduced-motion/no-WebGL art, not a low-resolution canvas or a screenshot of unreadable text.

## Production gates

Run chapter-focused checks at each integration; run the full master journey only after the final chapter or shared infrastructure changes. Do not repeatedly run every historical suite.

Common gate: visual approval at 1440×900 and 390×844 plus 1920×1080/768×1024 framing sanity; continuous forward/reverse, direct hash, 0→.9→.2 jumps and resize; readable keyboard/screen-reader semantics; no horizontal overflow; static reduced-motion/no-WebGL; no additional scroll owner or canvas. No missing asset may block native scrolling. No new long task >50 ms attributable to decode/upload during an established motion beat; split or move preparation if it occurs.

Measure 30-second active traversal on named modern desktop, integrated laptop and mid-range phone after warm-up, three runs, reporting median and p95 frame interval. Meet tier table and no sustained interval >100 ms from production resources. Cold-load readiness on a recorded 10 Mbps/100 ms RTT profile: critical Hero target <=3 s, no forced 3D wait; jump to an uncached world immediately exposes semantic content, reaches essential low-tier scene target <=3 s at that profile, otherwise remains an intentional fallback. This is an acceptance experiment, not a universal network promise.

Memory gate: traverse all worlds and return ten times; renderer geometry/texture/program counts and application ledger plateau after warm-up, not monotonic growth. At Contact: zero canvas and scene leases, no scene render callbacks, no decode work; retained byte cache stays within cap. Driver/browser caches may persist, so document measured counts/estimates instead of claiming zero process GPU memory. Test loss/recovery and one cancelled late decode.

| Chapter | Additional required proof |
| --- | --- |
| KF | Athlete/paddle contact at locked impact; no mannequin silhouette; Hero aperture reveals one KF; conceptual trace note; clip reconstructs both endpoints; KF→PAL retirement |
| PAL | Same human/room geometry and lifestyle in all five beats; no automatic-itemization implication; opaque total/components readable; KF and NS boundaries stable |
| NS | Alternative/terminated/unresolved paths legible without crimson alone; no invented results; graph provenance gate; PAL→NS→SK ownership preserved |
| SK | All six structures/taxonomy, bounded pointer only, no logo collection; depth collapse/releases at existing threshold; no GPU allocation in Achievements |
| Achievements | Four distinct motion principles; Karate crop and speeches/audience hierarchy retained; verified wording; no new canvas/physics |
| Contact | Exact approved links/email, no phone; QR scanned on real phone; focus/zoom; zero scene rendering after reverse return |
| Hero, if touched | Existing portrait/Cinzel/hold/bake/refresh contract; center-seam axis and split aperture; no decorative background or extra loading gate |

Runtime implementation gates: TypeScript, focused unit/browser tests, `pnpm lint:production`, production static-export build. Existing gate history (33 unit/69 active browser cases) is a baseline from PRE_PRODUCTION_GATE, not a test run performed for these documentation changes.

## Risk register

| Risk | Probability / impact | Mitigation and owner |
| --- | --- | --- |
| Athlete quality exceeds beginner modelling ability | High / high | Artist-reviewed silhouette/pose first; licensed adaptable base or commissioned retopology; no automatic sculpt promise; art lead |
| Uncanny human face | Medium / high | Stylized planes, limited face detail, no acting/close-up expansion; character artist |
| Swing misses accepted ball point | High / high | Contact marker and camera-envelope check before skin/detail; animation artist + runtime owner |
| Compression damages skin/normal maps | Medium / high | A/B export renders and joint deformation tests; pipeline owner |
| Mobile fill rate/thermal throttling | High / high | Low tier, no post, opaque planes, 30-second real-device runs; runtime owner |
| Hidden decoded or cached resources leak | High / high | Explicit leases, generation tokens, ten reverse cycles and Contact test; infrastructure owner |
| Shader compilation hitch | Medium / high | Small material family, bounded pre-entry preparation in shared context; fallback until ready; runtime owner |
| Budget based on download rather than GPU size | High / high | Separate texture/geometry/target ledger and compressed-format fallback; pipeline owner |
| Transparency sorting/overdraw | Medium / high | Opaque paper, narrow geometry, alpha-tested net only; art/runtime owners |
| Late load overrides current scene | Medium / high | Generation token + provider-selected identity; cancel speculative jobs; infrastructure owner |
| Factual inference from polished graphics | High / high | Abstract/verified schema, source approval checklist, no fake units/results; content owner |
| All worlds become shiny/dark | Medium / high | Chapter material matrix, parchment presence, silhouette review; art lead |
| Scope creep into cameras/effects | High / high | Locked camera fixtures, no new renderer, separate change request; reviewer |
| Source binary/licensing loss | Medium / high | Source manifest, hashes, license provenance, backed-up LFS/object storage; owner |
| Initial JS/fonts exceed envelope | Medium / medium | Measure cold transfer, split optional scene/decoder modules, audit only confirmed unused fonts later; infrastructure owner |
| Device results cannot be reproduced | Medium / high | Record hardware/browser/tier/temperature/network; report untested gates openly; reviewer |

## Measurement limits

No production GLB, texture, hardware FPS result or GPU byte measurement exists yet. Budget numbers are engineering targets sized to this asset inventory. The infrastructure proof must instrument them; KaiForge must demonstrate feasibility before the allowances are copied to another world.

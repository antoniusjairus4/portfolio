# Production architecture — post-greybox specification

Status: proposed production contract, documentation only. Inspected 2026-10-17 at `15f8aef` on `main`, clean working tree before this task. No production asset or runtime implementation is authorized by this document alone.

Read with [asset manifest](PRODUCTION_ASSET_MANIFEST.md), [Blender pipeline](BLENDER_PIPELINE.md), [budgets and gates](PRODUCTION_PERFORMANCE_BUDGET.md), [Experience Bible](EXPERIENCE_BIBLE.md), [master gate](PRE_PRODUCTION_GATE.md), and [publication checklist](PUBLICATION_VERIFICATION.md).

## Verdict and source reconciliation

Keep the accepted runtime. Add a bounded asset service around its existing scene selection in a separately approved infrastructure task. One demand-driven R3F canvas remains sufficient. No new renderer, physics engine, post stack, scroll owner, or scene-navigation system is needed.

Recognizable subjects need authored silhouettes; information and architecture need controlled proportions. Production is not a conversion of every box into a GLB. Blender is required for two people, one paddle, and one modest furniture kit. Table, net, ball, room shell, evidence structures, and all six Skills structures remain procedural. No Blender work for Hero, Achievements, or Contact.

Inspected `src/app/page.tsx`, `layout.tsx`, `src/experience/*`, all four `src/webgl/scenes/*Scene.tsx`, chapter components/fallbacks/choreography, `PhotoCoverSplit.tsx`, and `src/styles/globals.css`. Also read the Bible, Phase 0–7 chapter reports, pre-production gate and publication checklist. Historical loader/reveal/collapse/Ventures documents are historical, not production requirements: Phase 1 still describes Hero Ether and Phase 2 describes a one-world renderer. Current code supersedes those statements. The global Ether renderer is no longer mounted. Skills taxonomy is locked despite questions left in its older report.

Current facts:

- Hero is outside `ProjectExperienceProvider`; KaiForge, Palindrome, NeuroShield and Skills register inside it. Achievements and Contact follow outside it.
- `ExperienceCanvas` is dynamically imported, but imports all four scene modules statically. It renders on demand, not continuously. There is no production model cache, prefetch scheduler, texture transcoder, or memory ledger yet.
- Provider selection uses chapter activity and the incoming section top crossing `0.45 * innerHeight`. Only one scene mounts. Keep this visible-ownership decision unchanged; asset readiness must not choose the chapter.
- `chapterProgress.ts` computes `clamp(-rect.top / (rect.height - innerHeight))`, writes a mutable ref, and notifies subscribers. Scenes read it in `useFrame`; DOM copy subscribes directly. Do not migrate these chapters to GSAP.
- Hero alone uses its established GSAP/ScrollTrigger choreography and baked Matter behavior. Lenis remains the sole optional smooth-scroll owner. Achievements also uses direct progress-derived DOM transforms, despite the brief's generic GSAP description.
- Current quality names are `high`, `reduced`, `fallback`; caps are 2, 1.5, 1. Reduced motion is independent and skips the project canvas. WebGL2 failure gets complete DOM/CSS fallbacks. Portrait has separate composition/camera values.
- Skills disables registration at progress 0.995. The renderer releases before Achievements; Contact has zero canvases. The foundation's global ticker remains, so zero GPU rendering is not a claim of zero browser RAF callbacks.
- Public assets occupy about 46 MB on disk, including historical galleries and backgrounds. This is not initial transfer. `public/models` and `public/hdri` contain only placeholders. Do not preload or delete legacy files in this phase.

## Responsibility boundary

| Owner | Production responsibility | Must not own |
| --- | --- | --- |
| Blender | Athlete anatomy, pose and swing; paddle silhouette; ordinary person; domestic table/shelf/containers; UVs, baked maps, manual LOD review | Runtime camera, scroll timing, text, research claims, whole website environment |
| Three/R3F | Scene assembly, procedural geometry, light/material families, current camera functions, clip evaluation, active scene and resource leases | Scroll interception, essential copy, independent idle animation |
| GSAP/ScrollTrigger | Existing Hero timeline, portrait/type aperture, baked collapse sampling | A second timeline driving any existing project transform |
| Chapter progress | Existing world cameras, transforms, light changes, DOM beat presentation, Achievements; future clip-time mapping | Delta-time accumulation or callback-dependent story state |
| DOM/CSS | Identity, chapter titles, labels, disclosures, links, Skills taxonomy, Achievements, Contact, fallback composition | Unverified copy hidden inside decorative graphics |
| Static assets | Existing portrait, fonts, QR; future compressed surface maps and approved graph vectors | Cinematic background replacement, screenshot-led storytelling |

## Resource service proposal

Future module boundaries: `src/experience/assets/{manifest,resourceRegistry,scheduler,qualityPolicy}.ts`. Keep this separate from chapter choreography. Registry owns resources; provider owns which scene can draw; chapter owns progress. Scene components acquire/release explicit leases. Loader state updates can use React only at lifecycle boundaries, never per animation frame.

Each record contains asset ID/version/tier, URL/hash, byte budgets, generation token, request abort handle, compressed-byte reference, decoded root, resource reference counts, estimated GPU bytes, last-use boundary, and failure/retry state. A scene cannot dispose another scene's shared material/map. A cached GLTF root must not be treated as automatically disposed merely because `<primitive>` unmounts.

| State | Meaning | Allowed next states |
| --- | --- | --- |
| NOT REQUESTED | No application allocation | DOWNLOADING |
| DOWNLOADING | Abortable fetch; no parsing | DOWNLOADED; NOT REQUESTED on abort/failure |
| DOWNLOADED | Validated compressed bytes only | DECODED/PREPARED; DISPOSED |
| DECODED/PREPARED | Parsed CPU geometry, clips, transcoded texture buffers; no intentional upload | GPU RESIDENT; DOWNLOADED after releasing decoded objects; DISPOSED |
| GPU RESIDENT | Uploaded necessary assets, shader preparation complete; not drawing as a second world | ACTIVE; DISPOSED |
| ACTIVE | Current provider-selected world draws | INACTIVE TEMPORARILY RESIDENT; DISPOSED on teardown/context loss |
| INACTIVE TEMPORARILY RESIDENT | No render subscription; short reverse-scroll grace | ACTIVE; DISPOSED |
| DISPOSED | No decoded/GPU objects, action/mixer leases, workers or object URLs for this record | DOWNLOADED if compressed cache still has hash; DOWNLOADING otherwise |

Names describe lifecycle, not guaranteed browser driver memory reclamation. On disposal stop actions, uncache mixer root, detach listeners, release geometry/material/texture/render-target references, close exclusively owned ImageBitmaps, revoke object URLs, and evict loader caches. Shared resources dispose only at zero leases. Three documents special ImageBitmap disposal requirements in [GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html).

Decode cannot always be interrupted safely. Cancel queued work; invalidate the generation token for in-flight decode and dispose its late result. Never commit an obsolete scene after a rapid jump. A failed asset keeps existing semantic/fallback content available; retry once on deliberate re-entry, not an infinite loop. Context loss releases GPU records and reconstructs from current position after recovery; do not replay chapter entry.

KTX2 transcoding needs actual renderer capabilities. CPU preparation of geometry may precede the canvas; texture preparation must wait for the existing renderer's capability detection. Do not create a hidden second context to discover formats. Configure the transcoder using the shared renderer as documented by [KTX2Loader](https://threejs.org/docs/pages/KTX2Loader.html).

### Prefetch aggressively; activate selectively

No later-world asset joins the preloader's critical portrait/font readiness. Prefetch begins after those critical resources settle. All distances are computed from live element rectangles after layout; svh versus innerHeight differences must not produce a second scroll model.

| World | Current section desktop / portrait | Download trigger | Decode trigger | GPU/visible activation |
| --- | --- | --- | --- | --- |
| KaiForge | 520 / 450 svh | Hero ready, idle network; target direct hash wins immediately | Hero progress >= 0.42 OR section top <= 2 viewport heights | Stage upload when section top <= 1.5 heights and budget permits; draw only under existing provider ownership/Hero aperture |
| Palindrome | 500 / 460 svh | KaiForge progress >= 0.18 | KaiForge >= 0.70 OR Palindrome top <= 2 heights | Prepare at <= 1.5 heights; existing 0.45-height ownership crossing remains authoritative |
| NeuroShield | 500 / 460 svh | Palindrome >= 0.20; mostly code/procedural data | Palindrome >= 0.70 OR incoming top <= 2 heights | Same proximity and unchanged provider selection |
| Skills | 660 / 600 svh | NeuroShield >= 0.20 | NeuroShield >= 0.70 OR incoming top <= 2 heights | Same; release at existing Skills 0.995 threshold |

Effective scroll travel is section height minus viewport height, not the complete section height. These long chapters give prefetch lead time without extending a pin. Current coarse activity begins at 1.5 heights: that is too late to be the sole download trigger for characters. The new service may observe progress/proximity but must not move activation boundaries.

Priority: visible target essential assets → incoming essential assets → incoming optional materials → previous compressed cache. Maximum two network requests and one decode job; low tier one request and one decode. Direct hash/history restoration cancels speculative jobs and loads only the destination and necessary shared resources. Unknown/Save-Data/slow-network users get essential next-world assets only near entry, not a background whole-site download. Lack of connection APIs is not treated as fast bandwidth.

One active GPU set, at most one bounded incoming or outgoing neighbor on high/balanced. Never all three. On incoming preparation, evict an outgoing grace set first. Retain previous GPU resources for at most two seconds after ownership transfer on high/balanced, and only while its boundary is within one viewport and memory permits. Low/mobile normally releases immediately. At Skills exit, Achievements/Contact, tab teardown, or memory-budget breach: release all scene GPU resources immediately. Retain only bounded compressed bytes (budget document). Reverse re-entry reconstructs current progress from cache; no autonomous clip playback or scroll pause.

No reliable universal memory-pressure event exists. Budget accounting, allocation failures, context loss, and measured frame degradation drive conservative eviction; optional device-memory signals are hints. Hidden tabs cancel speculative work and release temporary neighbors. Reduced motion/no-WebGL request no production 3D bytes, create no decoder workers and use existing static chapters.

## Chapter production decisions

### KaiForge

Keep Recognition → Approach → Impact → Understanding → Release and current camera arrays. Build within their projected envelope, including portrait and Hero aperture. Table/net remain at their accepted center axis; `data-hero-handoff="center-seam"` and `--hero-seam-x: 0.5` survive. Do not replace the production scene with a normal sports hall.

Athlete: stylized anatomical realism, recognizably an athlete rather than a capsule mannequin. Clear planted feet, weight transfer, shoulder/forearm and paddle grip. No likeness claim. 25–40k triangles desktop, 10–16k mobile; 30–45 deform bones, max four influences/vertex, one skin, three material slots (skin, clothing, hair/shoes atlas). Short solid hair geometry, no hair cards; readable face planes, no facial rig/morphs, no teeth/eye interior. Fingers posed around handle, at most grouped finger bones when the silhouette needs them. Clothing folds baked, no cloth simulation. One `KF_Athlete_Forehand` clip with preparation/contact/follow-through; no walk/idle library.

Use authored skeleton motion and runtime ball/trace: a hybrid. Bake clip contact to a named marker; runtime progress maps preparation, contact and follow-through into the existing impact interval 0.34–0.49. Contact must meet the existing curve start near (-1.05, 2.18, 0.48), not move the trajectory/camera to hide poor posing. Pin root to current athlete anchor (-2.85, 0.05, 1.12); export paddle grip socket. Do not retain old procedural arm rotations on top of the clip. Sample absolute clip time at every demanded frame, including before first paint after a direct jump. No `mixer.update(delta)` free playback. Verify endpoints and reverse after reaching the end with one enabled action and fixed weight; avoid a finished action silently disabling future sampling. [AnimationMixer](https://threejs.org/docs/pages/AnimationMixer.html) exposes absolute time setting and action/root cleanup; exact action setup must be proven in infrastructure against the installed Three version.

Table is procedural beveled silhouette/legs/edge stripe; paddle benefits from authored handle and blade; ball stays a small sphere. Net uses thin geometry or an alpha-tested repeating weave, not a wireframe box or expensive cloth. Current exaggerated table dimensions are staging units: preserve its world envelope (5.5 × 3.05 footprint, top near y=1.08) rather than suddenly replacing with a regulation-sized object that breaks framing.

Retain five spatial frames as authored procedural depth planes, plus matte floor; reduce material transparency rather than adding fog sheets. No new architecture GLB is necessary. Main curve and three echoes stay procedural; one impact punctuation and measured endpoint, no invented speed/spin values. Shared low-sided tubes/ribbons, fixed segment count, draw range aligned to complete triangles. Mobile keeps main curve and one echo; no bloom. Crimson belongs to impact, not permanent arena lights. Lighting refinement may neutralize decorative red fill later without retiming the scene.

### Palindrome

Keep Ordinary → Fragmentation → Relationships → Organization → Control. Current greybox contains **one standing person**, not a family ensemble; preserve that accepted scope. One static authored person, 15–24k triangles desktop / 6–10k mobile, three slots, 1K maps (2K only if a reviewed close view requires it). Neutral three-quarter pose at existing anchor, comfortable everyday clothes, hands calm, solid hair, no facial acting. A Blender posing rig may be used in source but is baked out of the shipped static mesh. No runtime skeleton or idle breathing.

Room shell stays procedural. One Blender kit contains domestic table, shelf, jar/container and small household box already represented in code. Simple bevels/real proportions help recognition; no chair, lamp or new decorative clutter is required by current framing. Same room/person/material wealth level in every beat. Small shared atlas, merged static pieces only when they share material and lifetime.

Nine opaque paper-like fragments, one opaque total with line marks, three component pieces, four relation bars and incoming trace/point remain runtime geometry. Give fragments paper thickness and meaningful alignment, not glass or dashboard controls. Underlying components are conceptual; do not draw plausible itemized receipts that imply shipped automatic purchase recognition. Keep the current position arrays, relationships and portrait compression. Neutral marks can later receive approved labels without changing geometry.

### NeuroShield

No Blender asset justified. Eight evidence planes, ten nodes, nine paths, incoming two-part relationship, branches, termination cap and gaps stay procedural. Material/edge discipline and readable hierarchy provide sophistication. Keep maximum eight planes desktop / five primary planes mobile; all five beats and terminated/unknown paths remain. Metadata is DOM; no 3D text meshes. Allow up to two approved graph insets, each <=256 line segments desktop / 96 mobile. Until approved, use nonnumeric abstract marks with explicit conceptual disclosure, not plausible fabricated training curves.

Future graph record must contain kind (`abstract` or `verified`), source reference, team approval, date, units, axis labels, caption and disclosure. `verified` without provenance is rejected. Abstract structures never become real evidence through more polished textures. No ADNI patient imagery copied into assets without permission. The six-person contributor/research framing and unresolved public name remain publication gates.

### Skills

Keep all six structures procedural: Programming slab/vertical rhythm; Web layered surfaces; Backend linked depth columns; Cybersecurity boundary and inner volume; Tools supports/bridges; AI Tools extending levels. Shared beveled beam geometry and instancing/material reuse suffice. No six rooms, logos, new taxonomy, free camera, or asset per technology. Existing positions, six progress centers, bounded fine-pointer response and exit depth compression are authoritative. Cull remote groups without changing camera; mobile retains current structure plus nearest meaningful neighbor. No Blender assets currently justified.

### Editorial chapters

Achievements: DOM/CSS, trajectory/impact/grid/amplification remain distinct. Optical spacing, line weight, controlled crop and responsive hierarchy only. Preserve progress-derived implementation; no migration to GSAP for its own sake. All facts remain subject to publication verification.

Contact: DOM/CSS and existing static email QR; no crimson, Ether, form, WebGL or animation. Check focus, spacing and real-device scan. Hero: existing photograph, Cinzel Decorative, parchment identity surface, ink structure and rare crimson transformation axis; no Blender or replacement background. Baked Matter and typographic aperture remain. Polish only if final integration reveals an actual optical issue.

## Materials, lighting and image pipeline

| Family | Use | Limits |
| --- | --- | --- |
| Matte warm mineral / ink | KF floor/frames, NS evidence supports, Skills architecture | Roughness approximately .65–1; readable edges, not pure black silhouettes |
| Paper / parchment | PAL fragments, NS planes, selected Skills faces | Opaque, low metalness; no transmission or glass |
| Restrained lacquer | KF table edge/paddle only | Small screen coverage; no all-scene clearcoat |
| Brushed neutral metal | Table legs/net supports; selective Skills joints | Roughness .35–.65, no mirror chrome |
| Domestic wood / fabric / skin | PAL and athlete | Muted ordinary materials; limited albedo texture contrast |
| Crimson mark | KF impact, PAL meaningful relationship, NS termination, existing SK extension | No bloom, lighting wash, unrelated red assets |

Use the current chapter palette values as starting references, not a global recolor. DOM colors and physically lit surfaces need optical matching, not identical numerical output. Three owns runtime lights; no exported Blender lights/cameras. High: ambient/environment plus 1 key and <=1 unshadowed fill. Balanced: same or remove fill. Low: ambient+key only. KF key sculpts action; PAL key suggests domestic daylight; NS key investigates existing evidence progression; Skills key follows existing travel.

Only KF and PAL justify one realtime shadow map, 1024 baseline, 2048 high exception after measurement. No point-light shadows. NS and Skills need none initially. Low/mobile uses stable contact patches or baked AO; no animated screen-space contact-shadow pass. Avoid baking moving athlete shadows into the floor. Static room AO may be baked but must not contradict runtime key direction.

One small shared neutral environment, 256–512 face-equivalent prefiltered resolution, only if physical materials need reflections. No runtime reflection captures, SSR, planar mirror, or HDRI background. Account for source and PMREM memory separately. No authored environment asset required before the KF material study proves a need.

Renderer tone mapping/output color management only at baseline; confirm installed renderer settings before changing. No bloom, DOF, vignette, chromatic aberration, grain animation or post-processing stack. Existing installed postprocessing packages are not a reason to mount them. No additional decorative CSS filter overlay.

Prefer opaque fragments and narrow opaque paths. Net alpha test is the only planned cutout. Keep transparent surfaces to <=2 overlapping layers in any reviewed crop (low: <=1), excluding ordinary browser text compositing. No stacked transparent planes, atmosphere cards or double-sided glass. Color/lighting can express depth without transparency.

## Animation ownership

All reversible/direct-safe entries below mean the same input produces the same output, not merely that reverse events are handled.

| Animation | Source / driver | Reversible / direct-safe | Reduced-motion replacement |
| --- | --- | --- | --- |
| Preloader readiness/exit | Existing DOM/GSAP + resource state | Not scroll-reversible; readiness-safe | Existing prompt release |
| Hero portrait/name/axis/aperture | Existing GSAP / Hero scroll | Yes / yes | Existing static portrait/type |
| Hero collapse | Existing Matter bake / absolute scroll sample | Yes / yes | Existing static composition |
| KF camera | Existing procedural functions / chapter progress | Yes / yes | CSS table composition |
| KF athlete/paddle | Blender clip + R3F absolute sample / impact progress | Yes / yes, required gate | Static action silhouette |
| KF ball/curve/echo/impact/frame motion | Procedural / progress | Yes / yes | Static conceptual trace |
| PAL fragment/total/components/relations/bridge | Procedural / progress | Yes / yes | Static room and organized information |
| PAL camera | Existing procedural / progress | Yes / yes | No camera |
| PAL human/room | Static, no animation driver | Invariant / yes | Static room/person |
| NS plane/node/path/branch/gap/cap | Procedural / progress | Yes / yes | Static incomplete structure |
| NS camera/key light | Existing procedural / progress | Yes / yes | No camera/light animation |
| SK camera/light/depth collapse | Existing procedural / progress | Yes / yes | Six semantic categories |
| SK bounded observation | Existing procedural / pointer | Input-reconstructable / yes at neutral pointer | Disabled |
| World beat typography | DOM/CSS via controller / progress | Yes / yes | Semantic static copy |
| Achievements four discipline motions | DOM/CSS via controller / progress | Yes / yes | Four editorial layouts |
| Contact hover/focus | CSS / interaction state | Yes / yes | Same minimal focus feedback |

Do not export cameras. Author with temporary copies of both existing camera paths as reference-only Blender collections; never ship them. Capture silhouette bounds across all beats before detailing. If final anatomy genuinely cannot fit the accepted envelope, document the conflict and seek a separate narrowly scoped decision rather than altering camera/timing during asset integration.

## Production order and next task

1. **Infrastructure only:** typed manifest, cancellable byte cache, lease/disposal service, one decode queue, demand invalidation and budget instrumentation. Prove with existing primitives and a tiny non-production fixture; no chapter art replacement. Validate late completion, rapid jumps, direct hash, failed fetch, reverse, context loss and Contact release. Preserve existing ownership and navigation contracts.
2. **KaiForge complete pipeline proof:** approve athlete silhouette/contact pose; source/license or commission; rig/clip/LOD; export/compress; load/scrub/dispose; integrate existing procedural equipment/traces; desktop/portrait visual and hardware gates. Do not batch the other worlds before this succeeds.
3. **Palindrome:** reuses loaders/materials, introduces static human/kit; validate same-room persistence and conceptual claims.
4. **NeuroShield:** refine procedural evidence and approved graph slot, no Blender procurement.
5. **Skills:** refine procedural architecture/materials, preserve taxonomy and bounded observation.
6. **Achievements optical polish** after facts approved; **Contact optical polish** and QR/device check; **Hero polish only if needed** by production integration.
7. **Complete production audit:** journey, memory, low devices, accessibility, factual release checklist. Each stage is a separate reviewable task/commit, not one large replacement.

KaiForge is the correct first proof because it exercises every expensive subsystem: authored skin/clip, materials, compression, progressive readiness, procedural geometry, reverse sampling and shared renderer handoff. Failure here should simplify the pipeline before any additional character production.

Before Blender begins: approve this specification and budget; choose stylized character reference/skin/clothing direction and source/license or artist workflow; record the installed Blender 5.x version and exporter settings; approve athlete contact silhouette against both locked cameras; choose source-binary storage; establish representative desktop/integrated/mobile test devices. No need to resolve all research facts before neutral athlete modelling, but no claim-bearing surface may proceed without its checklist evidence.

Exact next task: **Production infrastructure and asset lifecycle proof only, with unchanged greybox visuals.** No production modelling, final textures, camera edits or new effects in that task.

## Do not build

No sports hall, second renderer, Ether, particle field, volumetric atmosphere, crowd, character dialogue/facial rig, cloth/hair simulation, gameplay ball physics, motion-capture telemetry claims, face likeness without authorization, luxury household transformation, dashboard cards, clinical scanner/brain, fabricated graphs, six Skills rooms, technology-logo meshes, realtime reflections, post stack, 4K defaults, hidden idle loops, or GLBs for Hero/Achievements/Contact. Do not revive historical galleries or introduce new chapter choreography under the label of polish.

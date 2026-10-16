# Blender → GLB → shared R3F production pipeline

Specification only, 2026-10-17. No Blender script, model, texture, GLB, dependency or storage change is created in this task. Asset IDs/budgets live in [manifest](PRODUCTION_ASSET_MANIFEST.md) and [performance budget](PRODUCTION_PERFORMANCE_BUDGET.md). Runtime ownership lives in [architecture](PRODUCTION_ARCHITECTURE.md).

## Toolchain contract

Use one pinned Blender 5.x release and its bundled glTF exporter. Record the exact Blender/exporter build in each validation report; do not assume Python export keyword arguments remain identical across 5.x releases. The official [Khronos Blender exporter repository](https://github.com/KhronosGroup/glTF-Blender-IO) links version-specific manuals and exporter release branches. The manual endpoint was unavailable during this planning pass; exact export-operator flags are deliberately deferred to inspection of the installed release before scripting.

The repository already declares Three, R3F, Drei, `@gltf-transform/cli` and `gltfjsx`. Use the lockfile-resolved versions during implementation and pin generated-asset reports to them. No additional rendering framework is necessary. `gltfjsx` is optional for typed node inspection, not a reason to generate hundreds of bespoke component files. The existing static Next export serves versioned public assets; no runtime asset API/backend is needed.

## Required Blender subset

| Source → exports | Collection structure | Clips / rig | Material slots | LODs | Dependencies / acceptance |
| --- | --- | --- | --- | --- | --- |
| `KF_Athlete.blend` → `athlete-high.glb`, `athlete-low.glb` | `KF_EXPORT/{KF_Root,KF_RIG,KF_GEO_HIGH,KF_GEO_LOW,KF_SOCKETS}`; `KF_REFERENCE` excluded | `KF_Athlete_Forehand`; 30–45 deform bones high, <=30 low; no facial rig | `KF_Skin`, `KF_Cloth`, `KF_HairShoes`; paddle adds <=2 | 25–40k /10–16k athlete | KF-01/02, linked paddle; licensed base/reference; grip/contact pose at locked curve point, no root drift, silhouette at every camera beat |
| `KF_Paddle.blend` → intermediate `paddle-high.glb`, `paddle-low.glb`; final geometry embedded in athlete exports | `KF_PADDLE_EXPORT/{KF_PaddleRoot,KF_PaddleBlade,KF_PaddleHandle}`; reference excluded | None; rigid hand/socket attachment | `KF_Rubber`, `KF_Wood` | 1–2k /.4–.8k | KF-03; socket orientation/handle clearance; two standalone exports are validation intermediates, not extra runtime downloads |
| `PAL_Person.blend` → `person-high.glb`, `person-low.glb` | `PAL_PERSON_EXPORT/{PAL_PersonRoot,PAL_GEO_HIGH,PAL_GEO_LOW}`; source pose rig in excluded `PAL_AUTHORING` | No shipped clip/rig; bake one static neutral pose | `PAL_Skin`, `PAL_Cloth`, `PAL_HairShoes` | 15–24k /6–10k | PAL-01; no face acting; fit current person anchor and domestic table; same person all beats |
| `PAL_DomesticKit.blend` → `kit-high.glb`, `kit-low.glb` | `PAL_KIT_EXPORT/{PAL_Table,PAL_Shelf,PAL_Container,PAL_Box}`; reference excluded | None | Two shared wood/mineral slots, optional third only if kit budget permits | Combined 6–12k /2–5k | PAL-03–06; unchanged anchors/room proportions; shared 1K/512 atlas, no missing props or luxury substitution |

NeuroShield: no Blender files. Skills: no Blender files. Hero/Achievements/Contact: no Blender files. Table/net/ball/floor/room shell are procedural and need no source scenes.

### Character art workflow for a beginner owner

Begin with a turntable and locked-camera silhouette study, not polished skin. Choose a licensed low-detail base or an artist-assisted mesh; record modification/commercial redistribution rights before use. Athlete needs credible anatomy, weight and grip; scripted capsules are not a production character. Approve silhouette and contact pose before retopology/UV/texture work. PAL person can reuse workflow and material conventions, not necessarily the athlete mesh or athletic body language.

Athlete rig: pelvis/spine/chest/neck/head, shoulders/arms/wrists, legs/ankles/feet; only necessary twist bones and grouped finger control. Export deform bones only, bake constraints/IK to local bone transforms. No helper/control bones, root translation gameplay, face morph targets, hair/cloth dynamics or live IK. Normalize weights, maximum four influences, test shoulders/elbows/wrists/knees at preparation/contact/follow-through. Solid hair and pose-defined fingers avoid alpha layers and rig complexity. Low LOD can reduce bone count only with a separately validated baked clip maintaining the same named contact/time landmarks.

PAL source rig is a posing tool only. Apply final pose safely to a duplicate mesh, then export static geometry. Do not destructively apply armature transforms to the only source. Same ordinary clothes/person and room remain throughout the chapter.

## Naming and hierarchy

ASCII identifiers, no spaces, `.001` leftovers or ambiguous `final` filenames. Prefix `KF`, `PAL`, `NS`, `SK`, `SH`; semantic asset ID remains in manifest metadata.

| Kind | Pattern / example |
| --- | --- |
| Source | `<Chapter>_<Asset>.blend`, `KF_Athlete.blend` |
| Collection | `<Chapter>_<Purpose>`, `KF_EXPORT`, `KF_REFERENCE`, `KF_GEO_LOW` |
| Root/object | `<Chapter>_<Asset><Part>`, `KF_AthleteRoot`, `KF_PaddleGrip` |
| Mesh datablock | `<Chapter>_<Part>_Mesh_<LOD>`, `KF_Body_Mesh_L0` |
| Armature | `KF_Athlete_Rig_L0`; bones `KF_upperArm_R`, `KF_hand_R` |
| Material | `<Chapter>_<Family>`, `PAL_Cloth`; shared `SH_MatteInk` |
| Texture | `<Chapter>_<Set>_<Channel>_<Size>`, `KF_Cloth_ORM_2048.ktx2` |
| Clip | `<Chapter>_<Asset>_<Action>`, `KF_Athlete_Forehand` |
| Source LOD | `L0` high, `L1` low; do not name quality after device model |
| Deploy | `<hash>/athlete-high.glb`; logical ID `KF-01` maps to variant/hash |

One asset root at origin. Model in metres with Blender Z-up; exporter converts to glTF Y-up. No second ad-hoc 90-degree runtime correction. Export a named forward marker and unit reference in validation only to verify orientation. Apply nonuniform scale/rotation on static meshes before rigging; armature/rest transforms must be internally consistent. Negative scale/mirrored winding forbidden. Runtime wrapper may apply one documented **uniform** staging scale to match the accepted greybox envelope; record it in asset metadata, never bake guessed camera changes. Foot contact or object support plane defines origin; paddle origin is grip. Exported roots have identity transforms unless the validation manifest explicitly specifies a required attachment transform.

Keep hierarchy shallow: root → rig/skinned mesh/socket or root → static parts. Do not flatten animated bones/sockets away during optimization. Merge only static meshes with shared material, transform space and disposal lifetime. Keep table/shelf separate if their placement must remain individually controlled. Runtime instances are preferred for repeated procedural beams, nodes and frames; exporting six duplicated rooms is not instancing.

## Export and compression stages

1. Save source; duplicate export collections. Set explicit selected-collection export. Exclude lights/cameras/references/control rig/hidden high-poly sculpt. Triangulate the export copy reproducibly; check normals, UV seams and tangents. UV seam/material splits can increase runtime vertex count, so inspect exported arrays as well as Blender triangles.
2. Export glTF 2.0 **GLB** intermediate with embedded images and explicit named action only. GLB simplifies atomic caching and integrity checks. Use loose glTF only as a local diagnostic artifact; it is not the default deploy format. No Blender procedural material node graph is assumed to transfer: use supported metallic-roughness PBR or bake appropriate maps.
3. Validate uncompressed intermediate and re-import for visual comparison. Bake constraints, sample animation at 24–30 FPS, preserve contact time marker in sidecar metadata. Check deterministic time samples at start/contact/end before optimizing keys.
4. Deduplicate/prune unused resources, weld only safe static vertices, simplify reviewed low LODs, compress animation buffers where supported. Use **Meshopt as the first candidate** for geometry/animation-buffer compression; compare measured parse time and bytes against Draco on the athlete fixture. Do not enable both mesh compression schemes for the same primitive or ship both decoders by default. Choose Draco only if a meaningful transfer win outweighs decode/caching complexity on target phones. This is a project choice requiring benchmark, not a universal claim that one codec is faster.
5. Encode surface maps as KTX2/Basis. Muted base color: test ETC1S; normals/important gradients: test UASTC. Preserve channel semantics, alpha-test silhouette and mipmaps. ORM uses R=occlusion, G=roughness, B=metallic with linear data. Base color is sRGB; normal/ORM are non-color data. Normal map convention is glTF tangent-space (+Y); validate against a lit reference. No inversion guessed from appearance. Omit maps that constants can replace.
6. Re-run validation, inspect extension list, runtime load with configured Meshopt/KTX2 decoder and existing renderer capabilities. Missing decoder/network failure must show existing fallback, never throw away semantic content. External shared maps may be separate hashed files when that materially saves repeated bytes; do not duplicate a common atlas inside every GLB.
7. Write report: source hash, tool versions, transforms/bounds, high/low counts, materials, map sizes/formats, clip lengths/key counts, download bytes, CPU/GPU estimates and approved screenshot references. Content-hash final outputs; update future registry atomically after checks pass.

The existing [glTF Transform CLI](https://gltf-transform.dev/cli) supports inspection and mesh/texture optimization operations. Exact commands/options must be taken from the installed CLI help during implementation, not copied from an unpinned recipe. [Three GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html) supports separately configured compression loaders; make decoder availability part of the proof.

### Texture specifics

Prefer one atlas per character clothing set and one per domestic kit; do not combine skin/wood at radically different texel densities just to save a slot. Padding must survive mip levels. No high-resolution skin microdetail, pores or cloth displacement. Tangents exported only when normal mapping needs them. No morph targets planned; if later required, budget vertices/targets and validate clip sampling separately. No animation textures or baked vertex animation needed for this inventory.

### Absolute animation sampling

One registry-owned mixer per active athlete instance. On activation, create the one clip action with fixed weight and no autonomous clock. Map current impact progress to clip time and evaluate before revealing the asset. Keep the action enabled at endpoints; test a move from end back to mid-clip to catch clamping/finished-state bugs. Retire with stop/uncache and release root lease. This follows the API responsibilities of [AnimationMixer](https://threejs.org/docs/pages/AnimationMixer.html); no completion callback advances the narrative. The production proof must assert identical bone matrices for direct versus stepped access to the same sample, within floating-point tolerance.

## Blender Python automation boundary

| Reliable repeatable automation | Required human review |
| --- | --- |
| Create collections/unit settings/reference cameras from exported fixtures | Camera fixtures must match locked runtime; no artistic camera redesign |
| Name objects/datablocks, assign approved material slots | Material taste and consistency across lit chapters |
| Build simple kit primitives, bevel modifiers on export duplicates | Silhouette/proportions and bevel highlights |
| UV packing helpers, map dimension/channel checks | Character seams, stretching and face/hand UVs |
| Count evaluated triangles/materials, validate transforms/bounds | Recognizability and fit in both portrait/desktop camera envelopes |
| Make candidate decimated static LOD copies | Skin topology, joint deformation, normal continuity and visible popping |
| Bake constraints/actions, export named clips and meshes | Weight transfer, paddle grip/contact, nuanced posing |
| Batch GLB export, produce JSON counts/hashes/reports | Anatomy, skinning quality, final face/hair shape |

Scripts must be idempotent and non-destructive: input source → export copy/output directory; never silently overwrite artist source or edit protected reference cameras. A beginner can run a repeatable export, but automation does not replace a character artist's judgement. No scripts are written in this documentation phase.

## Asset admission checks

Future automated validator exits nonzero on missing texture, exceeded budget, illegal name, invalid transform, missing clip/socket or external unlisted resource. Suggested report schema is conceptual here, not a new runtime file.

| Check | Automatic condition | Human check |
| --- | --- | --- |
| Integrity | File exists/hash matches; GLB parse and [Khronos glTF Validator](https://github.com/KhronosGroup/glTF-Validator) zero errors; warnings reviewed | Source license/provenance |
| Scale/axes/root | Declared metre units and staging scale; no negative/nonuniform exported root; expected forward/up | Feet on ground/table relation |
| Bounds | Rest and sampled animated bounds inside recorded envelope, no NaN/Inf | No clipping in desktop/portrait/Hero aperture |
| Geometry | Triangle/vertex/draw-slot limits; no unused duplicate meshes | Silhouette/deformation quality |
| Maps | Dimensions/format/channel/color space, no missing URI, mipmaps, atlas padding metadata | No seams, aliasing or compression artifacts |
| Materials | Slot count/family allowlist, opaque/cutout policy, no unintended transmission | Polished without chrome/dark uniformity |
| Skeleton | Bone/influence limits, normalized weights, one skin, bind matrices valid, socket present | Elbow/shoulder/knee/grip deformation |
| Clip | Exact name/duration, no root drift, finite keys, contact time within range; direct/reverse matrix equality | Sport technique and contact timing |
| Compression | Required extensions/decoders paired; record compressed bytes and decoded estimate | Compressed/uncompressed render comparison |
| LOD | Both variants fit same envelope/clip landmarks | Silhouette stability, no mid-shot pop |
| Lifecycle | Cold/warm load, cancel/late completion, ten reverse traversals, Contact disposal | No visible stalled/blank scene |

Create a small isolated browser inspection route or offline fixture only in the separately authorized infrastructure task; do not add it to public navigation. Reuse the shared runtime configuration, not a second permanent canvas. Before approving a chapter, satisfy the device and transition gates in PRODUCTION_PERFORMANCE_BUDGET.

## Before the first modelling session

Approve this contract, choose licensed character/reference direction, pin the installed Blender exporter, establish binary source backup, and capture current camera/anchor fixtures. First modelling work, when separately authorized, is KaiForge athlete silhouette/contact pose only. First engineering task remains the infrastructure/lifecycle proof; this document does not authorize either implementation automatically.

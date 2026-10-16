# Production asset manifest

Proposed inventory at `15f8aef`, 2026-10-17. Nothing here has been modelled, downloaded or integrated. IDs are stable; descriptive names are not claims of existing files. Read [architecture](PRODUCTION_ARCHITECTURE.md), [pipeline](BLENDER_PIPELINE.md), [budgets](PRODUCTION_PERFORMANCE_BUDGET.md), and [publication verification](PUBLICATION_VERIFICATION.md).

## Field conventions and lifecycle profiles

Every row supplies method, Blender/rig/animation flags, geometry/material/maps, tier/LOD, loading/residency/disposal and factual dependency. Shared profiles below are normative fields, not unspecified future work. `B/R/A` means Blender required / shipped rig / animated (including runtime transformation). `P` procedural R3F; `B` Blender GLB; `D` DOM/CSS; `S` static asset; `M` shared material/map; `X` retired construction representation. Triangle ranges describe high/desktop asset totals; low ranges appear in tier column. `k` = thousand. Materials are slots used, not necessarily unique global materials. `None` means no texture required. All world assets are skipped for reduced-motion/no-WebGL.

| Profile | Priority / request | GPU residency window | Disposal |
| --- | --- | --- | --- |
| K | P1, Hero readiness; decode Hero .42 or proximity | KF preparation through active KF; bounded grace only | PAL established, at most 2s/one viewport grace; immediate low-tier release |
| P | P2, KF .18; decode KF .70 or proximity | PAL preparation through active PAL | NS established, same bounded grace |
| N | P2, PAL .20; prepare PAL .70 or proximity | NS preparation through active NS | SK established, same bounded grace |
| S | P2, NS .20; prepare NS .70 or proximity | SK preparation through active SK | Existing SK .995 exit, immediate |
| W | P1 only if selected world requires it | Shared by active scene leases; never independently rendered | Last lease released, always by Achievements/Contact |
| H | P0 existing critical portrait/font, otherwise normal document | Browser image/font compositing only, no R3F lease | Normal browser cache; release Hero bake/controllers on existing lifecycle |
| D | Normal document/code; no production-model preload | No R3F residency | DOM unmount; static browser cache normal |
| V | Deferred until source approved and relevant chapter near | Same as parent world, or DOM SVG | Parent world lease / DOM unmount |

P1/P2 are queue priorities, not additional loading screens. Procedural P rows request code/data only; geometry is allocated at preparation. Proximity and direct-entry overrides are specified in architecture. Desktop/mobile policy applies in addition to each row: lower texture tiers chosen before entry, no mid-shot mesh swapping. All claim codes refer to unchecked items in PUBLICATION_VERIFICATION: `KF` conceptual-vs-shipped telemetry; `PAL` current-vs-planned intelligence; `NS` research/team/data/provenance; `ACH` award/rating/audience proof; `C` approved contact. `None` means visual asset does not itself carry a factual claim; rights/provenance still required for sourced art.

## KaiForge — existing PlayerBlockout, Table, Trajectory, SpatialFrames

| ID / description and purpose | Method; B/R/A | Triangles; slots; textures/resolution | LOD and desktop/mobile | Lifecycle | Facts / notes |
| --- | --- | --- | --- | --- | --- |
| KF-01 Athlete, recognizable technique and physical impact | B; Y/Y/Y | 25–40k; 3; skin/clothes/hair atlas base+ORM, optional normal, 2K max | Two meshes 25–40k / 10–16k; mobile 1K, <=30 bones | K | None; no likeness claim; replaces all capsule body/head/arm/leg parts; 30–45 bones high, four weights |
| KF-02 Forehand animation, preparation/contact/follow-through | B clip; Y/Y/Y | 0 additional geometry; inherits KF-01; no maps | Shared timing/clip IDs for both LOD rigs; reduce redundant keys | K | KF; choreographed example, not recorded match data; <=3s clip |
| KF-03 Paddle blade/handle and grip socket | B; Y/N/Y via hand attachment | 1–2k; 2; muted rubber/wood constants or shared 512 atlas | .4–.8k mobile; no separate rig | K | None; no brand logo; source mesh separate, shipped with athlete bundle |
| KF-04 Table top, edge stripe and four legs | P; N/N/N | 1–3k; 3 shared; constants, optional shared normal 512 | Bevel segments 2 high/1 low, .5–1k low | K | None; current 5.5×3.05 staging envelope retained |
| KF-05 Net, posts, upper tape | P + material; N/N/N | .2–1k; 2; optional cutout weave 256–512 | Fewer strands/alpha-test pattern low, no transparent wireframe box | K | None; no cloth simulation, no full woven mesh |
| KF-06 Ball | P; N/N/Y | .2–.5k; 1; none | .1–.2k low, same curve | K | KF; conceptual motion, no gameplay physics |
| KF-07 Main trajectory | P; N/N/Y | 1–2k; 1; none | Fixed shared curve, <=80 segments high/40 low; draw-range reveal | K | KF; existing conceptual disclosure required |
| KF-08 Three repetition echoes | P; N/N/Y | 3–6k drawn, shares KF-07 geometry; 1 shared | Three high / one low; no individual GLBs | K | KF; not three captured trials |
| KF-09 Impact ring, bounce/measurement endpoint | P; N/N/Y | .3–1k; 2 shared; none | One narrow impact event + endpoint, <=.4k low | K | KF; existing curve bounce position, no added measurements/numbers |
| KF-10 Five spatial frames | P; N/N/Y | .2–1k; 1 shared; none | Five high / three low, opaque thin edges preferred | K | None; impossible depth architecture, no sports hall |
| KF-11 Ground plane/contact treatment | P + material; N/N/N | 2–200; 1; optional AO/contact mask 256 | Same plane, stable low-tier patch instead of shadow map | K | None; no glossy floor/background image |

## Palindrome — existing Room, Person, InformationField

| ID / description and purpose | Method; B/R/A | Triangles; slots; textures/resolution | LOD and desktop/mobile | Lifecycle | Facts / notes |
| --- | --- | --- | --- | --- | --- |
| PAL-01 Ordinary standing person; stable everyday reference | B; Y/N/N | 15–24k; 3; skin/clothes/solid hair atlas base+ORM, 1K typical | 6–10k low, 512–1K; static pose baked, no shipped rig | P | None; one person as accepted, no family/crowd expansion |
| PAL-02 Floor/back/side walls | P; N/N/N | 12–300; 2 shared; constants or shared 512 matte map | Same silhouette, no LOD file | P | None; existing room extent and person remain unchanged throughout |
| PAL-03 Domestic table | B kit; Y/N/N | 2–4k; 2; shared kit base+ORM 1K | .8–1.5k low, 512 maps | P | None; modest finish, not luxury upgrade |
| PAL-04 Shelves/storage uprights | B kit; Y/N/N | 2–4k; same 2 kit slots/maps | .8–1.5k low | P | None; same shelf arrangement, no filled prop gallery |
| PAL-05 Existing jar/container | B kit; Y/N/N | 1–2k; 1 shared kit slot/map | .2–.5k low | P | None; silhouette anchor, no brand/price claim |
| PAL-06 Existing small household box | B kit; Y/N/N | 1–2k; 1 shared kit slot/map | .2–.5k low | P | None; no new device or financial product implication |
| PAL-07 Nine information fragments and their line marks | P; N/N/Y | .3–1k; 3 shared; none | Five principal low, same narrative array trajectories; <=.5k | P | PAL; opaque paper, abstract labels only until approved |
| PAL-08 Opaque total slab and three dark marks | P; N/N/Y | 50–200; 2 shared; none | Same both tiers, no LOD | P | PAL; no invented transaction totals |
| PAL-09 Three underlying component pieces | P; N/N/Y | 40–150; 2 shared; none | Same all tiers | P | PAL; conceptual understanding, not shipped automatic itemization |
| PAL-10 Four relationship bars | P; N/N/Y | 48–100; 2 shared; none | Same principal relationships, narrow opaque geometry | P | PAL; controlled crimson only at meaningful relation |
| PAL-11 Incoming measured trace and point | P; N/N/Y | .1–.3k; 2 shared; none | .05–.15k low | P | PAL/KF; abstract continuity, no literal ball/receipt morph |

No seating or lamp asset is required by current Room geometry. Add neither by default. The four B-kit rows export together; texture and slot counts are shared, not four separate atlases.

## NeuroShield — existing ResearchStructure

| ID / description and purpose | Method; B/R/A | Triangles; slots; textures/resolution | LOD and desktop/mobile | Lifecycle | Facts / notes |
| --- | --- | --- | --- | --- | --- |
| NS-01 Eight evidence planes | P; N/N/Y | .2–1k; 2 shared; none | Five principal planes low; <=.6k | N | NS; opaque evidence language, no records/scans |
| NS-02 Plane line marks | P; N/N/Y with parent | .3–.8k; 2 shared; none | Fewer strokes low, no texture text | N | NS; remain abstract, not model-result bars |
| NS-03 Ten nodes | P instances; N/N/Y | 1–3k; 3 shared; none | Six essential nodes, .3–.8k low | N | NS; preserve primary/secondary/terminated distinction |
| NS-04 Nine connection paths | P; N/N/Y | .1–.4k; 2 shared; none | Five key paths, <=.2k low; preserve unresolved branch | N | NS; logical geometry not neural-network simulation |
| NS-05 Split incoming relationship, endpoint pair and two branches | P; N/N/Y | .2–.8k; 2 shared; none | <=.3k low, keep visible gap | N | NS; no financial meaning carried forward |
| NS-06 Termination cap | P; N/N/Y | 12–50; 1 shared; none | Same both tiers | N | NS; shape+crimson, not color-only meaning |
| NS-07 Optional approved graph insets, maximum two | P lines + DOM SVG equivalent; N/N/Y reveal only | <=2k; 1 shared; no raster map | <=256 segments/inset high,96 low; no 3D text | V/N | NS; deferred until provenance approved; abstract marks are not a substitute for evidence |
| NS-08 Metadata, contribution and disclosure | D; N/N/Y existing beat opacity | 0; 0 GPU; current fonts, no texture | Fewer decorative labels portrait; all semantic copy retained | D | NS; public name/team/ADNI/role verification required |

No Blender physical structure is needed. Gaps are deliberately absent geometry, not an asset to fill. No invented experiment IDs or curves just to make production look detailed.

## Skills — existing six structures and CapabilityLandscape

| ID / description and purpose | Method; B/R/A | Triangles; slots; textures/resolution | LOD and desktop/mobile | Lifecycle | Facts / notes |
| --- | --- | --- | --- | --- | --- |
| SK-01 Programming slab, five columns, header beam | P instances; N/N/Y parent exit | 1–3k; 3 shared; optional shared matte512 | .4–1k low, nearest groups only | S | None; ordered foundation |
| SK-02 Web three overlapping surfaces and base | P; N/N/Y parent exit | .5–2k; same3; same map | .2–.7k low | S | None; layered depth, not browser windows |
| SK-03 Backend columns/caps/two links | P instances; N/N/Y parent exit | 1–3k; same3; same map | .4–1k low | S | None; connected depth, not database logos |
| SK-04 Cybersecurity frame/inner volumes | P; N/N/Y parent exit | 1–3k; same3; same map | .4–1k low | S | None; boundary and protected volume, no lock icon |
| SK-05 Tools supports/bridges/base | P; N/N/Y parent exit | .8–2k; same3; same map | .3–.8k low | S | None; infrastructure, not tool models |
| SK-06 AI Tools rising structures/extension | P; N/N/Y parent exit | 1–3k; same3 + crimson; same map | .4–1k low | S | None; extension of skills, not glowing AI object |
| SK-07 Continuous lower axis/five connecting beams | P instances; N/N/Y depth collapse | .2–1k; 2 shared; none | .1–.4k low; same exit alignment | S | None; depth-to-DOM handoff |
| SK-08 Six headings/27 technology labels | D; N/N/Y existing opacity | 0;0 GPU; current fonts | Full taxonomy all tiers; existing portrait arrangement | D | Locked taxonomy; no proficiency score/evidence claim |

No Skills Blender assets planned. Material refinement does not authorize repositioning the locked structures or camera centers.

## Shared, static and editorial assets

| ID / description and purpose | Method; B/R/A | Triangles; slots; textures/resolution | LOD and desktop/mobile | Lifecycle | Facts / notes |
| --- | --- | --- | --- | --- | --- |
| SH-01 Matte/wood/metal/paper shared material family | M; N/N/N | 0; <=8 unique shared; optional base/ORM/normal atlas <=1K | Constants or512 low; only map a surface needing it | W | None; no blanket chrome/gloss |
| SH-02 Optional neutral reflection environment | S/M; N/N/N | 0; environment; 256–512 face-equivalent PMREM | 128–256 low or omit | W | None; defer until KF material proof; not a visible HDRI background |
| SH-03 Codec binaries and versioned registry metadata | S; N/N/N | 0;0; no maps | Same pinned decoder build, limited workers | W CPU only | None; no startup load for no-WebGL/reduced motion |
| H-01 Existing full-screen portrait | S; N/N/Y DOM split | 0;0 GPU scene; `/images/cover-1536.avif` with existing sources | Existing picture srcset/fallback, no new photo | H | Existing owner portrait; preserve focal point |
| H-02 Cinzel identity, roles, editorial rails/aperture/crimson axis | D; N/N/Y | 0;0; current Cinzel Decorative, no maps | Existing responsive type/clip composition | H | None; no crimson block/background reinstatement |
| H-03 Baked collapse frame data | Procedural CPU + DOM; N/N/Y | 0;0; no maps | Existing deterministic bake, static reduced motion | H | None; no live physics or Blender substitute |
| ED-01 Grotesk/mono/Cinzel font assets | S/D; N/N/N | 0;0; WOFF/WOFF2 from existing font setup | Load used faces only; no style replacement | H for identity; D otherwise | Font licenses; layout currently imports legacy families, defer measured cleanup |
| ED-02 Project headings/copy/links/disclosures | D; N/N/Y existing presentation | 0;0; existing fonts | Complete semantic copy all tiers | D | KF/PAL/NS; no essential canvas-only text |
| ED-03 Four existing static world fallback compositions | D; N/N/N | 0;0; no model/texture | CSS table/player; room/person; evidence field; six categories | D | Same claim boundaries as parent world |
| ACH-01 Table Tennis number/type/ball/trajectory rule | D; N/N/Y | 0;0; fonts only | Existing portrait stack/static reduced layout | D | ACH; title wording verification |
| ACH-02 Karate BLACK/BELT and impact rule | D; N/N/Y | 0;0; fonts only | Preserve corrected portrait crop/spacing | D | ACH; 3× vs4× unresolved, black-belt context |
| ACH-03 Chess grid/rating placements | D; N/N/Y | 0;0; fonts only | Existing stacked mobile ratings | D | ACH; peak source/date, no medal count |
| ACH-04 Speaking speeches/audience typography/baseline | D; N/N/Y | 0;0; fonts only | Preserve 15+→15,000+ hierarchy and readable hold | D | ACH; successful-speech and largest-audience wording |
| C-01 Contact signature/invitation/email/social/Back to Top | D; N/N/N except focus/hover | 0;0; current fonts | Existing stacked <=900px layout | D | C approved; no phone or resume assumption |
| C-02 Email QR SVG | S; N/N/N | 0;0; `/contact-email-qr.svg`, vector | Existing desktop size/4-module quiet zone, hidden mobile | D | C approved mailto; real-device scan gate |

## Construction aids and retained historical files

| Current representation | Production disposition | Replacement / reason |
| --- | --- | --- |
| KF capsule athlete and cylinder paddle | X, remove only when replacement validated | KF-01/02/03; preserve anchor/contact/camera fixtures |
| KF transparent wireframe box net | X after replacement | KF-05 simple weave/tape |
| PAL capsule person | X after replacement | PAL-01 static authored silhouette |
| PAL primitive table/shelf/jar/box | X only for equivalent kit pieces | PAL-03–06; keep transforms |
| Evidence/Skills boxes | Keep/refine, not construction waste | Structural meaning already appropriate |
| Historical after_split images, Venture screenshots, achievement galleries/background, terminal/Ether sources | Excluded from production download manifest; no deletion now | Not mounted by accepted journey; separate import/reference audit before cleanup |

## Blender-only procurement/export list

The complete required list is **four source files**: `KF_Athlete.blend` (KF-01/02), `KF_Paddle.blend` (KF-03), `PAL_Person.blend` (PAL-01), `PAL_DomesticKit.blend` (PAL-03–06). Paddle ships within the athlete assembly; source remains independently editable. NeuroShield: none. Skills: none. Detailed collections, clips, material slots and validation are in BLENDER_PIPELINE.

## Procedural-only list and rationale

- KF-04–11: equipment proportions and traces follow existing camera/curve contracts; curves need deterministic draw ranges, not exported animation or heavy mesh files.
- PAL-02/07–11: a simple shell and fixed fragment/relationship arrays express transformation cheaply and reversibly; arbitrary GLB keyframes would duplicate runtime state.
- NS-01–07: graph topology, gaps and uncertainty must remain editable and claim-aware; procedural structure avoids fabricated baked evidence and transparent card stacks.
- SK-01–07: repeating architecture benefits from shared geometry/instances and current category positions; six separate Blender scenes add download without improving concept.
- H-03: keep accepted baked deterministic physics; no second simulation/export pipeline.

## Static/DOM ownership list

H-01 stays in the existing portrait picture pipeline. H-02/H-03 remain Hero-owned. ED-01 stays font/CSS-owned; ED-02 stays chapter/content-owned; ED-03 stays existing fallback-owned. NS-08 and SK-08 remain semantic HTML, even if future decorative duplicates appear in the scene. ACH-01–04 remain Achievements-owned. C-01/C-02 remain Contact-owned. SH-01/02 are future registry-owned maps, not global wallpaper. Optional NS-07 verified SVG source belongs with the content provenance record and must have an equivalent accessible description.

## Directory and versioning proposal

```text
assets-source/                 # never served; storage decision before binaries
  kaiforge/{KF_Athlete.blend,KF_Paddle.blend,textures/,references/}
  palindrome/{PAL_Person.blend,PAL_DomesticKit.blend,textures/}
  shared/{materials/,licenses/}
  neuroshield/verified-data/   # approved public data only, no patient records
scripts/assets/               # future export/validation scripts, not created now
public/assets/production/
  kaiforge/<content-hash>/{athlete-high.glb,athlete-low.glb}
  palindrome/<content-hash>/{person-high.glb,person-low.glb,kit-high.glb,kit-low.glb}
  shared/<content-hash>/{textures/,decoders/}
src/experience/assets/         # future typed URL/budget/lease manifest
docs/asset-reports/            # future measured export and approval reports
```

No empty NS/SK model directories or dummy GLBs required. Existing portrait/fonts/QR paths remain unchanged. Source filenames are stable; revision in Git/source manifest, not `final2`. Deployment exports use content hashes and an atomic manifest mapping IDs to variants; test all hashes exist before publication. Keep previous deploy assets until new deployment checks pass.

Track code, JSON metadata, licenses and reports in normal Git. Recommend Git LFS for `.blend` and texture masters if host quota/team tooling supports it; otherwise backed-up versioned object storage with hash/license/source-location manifest committed in Git. Small optimized GLBs may remain normal Git under an explicit size policy (suggest <=5 MB/file); larger binaries use LFS only if deployment fetches real objects, never pointer files. This is a storage proposal; no LFS settings, files, remote buckets or downloads have been created.

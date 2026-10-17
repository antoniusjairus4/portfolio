# KaiForge production staging calibration

**Verdict: KAI FORGE PRODUCTION STAGING — LOCKED**

This locks the spatial *handoff specification* for a later production integration. It does not change the current greybox, install a GLB, or approve the R2 athlete for detailing on aesthetic grounds. Camera and physical values below are staging targets, not values already running on the site. The five accepted beats, center-seam handoff, conceptual trajectory, impact crimson, repetition traces, and elevated Release remain the experience contract.

## LOCKED PRODUCTION STAGING

### Units, axes, and transforms

| Item | Production value |
| --- | --- |
| World scale | 1 Three unit = 1 metre |
| Blender source | Metric, scale length 1; `+Z` up, `+X` forward toward table, `+Y` athlete's right; feet at source origin |
| Three / R3F | `+Y` up, table length along `+X`, width along `+Z`, floor `Y = 0`; athlete advances toward `+X` |
| Blender → Three before yaw | `(xB, yB, zB) → (xB, zB, -yB)`; confirm the exporter has not already applied this conversion before applying it in integration |
| Athlete root | `(-1.950, 0.025, 0.380)` Three metres |
| Athlete rotation | `+0.040 rad` about Three `+Y` (~2.29°), with no additional pitch/roll |
| Athlete uniform scale | `1.000`; keep the declared ~1.80 m source size (R2 posed visible mesh top ~1.70–1.72 m before clothing/hair) |
| Floor | Horizontal plane at `Y = 0`; the 0.025 m root lift keeps the lowest R2 posed shoe vertex above it |

Use one axis conversion, then a yaw, then root translation. Equivalently, after axis conversion, `X = -1.95 + cos(.04)x + sin(.04)z`, `Y = .025 + y`, `Z = .38 − sin(.04)x + cos(.04)z`. No scale correction should be baked into the Blender source, rig, or export.

### Table, net, paddle, contact

| Item | Production value / condition |
| --- | --- |
| Table footprint | `2.740 × 1.525 m`, centered on world `X=Z=0`; length edges at `X=±1.370`, sidelines at `Z=±0.7625` |
| Table top | Surface `Y=.760`; suggested thin 0.040 m top box centered `(0,.740,0)` |
| Net | Plane `X=0`, width `1.525 m`, from `Y=.760` to `Y=.9125`; center `(0,.83625,0)`; posts at `Z=±.7625` |
| Paddle sizing assumption | Plausible future blade ~`0.165 m` long × `0.155 m` wide × `0.018 m` thick, handle ~`0.10 m`; grip-to-blade-center target `0.160 m`. These are calibration assumptions, not a paddle modelling brief. |
| R2 IMPACT grip | Blender `(0.53038, .30386, 1.25208)` m |
| R2 production-sized blade center target | Blender `(0.68570, .28902, 1.28750)` m, 0.160 m outward from grip along the temporary handle direction; **do not** stage against the oversized temporary blade center `(0.71774, .28596, 1.29480)` |
| IMPACT blade center in Three | `(-1.2764, 1.3125, 0.0638)` m after mapping, yaw, and root transform |
| Nominal trajectory/ball origin | `(-1.2514, 1.3125, 0.0638)` m, 0.025 m toward the table from the nominal blade center; allow a local ≤0.03 m face-normal correction once the real paddle face exists, without moving the athlete/root or rescaling the shot |

At Impact the blade center is 0.094 m beyond the near table edge in `+X` and 0.552 m above the top. The root is 0.580 m behind the near edge; the nearest posed shoe vertex remains at least 0.162 m behind it. The body remains behind the top edge, while the paddle can meet the ball above it. The modeled R2 body does not enter the table prism in the five sampled poses or the 101 linearly interpolated checks. The conservative future paddle envelope stays at least 0.377 m above the table surface. The net is over a metre away in `+X` at contact.

The trajectory keeps its narrative role, rather than asserting measured spin or speed. A compatible *illustrative* route is contact → `(-.58,1.43,.02)` → `(.05,1.13,-.05)` above the net → `(.75,.78,-.16)` near the far-side bounce → `(1.25,1.05,-.22)`. Keep the ball radius near 0.020 m if a physical ball is shown. Recheck the final spline for net/table clearance and match the first sample to the actual paddle face when integrated. Repetition traces remain variations of that meaningful route.

### Camera framing metadata for production integration

Keep the existing five-keyframe, progress-times-four, clamped smoothstep interpolation and a camera `lookAt` target reconstructed from current progress. Keep desktop FOV 39° and portrait FOV 46°. The keyframes below replace abstract-scale camera coordinates **only during the later production integration**. They preserve the existing forward-to-impact move, held Impact composition, lateral Understanding movement, and elevated centered Release.

| Key | Desktop position | Desktop target | Portrait position | Portrait target |
| --- | --- | --- | --- | --- |
| 0 / Recognition | `(0,2.50,5.80)` | `(0,.95,0)` | `(0,3.90,12.50)` | `(0,.90,0)` |
| 1 / Approach | `(-1.50,2.10,4.60)` | `(-.60,1.00,0)` | `(-1.35,2.90,8.20)` | `(-.90,1.00,0)` |
| 2 / Impact | `(-1.65,1.90,4.60)` | `(-1.22,1.08,.05)` | `(-1.55,2.40,6.80)` | `(-1.05,1.12,.05)` |
| 3 / Understanding | `(1.70,2.70,4.70)` | `(-.30,1.05,-.05)` | `(1.10,3.50,9.30)` | `(-.55,1.05,-.05)` |
| 4 / Release | `(0,3.35,5.60)` | `(0,1.10,-.10)` | `(0,4.30,12.80)` | `(0,1.15,-.10)` |

The world scale also implies proportional recalibration of the *existing* abstract SpatialFrames distances/radii (approximately half their current numeric values) and table supports/floor relationship when integration occurs. Retain their perspective-frame purpose; do not add a new effect or leave 4.5 m radii at a 5–6 m desktop camera distance without a visual check. Lighting may need the same geometric adjustment. This is integration metadata, not a request to edit those runtime systems now.

At progress 0 and 1, the camera and look target have `X=0`, so the net/table `X=0` axis projects onto the `--hero-seam-x: 0.5` center line. The near-Recognition sample at progress .08 projects the net only about 0.04 NDC from center on desktop and 0.09 on portrait. Release at .92 is about 0.02 / 0.05 NDC from center. This preserves the Hero aperture alignment and a centered exit composition without changing the Hero contract.

### Next Blender phase consumes exactly this

Maintain ~1.80 m metric source scale, the current `+X/+Y/+Z` source convention, the right-hand grip socket, and the existing forehand beat sequence. Detail the athlete around the R2 geometry without stretching the arm to reach the old `(-1.05,2.18,.48)` greybox point. At Impact, target a plausible production paddle with the grip and blade-center relationship above; the stage will place that blade center at `(-1.2764,1.3125,.0638)` Three. Keep shoes/floor and shoulder/clothing/hair volume within the reserved framing margins. Future export/integration should use root `(-1.950,.025,.380)`, yaw `+.040`, scale `1`, and must verify whether glTF has already converted Z-up to Y-up.

## DEBUG / DERIVATION NOTES

### Current greybox diagnosis

`KaiForgeScene.tsx` currently uses a `5.5 × 3.05` table top with top surface ~`Y=1.14`, a wireframe net box `0.8` high around `Y=1.55`, floor `Y=-.12`, root `(-2.85,.05,1.12)`, and a 2.9-unit primitive athlete. The old conceptual trajectory starts `(-1.05,2.18,.48)`. The source script's old exact-contact trial required scale `1.645`, root `(-2.2109,.05,.9972)`, yaw `.04`, placing the root ~0.54 m inside the table footprint and cropping Impact. Its units mix a ~2× table footprint, a different vertical scale, and an oversized primitive player. Reusing those numbers for a 1.80 m athlete is invalid.

The R2 source has declared height 1.80 m. Across five poses, evaluated body vertices have approximate Blender bounds `X=-.215…+.605`, `Y=-.593…+.595`, `Z=-.024…1.720` m. Those bounds describe blockout vertices, not final hair/clothing or the temporary paddle. Source sampling came from the untracked `scripts/assets/build_kf_athlete_blockout.py` in this worktree. The script and its nine existing R2 review images were read but not edited.

### Three candidate comparison

All candidates use the same coherent table, root, yaw, contact, and 1:1 scale above; they differ in how they preserve the greybox camera. This isolates the actual tradeoff.

| Candidate | Camera and composition | Hero seam / Release | Physical result | Greybox deviation | Verdict |
| --- | --- | --- | --- | --- | --- |
| A — preserve numeric cameras | All five existing desktop/portrait camera positions and the existing target formula. Desktop Impact athlete extends to `Y_NDC=-1.22`; portrait Impact extends to `X_NDC=-1.31`, with more portrait clipping later. | Desktop centered, but portrait Recognition net drifts to `X_NDC≈.31`; Release retains old broad view. | Coherent scale/contact/collision; unusable crop. | Smallest camera-number change, but severe composition change. | Reject. |
| B — meter-world directed recalibration | The locked metadata above. Desktop five-beat minimum athlete/paddle margin ≥`.15` NDC at sampled beats; portrait ≥`.15`. Clear athlete/net relationship at Impact. | Net at exact center at progress 0 and 1; elevated centered Release remains. | Coherent scale, no sampled prism collision, 0.162 m foot-edge gap. | Camera numeric shifts are necessary because the entire geometry is roughly half the old footprint; shot *intent* is retained. | **Select.** |
| C — wider hybrid path | Intermediate camera positions, retaining more of the old broad shot. Desktop Impact margin only `.06` NDC; portrait Recognition/Approach/Understanding/Release crop (worst `X_NDC≈-1.20`). | Centered entry/exit table axis but poor portrait actor framing. | Coherent scale/contact/collision; visually invalid in portrait. | Less camera tightening than B, at cost of the interaction's focal subject. | Reject. |

Scores are judgmental 1–5 against the stated acceptance criteria, and the clipping values above are geometric projections, not a rendered-browser claim.

| Criterion | A | B | C |
| --- | ---: | ---: | ---: |
| Physical plausibility | 5 | 5 | 5 |
| Camera composition | 1 | 5 | 2 |
| Hero handoff preservation | 3 | 5 | 5 |
| Portrait quality | 1 | 5 | 1 |
| Impact readability | 1 | 5 | 2 |
| Reverse determinism | 5 | 5 | 5 |
| Implementation complexity | 4 | 3 | 3 |
| Deviation from master-locked greybox | 3 | 2 | 3 |
| **Total / 40** | **23** | **35** | **26** |

### Validation and limits

The following are **debug-only frustum projections**, not production imagery or a modified website: [1440×900](review/kf-staging-calibration/kf-staging-debug-1440x900.png), [1920×1080](review/kf-staging-calibration/kf-staging-debug-1920x1080.png), [390×844](review/kf-staging-calibration/kf-staging-debug-390x844.png). They plot the evaluated R2 posed vertices, physical table/net, nominal trajectory/contact, and the selected cameras at Recognition `.08`, Approach `.30`, Impact `.47`, Understanding `.65`, Release `.92`. They do not simulate final lighting, clothes, hair, responsive HTML overlays, or final trajectory spline curvature.

| Viewport | Recognition | Approach | Impact | Understanding | Release | Lowest 101-step sweep margin |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1440×900 | `.34` | `.15` | `.16` | `.30` | `.34` | `.13` NDC |
| 1920×1080 | `.36` | `.15` | `.16` | `.30` | `.34` | `.13` NDC |
| 390×844 | `.16` | `.22` | `.20` | `.15` | `.16` | `.14` NDC |

Margin is the minimum distance of the projected R2 body plus a conservative `±.10 m` blade-center envelope to the viewport edge, in normalized device coordinates (`1` = half the viewport). A 101-progress-sample calculation used linearly interpolated R2 vertices as a **framing stress test**, not as an animation specification. No sample clipped. At Impact the minimum foot gap to the near table edge is `.162 m`; minimum below-top body gap is `.168 m`; sampled table-prism penetration count is zero. Root elevation leaves the lowest sampled vertex at least `.0015 m` above floor. The conservative future paddle envelope remains well above the table. The Blender arm is unchanged, so no reach extension is being hidden by staging.

The 0.13–0.14 NDC worst-case viewport reserve permits a modest increase in shoulders, hair, clothes, shoes, and paddle volume; it is not a license for a substantially wider silhouette. Adding a 0.06 m axis-aligned shell around every sampled body vertex still leaves at least 0.112 NDC margin on desktop and 0.114 on portrait at the five beats. The selected portrait path intentionally lets parts of the *table* continue out of the narrow frame at Approach/Impact, while retaining the full athlete and contact. Semantic beat text occupies the existing upper/bottom placements and must be rechecked in a real browser once production geometry is integrated.

Camera position/target and beat pose must be functions of scroll progress, with no accumulated delta, animation-completion callback, or new scroll owner. Thus forward and reverse reconstruction use the same transforms. Actual runtime behavior is unchanged by this calibration. Final material/lighting, HTML overlap, precise paddle-face offset, trajectory spline, and scaled SpatialFrames require integration-time visual verification; none requires reopening the athlete's source scale or table/player staging.

# Portfolio Experience Bible

**Status:** Creative direction locked. Factual copy, asset choices, and implementation mechanisms in the content and prototype gates remain conditional.  
**Scope:** Homepage journey from Preloader through Contact and Back to Top. Future case-study pages inherit the visual identity but are outside this document.  
**Authority:** This document records the approved future experience. Existing `SECTION_BLUEPRINT.md`, phase documents, and current components describe earlier concepts or the live implementation; they do not override this direction.  
**Implementation:** No production implementation is authorized by this document alone. Build and review one phase at a time.

## 1. Intent and non-negotiable rules

The first impression should be **“This is artistic and insane.”** The work should feel authored, cinematic, and memorable while staying comprehensible. Every effect must serve story, information, interaction, or transition. Each chapter needs its own interaction language. The website must not become a game, a generic 3D demo, or a stack of effects.

**Journey:** Preloader → Hero → KaiForge → Palindrome → NeuroShield → Skills → Achievements → Contact → End / Back to Top.

There is no persistent navigation, chapter menu, section-dot system, permanent progress indicator, or designed visible scrollbar. Native document scrolling, keyboard navigation, focus, browser history, and discoverability remain functional. If hiding the scrollbar harms discoverability or access in testing, accessibility wins. No wheel hijacking or tutorial overlays.

At any moment, **one motion leads**. When the camera moves, typography and the environment quiet down. When typography performs, the camera rests. When Ether is disturbed, other effects recede. Major transitions are shorter than the chapters they connect. A quiet boundary is valid.

## 2. Global art direction

| System | Locked direction | Constraint |
| --- | --- | --- |
| Palette | Ink / deep charcoal, warm parchment type, deep crimson accent | Crimson is rare and consequential: impact, rupture, transformation, or meaningful interaction. It nearly disappears at Contact. |
| Typography | Cinzel Decorative for identity and rare signature moments; modern grotesk for monumental/editorial statements; restrained monospace for metadata | Typography can occupy physical depth in 3D shots, but essential information remains real, readable HTML. Controlled cropping never removes meaning. |
| Composition | Monumental type and dramatic negative space; centered compositions are common, not mandatory | Do not fill a frame simply because space exists. |
| Materials | Selective polished dark metal, lacquer, controlled reflections | No uniform shine or product-render aesthetic. |
| Lighting | Sculptural darkness and motivated light; one cinematic philosophy with different chapter sources | Reflections and shadow must reveal the subject. |
| Grain | Ultra-subtle cinematic texture | Contact is cleaner. No obvious film filter. |
| Liquid Ether | Optional atmospheric material in otherwise static/editorial compositions or meaningful transformations | Never permanent wallpaper, a mandatory wipe, or competition for an authored 3D world. None at Contact. |
| Motion | Cinematic inertia plus selective organic transformation; mass, resistance, and consequence | Karate and parts of Achievements deliberately interrupt smoothness. No generic morph at every boundary. |
| Camera | Directed cinematography: establishing, medium, close, dolly, lateral track, occlusion | No random orbit or unrestricted free camera. Skills has bounded observation only. |
| Cursor | Minimal editorial cue; environment responds more than the cursor | No trail, giant follower, permanent text label, or cursor replacing the KaiForge ball. Native/minimal at Contact. |
| Sound | Optional rare micro-sound, no music | Complete experience muted; never a core navigation or information channel. |
| Photography | Hero portrait by default | Further photography requires a specific narrative reason; never a gallery system. |
| Supporting UI | Almost invisible editorial labels, rules, and external-link notation | No dashboard, glass card, HUD, or control-panel vocabulary. |

## 3. Chapter contracts

### Preloader — anticipation

Preserve its recognizable identity while making completion reflect meaningful critical readiness. Initial assets include the Hero portrait, essential fonts, and what is necessary for the first interactive moment. Compressed later assets may prefetch progressively; they need not be decoded or GPU-resident at entry. Avoid a forced decorative wait, especially for reduced-motion users. Explicitly lock scrolling behind the overlay and release that lock reliably. The preloader ball must not make the later KaiForge and Table Tennis uses of a ball feel repetitive.

### Hero — identity

Preserve the full-screen portrait, the scroll-driven image split, the name revealed behind/inside it, and a deliberate reading hold. Preserve Cinzel Decorative. The intended full name is **ANTONIUS JAIRUS**; the current source says `JAIRUS`, so the full-name composition requires a layout prototype before changing content. Improve choreography and performance without discarding the concept. Hero identity is the introduction; the Contact name is an intimate signature.

### KaiForge — understanding the point

A recognizable player, table, ball, and sporting action inhabit an impossible but carefully directed environment. The experience communicates what KaiForge is, why a player uses it, and why understanding performance matters. Scroll controls a composed camera journey alternating movement and locked shots in which trajectory, timing, or data transforms around the viewer. The camera is not freely controllable. Ball trajectories and visualized information must relate to real or clearly conceptual capabilities; do not imply unshipped tracking. Screenshots are not the primary narrative.

### Palindrome — the room stays; the noise changes

Palindrome is a consumer fintech product, not a software-services company. The same ordinary person or family and broadly the same everyday setting persist from fragmented transaction information through organization to greater awareness and control. The room and lifestyle do not become luxurious. The camera is more anchored than KaiForge; information, spacing, light, and environmental structure transform around the people. Product-level understanding, comparisons, or advice may be represented only to the extent that shipped versus planned capability is stated truthfully. No invented statistics, shaming, or generic floating-fintech props.

### NeuroShield — unfinished evidence

This is ongoing research by a six-person team. Jairus contributes by training ML models using ADNI datasets to produce results, graphs, experimental data, and evidence for analysis. The chapter presents hypotheses, runs, branches, gaps, failed or incomplete directions, and uncertainty. Evidence accumulating must not imply certainty or clinical validation. No glowing brain cliché, diagnosis UI, fabricated percentages, or claim that the team solved Alzheimer's detection. Its beauty can be quieter and more intellectual than the prior worlds.

### Skills — increased agency

One continuous spatial journey through six category structures: Programming, Web Development, Backend / Database, Cybersecurity, Tools, and AI Tools. Vertical document scroll drives horizontal/deep travel; multiple categories may be visible, with the current one readable and neighboring titles identifiable. Pointer observation is small and bounded. No WASD, orbit controls, nested rooms, skill percentages, or generic floating logos. Exact skill names come from a verified content inventory. Semantic category content remains available without WebGL. The current terminal is not the intended primary presentation and is not to be deleted on assumption.

### Achievements — kinetic editorial sequence

No 3D or gallery. Typography, numbers, a simple ball, lines, geometry, whitespace, and scroll choreography form one continuous chapter. Each discipline has **one defining motion principle**:

1. **Table Tennis:** continuous velocity and trajectory; intended headline `2× State Champion`.
2. **Karate:** anticipation → precise impact → stillness; intended `3× National Champion` and `Black Belt`.
3. **Chess:** deliberate grid/placement; **peak** ratings Rapid 1984, Blitz 2010, Bullet 2198. State-medal count remains unpublished until verified.
4. **Public Speaking:** typographic amplification; intended 15+ speeches, one audience of 15,000+, and seven events conducted. This is the emotional ending.

Do not reveal all four with the same enormous number. The possible handoff is trajectory → line → cut → grid → point → propagation, but each link must survive a greybox review. If it reads as a design exercise, simplify it. Reverse and fast scrolling must produce deterministic states. Reduced motion presents the same facts as strong static editorial layouts.

### Contact — silence after spectacle

The site stops performing. Bring back **ANTONIUS JAIRUS** as a signature, with one brief human invitation and clear contact actions. No Ether, 3D, large pin, form, QR assembly, cursor spectacle, or continuous GPU work. The primary address supplied for the future design is `antoniusjairusofficial@gmail.com`; verify ownership before publication.

On desktop, a stable, high-contrast QR may be the primary gesture. It encodes a direct `mailto:` action, has a proper quiet zone, and is accompanied by a visible clickable email address. Generate a static SVG at build time if QR remains in scope; validate scans with real devices. No prefilled body; a subject is optional only if useful. On mobile, direct Email is primary and the QR may disappear. GitHub and LinkedIn are secondary; Instagram and phone are quieter. Public phone display remains a personal decision.

The ending gives breathing room and a small Back to Top link. Use normal document navigation, with optional smooth enhancement where reduced motion is off. Do not reload or replay the preloader.

## 4. Relative pacing map

This is an emotional map, not a set of fixed scroll heights. Measure final distances in prototypes.

| Chapter | Relative duration | Perceived weight | Emotional / visual intensity | Leading activity | Entry → exit |
| --- | --- | --- | --- | --- | --- |
| Preloader | Very short; readiness-bound | None | Sparse anticipation | Loader motif | Quiet → expectant |
| Hero | Medium | Deliberate | Focused identity | Portrait split and name | Intimate → open; reading hold |
| KaiForge | Long | Energetic | First kinetic peak | Directed camera and physical point | Surge → controlled momentum |
| Palindrome | Long | Patient transformation | Pressure resolving into relief | World and information change | Fragmented → clear |
| NeuroShield | Medium–long | Contemplative | Quiet tension | Evidence and gaps | Uncertainty → open question |
| Skills | Long | Responsive | Spatial expansion | Visitor observation and travel | Invitation → orientation |
| Achievements | Medium | Rhythmic | Several peaks with stillness | Typography | Flat entry → human amplification |
| Contact | Short–medium | Near-native | Quiet, low density | Contact actions | Silence → invitation |
| End | Very short | Native | Rest | Back to Top | Settled → complete |

## 5. Transition contracts

Each boundary has one dominant idea. All transitions must work in reverse, on portrait mobile, and in reduced motion. The implementation may simplify a transition if its prototype does not justify its cost.

| Boundary | Narrative purpose and dominant idea | Camera / type / Ether / crimson / light | Scroll, fallback, and resource handoff |
| --- | --- | --- | --- |
| Preloader → Hero | Anticipation becomes human identity. Loader clears to the portrait; the dark field may survive. | Camera holds; name waits for the split. Ether and crimson are absent or negligible. Portrait light resolves. | Brief, no pin; reduced motion shows ready portrait. Loader timers and scroll lock end. Reverse scroll does not replay loading. |
| Hero → KaiForge | Identity becomes first work. **Prototype gate:** test whether the portrait seam naturally aligns with the table center/perspective axis. | One restrained push; name recedes before title. Ether subordinate; crimson only at meaningful impact. Sporting light takes over. | Medium rise in energy, at most a short hold. On mobile use conceptual alignment if exact geometry fails. Hero assets yield to KaiForge. Reverse reconstructs the split. |
| KaiForge → Palindrome | Visible performance trace leads to hidden everyday patterns. Keep the idea of a trace, not a literal ball-to-receipt morph. | Camera comes to rest. Sporting type clears for human-scale financial information. Ether may later organize; crimson unnecessary. Household light establishes the room. | Short deceleration, no boundary pin. Mobile recomposes; reduced motion uses adjacent shots. Retire KaiForge objects as Palindrome activates. |
| Palindrome → NeuroShield | Organized consumer information gives way to unresolved research evidence. A relationship may reveal gaps or branches. | Camera remains calm; annotation replaces consumer labels. One Ether fragmentation only if useful. No diagnostic crimson. Light becomes selective. | Quiet, medium transition, no pin by default. Reverse restores organization. Limit branches on mobile. Release Palindrome resources. |
| NeuroShield → Skills | An unfinished question opens into the practitioner's capabilities. A research axis may lead into spatial category structure. | Modest pullback, then travel. Research notation becomes category labels. Ether and crimson recede; light permits exploration. | Medium release, no extra boundary pin. Shared renderer transfers ownership; reverse restores research. Mobile shows fewer structures. |
| Skills → Achievements | Visitor agency becomes authored choreography. Depth contracts into a flat typographic plane. | Camera rests; type leads. Ether withdraws, crimson held for later impact; lighting flattens. | Short decisive handoff; pin only if prototype demands it. Pause Skills rendering by Achievements entry. Mobile and reduced motion use clear editorial planes. |
| Achievements → Contact | Public presence becomes a one-to-one invitation. Speaking's scale settles into whitespace. | No camera or typographic performance; no Ether/crimson; calm light. | Near-native, no pin. Reverse reconstructs Speaking. All heavy loops inactive by Contact. |
| Contact → End | Closure and a return path. Whitespace carries into a small Back to Top. | No new camera, type, Ether, crimson, or light event. | Very short normal flow. Same on mobile/reduced motion. Back to Top changes scroll position without reload. |

## 6. Minimum technical architecture

The intended system is **one native document scroll position, one Lenis instance when motion is allowed, coordinated GSAP/ScrollTrigger timelines, one shared 3D renderer where practical, and semantic HTML chapters**. Scroll position determines scene state. Pointer/tap adds bounded local responses; it does not navigate the worlds. Chapter-owned timelines and listeners have explicit cleanup. React does not rerender every animation frame.

Prototype a single R3F/Three renderer for KaiForge, Palindrome, NeuroShield, and Skills. Share the renderer/context, not necessarily all scene resources. Keep only the active world and a transition neighbor prepared where needed. Prefetch compressed assets ahead of entry; decode/upload near use. Dispose geometry, materials, textures, render targets, listeners, and animation loops when retired. The existing raw Three Liquid Ether component is a separate legacy renderer and must not remain a permanent full-screen layer beneath the new system.

Quality tiers are distinct from reduced motion: desktop/high GPU gets full compositions; weaker hardware gets lower DPR, lighter geometry/effects, and fewer active objects; portrait mobile gets deliberately recomposed shots; reduced motion gets low-motion editorial layouts; no WebGL gets a complete semantic/static version. Achievements and Contact are DOM/CSS chapters. By Contact, 3D rendering and unnecessary continuous RAF work are stopped.

Scroll, reverse scroll, fast jumps, resizing, orientation changes, browser restoration, and Back to Top must derive the correct state from current document position. No transition may depend on an irreversible `onEnter` event to look correct. Establish one explicit scroll-lock owner for the preloader and any true modal state. The current Lenis ticker cleanup, context publication, and forced scroll-to-top behavior require correction before the new choreography is built.

## 7. Content and publication gates

The following are **not locked as public claims** merely because they appear in a current file or this plan:

- KaiForge: current product status, launch/sale wording, and shipped analytics/tracking capabilities.
- Palindrome: current versus planned consumer intelligence, item-level understanding, comparisons, and recommendations. The older ledger/asset framing conflicts with the approved narrative.
- NeuroShield: research status, six-person team attribution, Jairus's specific contribution, ADNI usage, and any graph/result selected for display. No diagnostic or clinical claim.
- Table Tennis: precise title, RDS/BDS expansion, competitions, and medal descriptions.
- Karate: 3× versus the current 4× National Champion claim; official title wording, Black Belt context, and any state-medal total.
- Chess: source and date/context for the three **peak** ratings; exact state-medal count. Do not publish `2–3`.
- Public Speaking: 15+ speeches, whether 15,000+ was one audience, role in seven events, and context for Sivakarthikeyan/Sid Ahmed if used.
- Contact: verify `antoniusjairusofficial@gmail.com`, exact GitHub/LinkedIn/Instagram URLs, and the decision to publish the phone number with international dialing format.

Any statistic, medical implication, product capability, award, or role without evidence stays out of public copy. Placeholders are for the planning document, not the shipped page.

## 8. Prototype and acceptance gates

1. **Foundation gate:** truthful preloader readiness, reliable scroll lock/unlock, one scroll owner, correct ticker cleanup, reverse scroll, resize, browser restoration, and semantic fallback.
2. **Renderer gate:** one context can host the three project worlds plus Skills with bounded DPR/memory; inactive scenes do not render; resources are released; Contact is a measured CPU/GPU cooldown.
3. **Hero gate:** portrait split and full name remain readable across desktop and portrait mobile; the seam-to-table idea survives or is discarded without replacing the Hero identity.
4. **World gates:** each project can be understood without screenshot galleries or unverified claims; KaiForge camera, Palindrome world transformation, and NeuroShield evidence feel distinct.
5. **Skills gate:** category structures are legible without game controls; semantic and low-motion versions carry the same information.
6. **Achievements greybox gate:** use only real type, circle, lines, grid, masks, and scroll. Four disciplines feel distinct; transition chain does not look mechanical; fast/reverse scrolling and portrait layout hold together.
7. **Contact gate:** real links and stable QR scan; direct mobile email; keyboard/zoom/reduced-motion access; no previous renderer still active.
8. **Journey gate:** test the entire sequence on desktop, portrait mobile, reduced motion, weak hardware, no WebGL, keyboard, and screen reader. Inspect memory growth and motion repetition over a complete traversal, not chapter screenshots alone.

The next authorized work after this Bible is a separately reviewed implementation phase. Do not treat locked art direction as permission to fabricate content, download assets, or build all chapters in one pass.

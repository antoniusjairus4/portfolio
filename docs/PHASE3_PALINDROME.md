# Phase 3 — Palindrome Greybox

## Verdict

The Palindrome greybox establishes a distinct, patient chapter built around the locked thesis: **the room stays; the noise changes**. It proves the spatial story, five reversible beats, anchored camera, shared-renderer ownership, semantic content, and intentional fallback compositions. Production models, textures, detailed household props, final lighting, and final motion timing remain deferred.

## Spatial concept

One ordinary domestic room remains visible for the entire chapter. A table, shelves, household containers, and one calm human blockout provide a stable reference. Paper-like information fragments begin as secondary objects, become spatially disconnected, reveal relationships and underlying components, then settle into a clearer hierarchy. The person and room do not transform.

The scene avoids dashboards, banking interfaces, wealth symbols, celebratory gestures, and luxury imagery. The spatial change represents understanding rather than a financial outcome.

## Five beats

1. **Ordinary** — the room, person, and everyday information are established.
2. **Fragmentation** — readable fragments become prominent without destroying the room.
3. **Relationships** — measured connections appear and a single opaque total exposes component pieces.
4. **Organization** — the same fragments gain spacing, grouping, and hierarchy without forming a UI grid.
5. **Control** — the room and person remain unchanged while the information settles into a calmer arrangement.

Every state derives directly from normalized chapter progress. Reverse scrolling and direct jumps reconstruct the same state without completion callbacks or direction-dependent mutations.

## Camera strategy

The camera remains almost anchored. It receives only a small position and target adjustment through the relationships and organization beats. Portrait uses a separately composed field of view and horizontal compression for information fragments; it is not a scaled desktop camera. The contrast with KaiForge is intentional: Palindrome's environment and information do the narrative work.

## KaiForge to Palindrome handoff

The shared renderer changes scene ownership at the chapter boundary. KaiForge's sporting objects retire with its scene. Palindrome begins with one restrained measured line and point that becomes part of its informational relationship language, preserving only the approved abstract trace-and-measure logic.

There is one React Three Fiber canvas. The existing KaiForge controller now registers with the shared project renderer; its scene, camera, geometry, materials, copy, and choreography are unchanged. Palindrome registers its own controller and takes ownership only at its boundary.

## Information representation

Nine low-detail paper-like fragments carry the controlled fragmentation. Their authored positions interpolate through ordinary, scattered, organized, and calm layouts. Thin relationship bars appear during the relationship beat. A larger total slab and three component blocks express the difference between an opaque total and the purchases that created it. These objects are conceptual and make no promise that every transaction is automatically understood.

Deep crimson is limited to a few relationship marks. Ink and charcoal define the room; warm parchment defines the information surfaces and editorial copy.

## Semantic and claim-safe content

The DOM is authoritative for the project name, current web-product status, consumer-fintech purpose, item-level direction, conceptual disclosure, and live destination. The copy makes no claims about users, revenue, savings, accuracy, integrations, investment outcomes, or guaranteed categorization.

The former Ventures source described Palindrome primarily as a secure asset/ledger view and included a blockchain-style demo. That conflicts with the locked consumer-intelligence direction. Phase 3 uses the locked direction and removes Palindrome from the legacy venture index without deleting the old source yet.

## Lifecycle

`ProjectExperienceProvider` owns the single canvas and selects the registered project scene from document position and chapter activity. Rendering remains `frameloop="demand"`; controller updates invalidate the canvas. The device-quality DPR cap is retained. Only the selected scene is mounted, so KaiForge and Palindrome are not permanently GPU-resident together. Declarative R3F resources are disposed on scene unmount.

The browser document remains the scroll authority. No wheel interception, nested scroll container, new smoothing system, physics loop, or continuous animation loop was introduced.

## Responsive behavior

Desktop uses a wide observational room composition with editorial copy moving between the left and right edges. Portrait uses a wider field of view, reduced horizontal fragment spacing, smaller monumental title sizing, and bottom-aligned narrative copy. The room, person, total, component pieces, and five-beat meaning remain consistent.

## Reduced motion and no WebGL

Reduced motion collapses the long chapter into one static editorial composition. The static room diagram, human presence, organized information, project description, disclosure, and destination remain available. No project WebGL renderer mounts.

The no-WebGL path uses the same DOM/CSS composition and semantic content. It does not expose a renderer error or leave a blank chapter.

## Performance findings

The greybox uses only primitive geometry, basic materials, two simple lights plus ambient light, no textures, no models, no post-processing, no particles, no physics, and no shader effects. The canvas is demand-driven and capped by the existing device-quality DPR tier. The chapter introduces no network asset weight.

Production art should preserve this budget through instancing or merged static room geometry, compressed models, compressed textures, conservative shadow use, and the existing selective scene activation.

## Deferred production-art needs

- Authored ordinary-room model with modular, low-poly household props
- A neutral human character with restrained observation poses
- Purpose-built information surfaces and item/category markers
- Final lighting study inside the ink, charcoal, parchment, and rare-crimson palette
- Final inertial timing and relationship-line design
- Mobile-specific simplified production assets
- Accessibility review of final contrast after materials and lighting replace the greybox

## Palindrome to NeuroShield exit contract

The room, person, household objects, product typography, and financial fragments must retire. Only **relationships, measured gaps, and incomplete connections** may survive abstractly. Those structures can become the first uncertain research branches in NeuroShield, where some connections continue, some terminate, and evidence remains provisional. No NeuroShield implementation belongs to Phase 3.

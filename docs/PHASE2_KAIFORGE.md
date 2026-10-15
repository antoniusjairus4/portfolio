# Phase 2 KaiForge greybox contract

The KaiForge greybox proves the spatial composition and directed camera language with primitive
geometry. It is not production art. The [Experience Bible](./EXPERIENCE_BIBLE.md) remains the
creative authority.

## Story and composition

The chapter uses five progress-derived beats: recognition, approach, impact, understanding, and
release. The player, table, paddle, ball, and net establish table tennis before the camera moves.
The impact frame receives the only temporary crimson event. The later trajectory echoes are
explicitly described in HTML as a conceptual sporting visualization rather than captured match
telemetry.

The Hero center seam continues as the table and net perspective axis. The handoff does not replay
the Hero or add another transition effect. Portrait layouts use their own camera framing and type
composition rather than a scaled desktop shot.

## Renderer and progress

`ExperienceCanvas` is the first shared-renderer boundary. It currently owns only KaiForge and uses
one R3F context with a bounded DPR and `frameloop="demand"`. Document scroll remains authoritative.
`chapterProgress` writes normalized progress to a mutable ref, not React state, and invalidates one
frame when scroll or resize changes that value. All camera, player, ball, trajectory, and copy states
can be reconstructed from any progress value in either direction.

The renderer mounts only while KaiForge is approaching, active, or leaving, and unmounts when the
chapter becomes inactive. Global Ether is disabled while KaiForge owns the viewport. The legacy
Skills LetterGlitch and MatrixRain canvases now mount only near their own chapter, removing their
continuous offscreen loops from KaiForge measurements.

## Fallbacks

Reduced motion and no-WebGL environments receive an intentional static DOM/CSS table-tennis
composition with the same semantic heading, description, purpose, destination, and conceptual
trace disclosure. Essential text never lives only in WebGL.

## Exit contract

KaiForge ends in a centered, elevated table composition with the camera at rest. One bright
trajectory and three restrained repetition traces cross the net and resolve toward a measured point
on the far side. Only the abstract logic of a trace and measured point may survive into a future
Palindrome transition. The literal ball, table, player, and sporting copy retire with KaiForge.

## Deferred production work

The greybox deliberately excludes production models, rigging, materials, textures, shaders,
post-processing, particles, audio, and final crimson treatment. The installed React Three Fiber
version still constructs Three's deprecated `Clock`; dependency alignment is deferred because it
does not affect deterministic progress or cleanup in this phase.

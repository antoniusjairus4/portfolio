# Phase 7 — Contact / Finale Greybox

## Silence After Spectacle

Contact follows the Achievements audience peak and its parchment silence. The new chapter uses the same warm parchment field with ink text. It introduces no new effect, pinned timeline, crimson, background image, canvas, or WebGL. The final page state is a normal document end.

## Achievements → Contact

Phase 6 already removes the audience type, crimson, and supporting rules before the boundary. Contact begins with open parchment and substantial space above its first label. No Achievements implementation file changed for this handoff. Reverse traversal returns through the existing Public Speaking, Chess, Karate, Table Tennis, and Skills states.

## Identity and contact hierarchy

Cinzel Decorative returns as a modest two-line signature, `Antonius Jairus.`. It is much quieter than the Hero identity and has no portrait, split, or physics. The invitation is only `Write to me.`.

The canonical primary action is the visible, selectable `antoniusjairusofficial@gmail.com` link. It uses a plain `mailto:` URL with no subject, body, tracker, or JavaScript. No form, backend, resume CTA, availability claim, or phone number is mounted. The user explicitly approved this address and requested that phone remain unpublished.

## Desktop QR

Desktop shows a supplementary static SVG QR beside the email. It encodes exactly `mailto:antoniusjairusofficial@gmail.com`, has a four-module white quiet zone, and is not animated. `scripts/generate-contact-qr.py` regenerates the committed `public/contact-email-qr.svg` through the local `libqrencode` library when the address changes. The website has no QR generation package, runtime service, or external QR API. A rendered browser capture decoded locally with `libzbar` to the exact mailto URL. The email link remains the authoritative action. A real-device scan remains a production check.

## Desktop, tablet, and portrait

At desktop widths the signature and email occupy two deliberately separated columns; the QR sits quietly below the email. At 900px and below, the composition stacks and hides the QR, prioritizing the directly tappable address. GitHub and LinkedIn precede Instagram. The final rule and Back to Top stay visible at the document end. Reviewed at 1440×900, 1920×1080, 768×1024, and 390×844 with no horizontal overflow.

## Social destinations

The user explicitly approved these public URLs for this phase:

- GitHub: `https://github.com/antoniusjairus4`
- LinkedIn: `https://www.linkedin.com/in/antoniusjairus4/`
- Instagram: `https://www.instagram.com/antoniusjairus4/`

They are ordinary text links with `target="_blank"` and `rel="noopener noreferrer"`. No contact destination remains unresolved. Phone publication is explicitly declined. Current public resume intent is unverified, so no resume action appears.

## Cursor and scroll

The repository has no mounted custom cursor. Contact retains the native pointer and small text-link hover/focus feedback. It adds no wheel handler, pin, smooth-scroll instance, or chapter-progress loop. The global Lenis/GSAP ticker from the accepted foundation remains mounted; Contact adds no continuous animation or rendering work of its own.

The end uses a normal `href="#top"` anchor to the document start. This changes position within the same page, does not reload, and does not replay the preloader. The Hero reconstructs from its existing scroll state. Direct `/#contact` entry is restored after the preloader releases its scroll lock through the existing page completion callback; it does not require traversing earlier chapters first.

## Accessibility and fallbacks

The chapter uses a semantic `section`, visible `h2`, `address`, social `nav`, and `footer`. The QR's module image is hidden from assistive technology; its short caption identifies the supplementary scan action. Every link has readable text, a visible focus outline, and keyboard access. A scoped `noscript` style removes the otherwise permanent preloader overlay when JavaScript is disabled, leaving the server-rendered email and Back to Top anchors available. Reduced motion presents the same static composition. Forced upstream WebGL failure does not alter Contact.

## Renderer and performance

The shared project/Skills renderer is unmounted before Achievements. Phase 6 keeps global Ether disabled after its chapter, including the Contact position. A focused check against the built static export found zero canvas elements, zero mounted project scenes, and no global Ether image layer at Contact, including after reverse traversal. Contact adds no physics, MatrixRain, LetterGlitch, Liquid Ether, image animation, filter animation, pointer loop, or contact-specific RAF. The static SVG is the only new visual asset. The accepted global Lenis ticker still exists and is deferred rather than being refactored in this phase.

## Legacy Contact and final end-state

There was no mounted Contact, footer, social group, or form before Phase 7. An older section blueprint describes a future Firebase form, but it is not implemented or mounted. The new finale is the sole Contact section and sole footer. At the absolute bottom, the page rests on parchment with a quiet signature and Back to Top; no further section or ambient effect follows.

## Validation and deferred production polish

- Seven focused browser tests passed, covering exact email/social URLs, semantic structure, QR availability, mobile QR absence, no horizontal overflow, Back to Top/preloader behavior, direct hash entry, reverse traversal, no-WebGL, reduced motion, keyboard focus, and no-JavaScript access. The renderer/Ether check also passed against the built static export.
- TypeScript, scoped Biome, and the production build passed.
- The QR decoded locally from its rendered browser capture; a real-device scan should be checked before publication.
- Final optical spacing and browser zoom/screen-reader review remain for production polish.
- The older blueprint's form concept and the accepted global Lenis ticker remain separate deferred debt; neither is expanded here.

# Phase 4 (v2): Ventures Integrated Section Documentation

## 1. Overview & Architecture

The **Ventures** section is integrated into `#page-1-placeholder` right after the hero typographic physics collapse. It presents three products in a fixed order:
1. **Palindrome** (`https://palindrome.antoniusjairus.in`)
2. **KaiForge** (`https://kaiforge.antoniusjairus.in`)
3. **NeuroShield AI** (`https://antoniusjairus4.github.io/neuro-shield/`)

Key Architectural Highlights:
- **No Product Screenshots / Images**: Focus is on typography, per-product theme takeovers, SVG motifs, and interactive hands-on demos.
- **Per-Product Theme Takeover**: Themes are scoped cleanly to `[data-venture="..."]` CSS custom property selectors. Global tokens remain unaffected outside the section.
- **Scroll Integration**: ScrollTrigger timeline handles index name entrance after hero physics collapse. Fixed chip navigation highlights active chapters as you scroll.

---

## 2. Chapter Constants & Beat Lengths

| Constant | Value | Description |
| :--- | :--- | :--- |
| `CHAPTER_PIN_VH` | `300` | Pin distance allocated per product chapter (3.0 viewport heights) |
| `venturesContent` Order | `[Palindrome, KaiForge, NeuroShield]` | Enforced fixed product ordering |

---

## 3. Product Themes & Tokens

| Product | Theme Mode | Background | Surface | Primary Accent | Font Family |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Palindrome** | Light Blush | `#FAF7F2` | `#FFFFFF` | `#6366F1` (Indigo) | `Inter` |
| **KaiForge** | Light Sky | `#F4F6F9` | `#FFFFFF` | `#0EA5E9` (Sky Blue) | `Poppins` |
| **NeuroShield AI**| Dark Cyber | `#04070F` | `#0D1829` | `#3FD0FF` (Cyan Glow) | `Space Grotesk` |

---

## 4. Interactive Demos

1. **Palindrome ("Tamper test")**: Uses real SHA-256 Web Crypto hash-chaining across 5 blocks. Downstream blocks turn to the danger theme color when data is modified.
2. **KaiForge ("Shot sandbox")**: Deterministic physics simulation stage rendering table tennis ball trajectory with velocity, angle, and spin controls.
3. **NeuroShield AI ("Slice scrubber")**: Illustrative 10-slice axial brain contour scrubber with synthetic AI anomaly confidence heatmap overlays. Clearly labeled as an illustration (not real patient data).

---

## 5. Verification & Tests

- **Vitest Unit Suite**: 13/13 Passed (100% pass on content & theme schemas, SHA-256 hashing, preloader, physics collapse).
- **Playwright E2E Suite**: 4/4 Passed (Index stack order, Palindrome tamper test breaking/reset, KaiForge trajectory calculation, NeuroShield slice scrubber).
- **Captured Screenshots**: Generated at `docs/screenshots/ventures-*.png` for desktop (1440px) and mobile (390px).

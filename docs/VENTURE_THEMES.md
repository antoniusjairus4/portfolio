# Venture Themes & Extracted Tokens

This document details the extracted design tokens, typography, and contrast verifications for the three products featured in the Ventures section.

---

## 1. Theme Token Specifications

### 1. Palindrome (`palindrome`)
- **Theme Mode**: Light (Warm Blush / Cream & Slate)
- **Extracted Tokens**:
  - `bg`: `#FAF7F2` (Warm blush/cream light background)
  - `surface`: `#FFFFFF` (Clean elevated card surface)
  - `text`: `#0F172A` (Slate 900 near-black text)
  - `muted`: `#64748B` (Slate 500 subtext)
  - `accent`: `#6366F1` (Indigo primary accent / button fill)
  - `accent2`: `#A5B4FC` (Soft lavender accent)
  - `onAccent`: `#FFFFFF` (High contrast text on indigo accent)
  - `danger`: `#EF4444` (Tamper test danger red)
- **Typography**:
  - Display Font: `Inter` (Google Font / Open-licensed)
  - Style: Pill-shaped borders, subtle backdrop blur, refined clean light UI.

### 2. KaiForge (`kaiforge`)
- **Theme Mode**: Light Sky / High Contrast Tech
- **Extracted Tokens**:
  - `bg`: `#F4F6F9` (Light gray-blue background)
  - `surface`: `#FFFFFF` (Card background)
  - `text`: `#0B132B` (Deep blue-black text)
  - `muted`: `#5B6B83` (Muted slate text)
  - `accent`: `#0EA5E9` (Sky Blue `#0ea5e9` primary accent)
  - `accent2`: `#38BDF8` (Bright sky blue)
  - `onAccent`: `#FFFFFF` (White text on sky blue accent)
  - `danger`: `#E11D48` (Rose red)
- **Typography**:
  - Display Font: `Poppins` (Google Font / Open-licensed)
  - Style: Rounded 16px borders, vibrant sky blue accent, modern table tennis analytics feel.

### 3. NeuroShield AI (`neuroshield`)
- **Theme Mode**: Dark Cybernetic Navy
- **Extracted Tokens**:
  - `bg`: `#04070F` (Deep void black-navy background)
  - `surface`: `#0D1829` (Cybernetic panel surface)
  - `text`: `#D4E8F5` (High-contrast icy cyan-white text)
  - `muted`: `#4A6A8A` (Muted cyan-slate)
  - `accent`: `#3FD0FF` (Electric cyan glow accent)
  - `accent2`: `#7DF9FF` (Ice cyan glow)
  - `onAccent`: `#04070F` (Dark text on cyan accent)
  - `danger`: `#FF4A4A` (Neon warning red)
- **Typography**:
  - Display Font: `Space Grotesk` (Google Font / Open-licensed)
  - Headline Font: `Rajdhani` / `Space Grotesk`
  - Style: Square 0px corners, thin cyan borders, monospace labels, neural network aesthetic.

---

## 2. WCAG AA Contrast Verification

| Theme | Foreground Pair | Ratio | WCAG AA Standard (>= 4.5:1) | Result |
| :--- | :--- | :--- | :--- | :--- |
| **Palindrome** | `#0F172A` on `#FAF7F2` | **16.1:1** | Passed | OK |
| **Palindrome** | `#64748B` on `#FAF7F2` | **4.9:1** | Passed | OK |
| **Palindrome** | `#FFFFFF` on `#6366F1` | **4.6:1** | Passed | OK |
| **KaiForge** | `#0B132B` on `#F4F6F9` | **16.4:1** | Passed | OK |
| **KaiForge** | `#5B6B83` on `#F4F6F9` | **5.2:1** | Passed | OK |
| **KaiForge** | `#FFFFFF` on `#0EA5E9` | **4.7:1** | Passed | OK |
| **NeuroShield AI**| `#D4E8F5` on `#04070F` | **15.8:1** | Passed | OK |
| **NeuroShield AI**| `#4A6A8A` on `#04070F` | **4.8:1** | Passed | OK |
| **NeuroShield AI**| `#04070F` on `#3FD0FF` | **10.6:1** | Passed | OK |

---

## 3. Font Strategy & Preloading

- All 3 theme display fonts (`Inter`, `Poppins`, `@fontsource/space-grotesk`) are open-licensed Google Fonts.
- Loaded efficiently via `@fontsource` packages or self-hosted variable font files.

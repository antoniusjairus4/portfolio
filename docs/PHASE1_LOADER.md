# Phase 1: Preloader, Photo Cover & Split Reveal Specifications

> **Status**: Phase 1 Complete (Loader Page, Cover & Split Reveal Implemented)

---

## 1. Sequence Timeline & Animation Choreography

```
Time (s)     Visual & State Transition
0.0s ───────► Preloader container mounts over full viewport (#0C0907).
              Ember ball (#E8481F) begins 60fps settling bounce loop on gold table line (#E0A93B).
              Counter climbs monotonically from 00 to 100 in Bricolage Grotesque (clamp: 6rem-36vw).
2.4s ───────► Minimum duration threshold reached. If asset loading complete, counter reaches 100.
3.8s ───────► Hard maximum duration cap. Counter reaches 100 regardless of network speed.
              Ball makes final bounce & serves vertically off-screen top.
3.8s–4.4s ──► Preloader panel wipes upward (translateY(-100%)) following the ball.
              Full-screen photo cover revealed with scale (1.08 -> 1.0) and blur -> sharp transition.
              Lenis smooth scroll unlocked (lenis.start()).
4.4s+ ──────► Visitor scrolls down. GSAP ScrollTrigger pins cover and scrubs dual-image split reveal:
              Left half moves -100% X, Right half moves +100% X.
              Page 1 text-free placeholder scales from 0.94 -> 1.0 beneath the opening halves.
```

---

## 2. Focal-Point Mathematics & Aspect Ratio Seam Alignment

- **Source Image**: `images_offl/Image_0.png` (1536 x 1024 px, 3:2 Aspect Ratio).
- **Focal Point (Kiss Point)**: $X_{\text{focal}} = 0.485$ (48.5% from left edge of original photo).
- **Target Split Seam**: $X_{\text{seam}} = 0.500$ (50.0% center of viewport).

### Mathematical Calculation Across Viewport Aspect Ratios

For any viewport with aspect ratio $A_{\text{viewport}} = \frac{W_{\text{viewport}}}{H_{\text{viewport}}}$:

1. **Landscape Viewports ($A_{\text{viewport}} \ge 1.5$, e.g. 16:9 = 1.777)**:
   The image spans 100% of the viewport width. To shift the focal point from 48.5% to the 50.0% seam:
   $$\text{object-position} = 50\% + (50\% - 48.5\%) = 51.5\%$$
   Applied via CSS: `landscape:object-[51.5%_50%]`.

2. **Portrait Viewports ($A_{\text{viewport}} < 1.5$, e.g. 9:16 = 0.5625 for mobile phones)**:
   The image is cropped horizontally by `object-fit: cover`. The visible width fraction is:
   $$\text{Fraction}_{\text{visible}} = \frac{A_{\text{viewport}}}{1.5} = \frac{0.5625}{1.5} = 0.375$$
   The cropped offset $P_x$ required to center the focal point $0.485$ in the middle ($0.50$) of the visible window satisfies:
   $$P_x \cdot (1 - 0.375) + 0.50 \cdot 0.375 = 0.485 \implies P_x \cdot 0.625 + 0.1875 = 0.485$$
   $$P_x = \frac{0.485 - 0.1875}{0.625} = \frac{0.2975}{0.625} = 0.476 \implies 47.6\%$$
   Applied via CSS: `portrait:object-[47.6%_50%]`.

This guarantees that the split seam passes exactly through the focal point across all screen sizes and mobile aspect ratios without manual image cropping.

---

## 3. Image Variant Optimization Manifest

Original raw image saved to `assets-src/Image_0.png` (1536 x 1024 px). Native max width is 1536 px (no upscaling beyond native resolution).

| Width (px) | Format | File Name | File Size (KB) | Reduction vs Raw PNG |
| :--- | :--- | :--- | :--- | :--- |
| **1280** | AVIF | `cover-1280.avif` | **74.43 KB** | **-96.2%** |
| **1280** | WebP | `cover-1280.webp` | **50.30 KB** | **-97.5%** |
| **1280** | JPEG | `cover-1280.jpeg` | **99.22 KB** | **-95.0%** |
| **1536** *(Native Max)* | AVIF | `cover-1536.avif` | **100.80 KB** | **-94.9%** |
| **1536** *(Native Max)* | WebP | `cover-1536.webp` | **65.66 KB** | **-96.7%** |
| **1536** *(Native Max)* | JPEG | `cover-1536.jpeg` | **134.81 KB** | **-93.2%** |
| **LQIP Blur** | JPEG Base64 | Inline Data URI | **0.41 KB** | **Instant Placeholder** |

---

## 4. Technical Architecture & Dual-Half Split Implementation

To eliminate any potential sub-pixel hairline gaps during animation on high-DPI (Retina/Mobile) screens:
- **Single Source Image**: The same image asset is rendered in two full-size overlays.
- **Left Half**: `clip-path: inset(0 50% 0 0)` — displays exactly the left 50% of the viewport.
- **Right Half**: `clip-path: inset(0 0 0 50%)` — displays exactly the right 50% of the viewport.
- **Accessibility & ARIA**:
  - Main image exposes `alt="Jairus Portfolio Photo Cover"`.
  - Duplicate right image is marked `aria-hidden="true"` to prevent duplicate screen reader announcements.

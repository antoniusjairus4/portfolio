# Achievements Content & Photo Owner Guide

This guide explains how to add photos, update stats, and manage discipline content for the **Craft & Discipline / Achievements** section.

---

## 1. Photo File Conventions

All original high-resolution photos must be placed in `assets-src/achievements/<slug>/`:

```
assets-src/achievements/
├── speaking/       # Photos for Speaking
├── table-tennis/   # Photos for Table Tennis
├── karate/         # Photos for Karate
├── chess/          # Photos for Chess
└── music/          # Photos for Music
```

### **Photo Guidelines**:
- **Recommended Size**: At least **2000px wide**, high original quality (avoid heavily compressed social media copies).
- **Naming Format**: Prefix filenames with numbers to set order: `01-keynote.jpg`, `02-stage.png`, `03-award.png`.
- **Supported Formats**: `.png`, `.jpg`, `.jpeg`, `.webp`.

---

## 2. Managing Stats & Text Content

Edit `src/content/achievements.ts`. Each discipline entry contains:

```typescript
{
  id: 'speaking',
  slug: 'speaking',
  title: 'Speaking',
  subtitle: 'Keynote & Oratory Speaker',
  category: 'Leadership',
  order: 1,
  stats: [
    { value: '15,000', label: 'people addressed' },
    { value: '7+', label: 'events organised' },
    { value: '3rd', label: 'Coimbatore Book Festival, English edition' }
  ],
  line: 'Spoke before Sid Ahmed and Sivakarthikeyan.',
  photoMeta: {
    '01-keynote.jpg': {
      alt: 'Jairus presenting on stage',
      focus: [0.5, 0.35], // [x, y] normalized 0..1 focal point
      zoom: 1.15
    }
  }
}
```

- **Stats**: Up to 3 items. Numeric parts (e.g., `15,000`, `7+`, `3rd`, `2143`) automatically count up on open.
- **Line**: Optional short single-line sentence displayed under the stats.
- **Draft Status**: Set `isDraft: true` for entries awaiting final owner text confirmation.

---

## 3. Building Asset Manifests

The asset pipeline processes original images into color-graded AVIF, WebP, and JPEG responsive variants (`1280w`, `1920w`, `2560w`), along with 32px ambient backdrops.

It runs automatically during `pnpm run dev` and `pnpm run build`. You can also trigger it manually anytime:

```bash
pnpm achievements:build
```

---

## 4. Troubleshooting & Common Errors

* **Warning: No photo assets found in assets-src/achievements/...**
  - *Cause*: The discipline folder is empty.
  - *Fix*: The template will intentionally display an elegant **Text & Stats Archive Record** fallback until photos are dropped into the folder.
* **Build validation error in `src/content/achievements.ts`**
  - *Cause*: A stat item missing `value` or more than 3 stats provided.
  - *Fix*: Ensure `stats` array contains between 0 and 3 items conforming to `{ value: string, label: string }`.

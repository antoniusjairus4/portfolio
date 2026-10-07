import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

// Direct data definition for build script execution without TS module transpilation issues
const achievementsData = [
  {
    id: 'speaking',
    slug: 'speaking',
    title: 'Speaking',
    subtitle: 'Keynote & Oratory Speaker',
    category: 'Leadership',
    order: 1,
    photoMeta: {
      '01-podium.png': {
        alt: 'Jairus speaking at keynote podium',
        focus: [0.5, 0.35],
        zoom: 1.15,
      },
      '02-stage.png': {
        alt: 'Jairus addressing audience on event stage',
        focus: [0.5, 0.4],
        zoom: 1.1,
      },
    },
  },
  {
    id: 'table-tennis',
    slug: 'table-tennis',
    title: 'Table Tennis',
    subtitle: '2x Tamil Nadu State Champion',
    category: 'Athletics',
    order: 2,
  },
  {
    id: 'karate',
    slug: 'karate',
    title: 'Karate',
    subtitle: 'Black Belt Martial Artist',
    category: 'Discipline',
    order: 3,
  },
  {
    id: 'chess',
    slug: 'chess',
    title: 'Chess',
    subtitle: 'Competitive Tactical Player',
    category: 'Strategy',
    order: 4,
  },
  {
    id: 'music',
    slug: 'music',
    title: 'Music',
    subtitle: 'Instrumental & Acoustic Artist',
    category: 'Arts',
    order: 5,
  },
];

const ASSETS_DIR = path.resolve('assets-src/achievements');
const PUBLIC_DIR = path.resolve('public/images/achievements');
const MANIFEST_PATH = path.resolve('src/content/achievements.manifest.json');

async function buildAchievementsManifest() {
  console.log('--- BUILDING ACHIEVEMENTS MANIFEST & OPTIMIZED PHOTO ASSETS ---');

  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  const manifest = {};

  for (const entry of achievementsData) {
    const slug = entry.slug;
    const srcDir = path.join(ASSETS_DIR, slug);
    const destDir = path.join(PUBLIC_DIR, slug);

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    manifest[slug] = {
      slug,
      title: entry.title,
      photos: [],
    };

    if (!fs.existsSync(srcDir)) {
      console.warn(`[Warning] Directory assets-src/achievements/${slug} does not exist. Empty photo state will be rendered.`);
      continue;
    }

    const files = fs.readdirSync(srcDir).filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return ['.png', '.jpg', '.jpeg', '.webp'].includes(ext) && !file.includes('-opt-') && !file.startsWith('photo-');
    }).sort();

    if (files.length === 0) {
      console.warn(`[Warning] No photo assets found in assets-src/achievements/${slug}. Empty photo state will be rendered.`);
      continue;
    }

    let photoIdx = 0;
    for (const file of files) {
      photoIdx++;
      const inputPath = path.join(srcDir, file);
      const baseName = `photo-${photoIdx}`;
      const metaOverride = entry.photoMeta?.[file] || {};

      const metadata = await sharp(inputPath).metadata();
      const origW = metadata.width || 1024;
      const origH = metadata.height || 1024;
      const aspectRatio = origW / origH;
      const isWide = aspectRatio >= 1.3;
      const isPortrait = aspectRatio < 1.0;

      const focalPoint = metaOverride.focus || [0.5, 0.5];

      // 1. Generate 32px pre-blurred ambient backdrop
      const blurFileName = `${baseName}-backdrop.webp`;
      const blurPath = path.join(destDir, blurFileName);
      await sharp(inputPath)
        .resize(32, 32, { fit: 'cover' })
        .blur(4)
        .modulate({ brightness: 0.45, saturation: 1.15 })
        .toFormat('webp', { quality: 60 })
        .toFile(blurPath);

      // 2. Color-Graded Responsive Variants (1280, 1920, 2560)
      const widths = [1280, 1920, 2560];
      const formats = ['avif', 'webp', 'jpg'];
      const variants = {};

      for (const w of widths) {
        if (w > origW + 200) continue;
        variants[w] = {};

        for (const fmt of formats) {
          const optFileName = `${baseName}-${w}.${fmt}`;
          const optPath = path.join(destDir, optFileName);

          let pipeline = sharp(inputPath)
            .resize(w, null, { withoutEnlargement: true })
            .modulate({ brightness: 0.95, saturation: 0.92 })
            .linear(1.05, -5);

          if (fmt === 'avif') pipeline = pipeline.toFormat('avif', { quality: 78 });
          if (fmt === 'webp') pipeline = pipeline.toFormat('webp', { quality: 84 });
          if (fmt === 'jpg') pipeline = pipeline.toFormat('jpeg', { quality: 85 });

          await pipeline.toFile(optPath);
          variants[w][fmt] = `/images/achievements/${slug}/${optFileName}`;
        }
      }

      // 3. Tiny 16px blur placeholder Data URL
      const placeholderBuf = await sharp(inputPath)
        .resize(16, 16, { fit: 'cover' })
        .toFormat('webp', { quality: 20 })
        .toBuffer();
      const blurDataURL = `data:image/webp;base64,${placeholderBuf.toString('base64')}`;

      manifest[slug].photos.push({
        id: `${slug}-${photoIdx}`,
        filename: file,
        originalPath: `/images/achievements/${slug}/${baseName}-1280.jpg`,
        variants,
        blurDataURL,
        ambientBackdrop: `/images/achievements/${slug}/${blurFileName}`,
        width: origW,
        height: origH,
        aspectRatio,
        isWide,
        isPortrait,
        focalPoint,
        zoom: metaOverride.zoom || 1.0,
        alt: metaOverride.alt || `${entry.title} photo ${photoIdx}`,
      });
    }
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`Successfully generated manifest at ${MANIFEST_PATH}`);
}

buildAchievementsManifest().catch(console.error);

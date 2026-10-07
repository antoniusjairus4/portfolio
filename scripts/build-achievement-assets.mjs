import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ACHIEVEMENTS_DIR = path.resolve('public/images/achievements');

async function buildAchievementAssets() {
  console.log('--- BUILDING OPTIMIZED ACHIEVEMENT IMAGE VARIANTS & PRE-BLURRED BACKDROPS ---');

  const dirs = fs.readdirSync(ACHIEVEMENTS_DIR).filter((f) => {
    return fs.statSync(path.join(ACHIEVEMENTS_DIR, f)).isDirectory();
  });

  const manifest = {};

  for (const dirName of dirs) {
    const discDir = path.join(ACHIEVEMENTS_DIR, dirName);
    const files = fs.readdirSync(discDir).filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return ['.png', '.jpg', '.jpeg', '.webp'].includes(ext) && !f.includes('-opt-') && !f.startsWith('backdrop-blur');
    });

    manifest[dirName] = {
      photos: [],
      preblurredBackdrop: null,
    };

    if (files.length === 0) {
      console.log(`Discipline '${dirName}' has no raw photos.`);
      continue;
    }

    let photoIdx = 0;
    for (const file of files) {
      const inputPath = path.join(discDir, file);
      const baseName = `photo-${photoIdx + 1}`;
      
      const meta = await sharp(inputPath).metadata();
      const aspectRatio = (meta.width || 1) / (meta.height || 1);
      const isPortrait = aspectRatio < 1.0;

      // 1. Generate 32px pre-blurred backdrop image for top photo
      if (photoIdx === 0) {
        const blurFileName = `backdrop-blur.webp`;
        const blurPath = path.join(discDir, blurFileName);
        
        await sharp(inputPath)
          .resize(32, 32, { fit: 'cover' })
          .blur(4)
          .modulate({ brightness: 0.5, saturation: 1.2 })
          .toFormat('webp', { quality: 60 })
          .toFile(blurPath);

        manifest[dirName].preblurredBackdrop = `/images/achievements/${dirName}/${blurFileName}`;
      }

      // 2. Generate optimized responsive variants: 400, 640, 1024
      const widths = [400, 640, 1024];
      const formats = ['webp', 'avif'];
      const variants = {};

      for (const w of widths) {
        variants[w] = {};

        for (const fmt of formats) {
          const optFileName = `${baseName}-${w}.${fmt}`;
          const optPath = path.join(discDir, optFileName);

          let pipeline = sharp(inputPath).resize(w, null, { withoutEnlargement: false });
          if (fmt === 'webp') pipeline = pipeline.toFormat('webp', { quality: 85 });
          if (fmt === 'avif') pipeline = pipeline.toFormat('avif', { quality: 80 });

          await pipeline.toFile(optPath);
          variants[w][fmt] = `/images/achievements/${dirName}/${optFileName}`;
        }
      }

      // 3. Tiny 16px blur placeholder base64
      const placeholderBuf = await sharp(inputPath)
        .resize(16, 16, { fit: 'cover' })
        .toFormat('webp', { quality: 20 })
        .toBuffer();
      const blurDataURL = `data:image/webp;base64,${placeholderBuf.toString('base64')}`;

      manifest[dirName].photos.push({
        id: `${dirName}-${photoIdx + 1}`,
        originalPath: `/images/achievements/${dirName}/${file}`,
        variants,
        blurDataURL,
        width: meta.width,
        height: meta.height,
        aspectRatio,
        isPortrait,
      });

      photoIdx++;
    }
  }

  const manifestPath = path.join(ACHIEVEMENTS_DIR, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Successfully generated manifest at ${manifestPath}`);
}

buildAchievementAssets().catch(console.error);

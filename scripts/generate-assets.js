import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const inputPath = path.resolve('images_offl/Image_0.png');
const srcBackupDir = path.resolve('assets-src');
const outputDir = path.resolve('public/images');

// Ensure directories exist
if (!fs.existsSync(srcBackupDir)) fs.mkdirSync(srcBackupDir, { recursive: true });
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// Copy original to assets-src/
fs.copyFileSync(inputPath, path.join(srcBackupDir, 'Image_0.png'));

async function processImage() {
  const metadata = await sharp(inputPath).metadata();
  console.log(
    `Original Image Metadata: ${metadata.width}x${metadata.height}, format: ${metadata.format}, size: ${fs.statSync(inputPath).size} bytes`,
  );

  const widths = [1280, metadata.width]; // 1280 and 1536 (native max)
  const formats = ['avif', 'webp', 'jpeg'];
  const report = {};

  for (const w of widths) {
    report[w] = {};
    for (const fmt of formats) {
      const filename = `cover-${w}.${fmt}`;
      const outputPath = path.join(outputDir, filename);

      let pipeline = sharp(inputPath).resize(w);

      if (fmt === 'avif') {
        pipeline = pipeline.avif({ quality: 80 });
      } else if (fmt === 'webp') {
        pipeline = pipeline.webp({ quality: 82 });
      } else if (fmt === 'jpeg') {
        pipeline = pipeline.jpeg({ quality: 85, progressive: true });
      }

      await pipeline.toFile(outputPath);
      const stat = fs.statSync(outputPath);
      report[w][fmt] = { filename, sizeKb: (stat.size / 1024).toFixed(2) };
    }
  }

  // Generate tiny inline blur placeholder (LQIP)
  const lqipBuffer = await sharp(inputPath).resize(16).blur(4).jpeg({ quality: 40 }).toBuffer();

  const lqipBase64 = `data:image/jpeg;base64,${lqipBuffer.toString('base64')}`;

  console.log('\n--- Image Processing Complete ---');
  console.log(JSON.stringify(report, null, 2));
  console.log('\nLQIP Data URI length:', lqipBase64.length);

  // Write LQIP manifest
  fs.writeFileSync(
    path.join(outputDir, 'manifest.json'),
    JSON.stringify({ metadata, report, lqipBase64 }, null, 2),
  );
}

processImage().catch(console.error);

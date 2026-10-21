import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Canonical order mirrors the exact six-domain taxonomy. Rasterize once at build
// time so runtime uses a single small atlas, not 27 SVG parsers or 3D logos.
const ids = [
  'dsa',
  'cpp',
  'c',
  'python',
  'java',
  'html',
  'css',
  'bootstrap',
  'tailwind',
  'react',
  'mern',
  'node',
  'express',
  'supabase',
  'mongodb',
  'fundamentals',
  'network',
  'scraping',
  'git',
  'github',
  'linux',
  'kali',
  'ollama',
  'antigravity',
  'claude',
  'lovable',
  'leonardo',
];
const root = path.resolve('public/skills/marks');
const svg = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="none" stroke="#F2E8D5" stroke-width="6" stroke-linecap="square" stroke-linejoin="miter">${body}</svg>`;
const custom = {
  dsa: svg(
    '<path d="M64 30V50M64 50H28V92M64 50H100V92M28 72H100"/><path stroke="#8B1E2D" d="M64 30V50H100V92"/><path fill="#F2E8D5" stroke="none" d="M54 12H74V32H54ZM18 92H38V112H18ZM90 92H110V112H90ZM54 62H74V82H54Z"/>',
  ),
  fundamentals: svg(
    '<path d="M24 16V112M104 16V112M24 24H104M24 104H104M48 48V80M80 48V80"/><path stroke="#8B1E2D" d="M10 64H48M80 64H118"/>',
  ),
  network: svg(
    '<path d="M14 26H40V102H14M114 26H88V102H114M40 64H88M64 24V104"/><path fill="#F2E8D5" stroke="none" d="M6 18H22V34H6ZM6 94H22V110H6ZM106 18H122V34H106ZM106 94H122V110H106Z"/><path stroke="#8B1E2D" d="M54 54H74V74H54Z"/>',
  ),
  scraping: svg(
    '<path d="M16 24H78M16 44H78M16 64H50M16 84H78M16 104H78M96 44H114V84H96"/><path stroke="#8B1E2D" d="M50 64H110M98 54L110 64L98 74"/>',
  ),
  mern: svg(
    '<path stroke="#83b4a0" d="M12 46V18L24 34L36 18V46M52 18H76M52 18V46H76M52 32H72M14 110V82H38V96H14M26 96L40 110M56 110V82L78 110V82"/><path stroke="#F2E8D5" stroke-width="3" d="M12 64H102V110M96 18H112M96 32H112M96 46H112"/>',
  ),
};
await fs.mkdir(root, { recursive: true });
for (const [id, data] of Object.entries(custom))
  await fs.writeFile(path.join(root, `${id}.svg`), data);
const mono = new Set(['express', 'github', 'linux', 'ollama', 'kali']);
const tiles = await Promise.all(
  ids.map(async (id, index) => {
    let source = await fs.readFile(path.join(root, `${id}.svg`), 'utf8');
    source = source.replace(/currentColor/g, '#F2E8D5');
    if (mono.has(id)) {
      source = source.replace(/<svg\b[^>]*>/, (tag) =>
        /\bfill=/.test(tag) ? tag : tag.replace('<svg', '<svg fill="#F2E8D5"'),
      );
      source = source.replace(
        /fill="(?:#(?:000000|000|181616|020202|080808)|black)"/gi,
        'fill="#F2E8D5"',
      );
    }
    const input = await sharp(Buffer.from(source))
      .resize(192, 192, { fit: 'contain', background: '#00000000' })
      .modulate({ saturation: 0.82 })
      .png()
      .toBuffer();
    return { input, left: (index % 4) * 256 + 32, top: Math.floor(index / 4) * 256 + 32 };
  }),
);
const atlas = await sharp({
  create: { width: 1024, height: 2048, channels: 4, background: '#00000000' },
})
  .composite(tiles)
  .png()
  .toBuffer();
await sharp(atlas).webp({ lossless: true }).toFile(path.join(root, 'identities.webp'));
await sharp(atlas)
  .resize(512, 1024)
  .webp({ lossless: true })
  .toFile(path.join(root, 'identities-portrait.webp'));
const sources = JSON.parse(await fs.readFile(path.join(root, 'sources.json'), 'utf8'));
for (const id of Object.keys(custom))
  sources[id] = 'Original conceptual symbol; not a product logo';
await fs.writeFile(path.join(root, 'sources.json'), JSON.stringify(sources, null, 2) + '\n');
console.log(`Built ${ids.length} local skill identities into desktop and portrait atlases.`);

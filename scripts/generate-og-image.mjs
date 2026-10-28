import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const width = 1200;
const height = 630;

// Crisp SVG composition for 1200x630 social card
const svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGlow" cx="20%" cy="25%" r="60%">
      <stop offset="0%" stop-color="#1f1813" />
      <stop offset="60%" stop-color="#0c0907" />
      <stop offset="100%" stop-color="#070504" />
    </radialGradient>
    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f2e9d8" />
      <stop offset="100%" stop-color="#e0a93b" />
    </linearGradient>
    <linearGradient id="redAccent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#8b1e2d" />
      <stop offset="100%" stop-color="#c12d41" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#bgGlow)" />

  <!-- Subtle Editorial Framing -->
  <rect x="40" y="40" width="${width - 80}" height="${height - 80}" fill="none" stroke="rgba(242, 233, 216, 0.12)" stroke-width="1.5" />
  
  <!-- Corner Accents -->
  <line x1="40" y1="40" x2="65" y2="40" stroke="#8b1e2d" stroke-width="3" />
  <line x1="40" y1="40" x2="40" y2="65" stroke="#8b1e2d" stroke-width="3" />
  <line x1="${width - 40}" y1="${height - 40}" x2="${width - 65}" y2="${height - 40}" stroke="#8b1e2d" stroke-width="3" />
  <line x1="${width - 40}" y1="${height - 40}" x2="${width - 40}" y2="${height - 65}" stroke="#8b1e2d" stroke-width="3" />

  <!-- Top Monospace Eyebrow -->
  <text x="80" y="110" font-family="monospace" font-size="16" font-weight="600" fill="#a89880" letter-spacing="4">
    OFFICIAL PORTFOLIO / 2026
  </text>
  <text x="${width - 80}" y="110" text-anchor="end" font-family="monospace" font-size="16" font-weight="600" fill="#8b1e2d" letter-spacing="3">
    ANTONIUSJAIRUS.IN
  </text>

  <!-- Red Accent Divider Line -->
  <rect x="80" y="130" width="120" height="4" fill="url(#redAccent)" />

  <!-- Main Display Typography: Antonius Jairus -->
  <text x="80" y="240" font-family="sans-serif" font-size="76" font-weight="900" fill="#f2e9d8" letter-spacing="-1">
    ANTONIUS JAIRUS
  </text>

  <!-- Roles / Disciplines Subtitle -->
  <text x="80" y="305" font-family="monospace" font-size="22" font-weight="600" fill="#e0a93b" letter-spacing="2">
    DEVELOPER · FREELANCER · INTERACTIVE CREATIVE
  </text>

  <!-- Descriptive Copy -->
  <text x="80" y="375" font-family="sans-serif" font-size="22" font-weight="400" fill="#a89880">
    Creator of KaiForge, Palindrome &amp; interactive 3D digital experiences.
  </text>
  <text x="80" y="410" font-family="sans-serif" font-size="22" font-weight="400" fill="#a89880">
    Engineering student, competitive athlete, and AI research contributor.
  </text>

  <!-- Bottom Badges / Project Tags -->
  <g transform="translate(80, 480)">
    <!-- KaiForge Tag -->
    <rect x="0" y="0" width="180" height="42" rx="4" fill="rgba(242, 233, 216, 0.06)" stroke="rgba(242, 233, 216, 0.18)" />
    <text x="90" y="26" text-anchor="middle" font-family="monospace" font-size="14" font-weight="600" fill="#f2e9d8" letter-spacing="1">KAIFORGE</text>

    <!-- Palindrome Tag -->
    <rect x="200" y="0" width="190" height="42" rx="4" fill="rgba(242, 233, 216, 0.06)" stroke="rgba(242, 233, 216, 0.18)" />
    <text x="295" y="26" text-anchor="middle" font-family="monospace" font-size="14" font-weight="600" fill="#f2e9d8" letter-spacing="1">PALINDROME</text>

    <!-- NeuroShield.ai Tag -->
    <rect x="410" y="0" width="220" height="42" rx="4" fill="rgba(242, 233, 216, 0.06)" stroke="rgba(242, 233, 216, 0.18)" />
    <text x="520" y="26" text-anchor="middle" font-family="monospace" font-size="14" font-weight="600" fill="#f2e9d8" letter-spacing="1">NEUROSHIELD.AI</text>

    <!-- WebGL / 3D Tag -->
    <rect x="650" y="0" width="210" height="42" rx="4" fill="rgba(242, 233, 216, 0.06)" stroke="rgba(242, 233, 216, 0.18)" />
    <text x="755" y="26" text-anchor="middle" font-family="monospace" font-size="14" font-weight="600" fill="#f2e9d8" letter-spacing="1">WEBGL / THREE.JS</text>
  </g>
</svg>
`;

async function main() {
  const dest = path.resolve('public/images/og-preview.png');
  await sharp(Buffer.from(svg))
    .png({ quality: 90, compressionLevel: 8 })
    .toFile(dest);
  console.log(`Generated OG image at ${dest}`);
}

main().catch(console.error);


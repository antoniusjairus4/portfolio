import { heroContent } from '@/content/heroContent';
import { NAME_EXIT_SCALE_END } from '@/motion/tokens';

export interface TextureComposerOptions {
  width: number;
  height: number;
  dpr: number;
}

export function composePageTexture({ width, height, dpr }: TextureComposerOptions): Promise<HTMLCanvasElement> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const scale = Math.min(dpr, 2);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve(canvas);
      return;
    }

    ctx.scale(scale, scale);

    // Draw background warm black
    ctx.fillStyle = '#0C0907';
    ctx.fillRect(0, 0, width, height);

    // Load and draw revealed background image
    const bgImg = new Image();
    bgImg.crossOrigin = 'anonymous';
    bgImg.src = '/images/hero/after_split-1672.jpg';

    const drawContent = () => {
      if (bgImg.complete && bgImg.naturalWidth > 0) {
        // Draw object-fit: cover for bgImg
        const imgRatio = bgImg.naturalWidth / bgImg.naturalHeight;
        const containerRatio = width / height;
        let renderW = width;
        let renderH = height;
        let offsetX = 0;
        let offsetY = 0;

        if (containerRatio > imgRatio) {
          renderH = width / imgRatio;
          offsetY = (height - renderH) / 2;
        } else {
          renderW = height * imgRatio;
          offsetX = (width - renderW) / 2;
        }

        ctx.drawImage(bgImg, offsetX, offsetY, renderW, renderH);

        // Draw radial scrim
        const maxRadius = Math.max(width, height) * 0.75;
        const gradient = ctx.createRadialGradient(
          width / 2,
          height / 2,
          0,
          width / 2,
          height / 2,
          maxRadius
        );
        gradient.addColorStop(0, 'rgba(12, 9, 7, 0.65)');
        gradient.addColorStop(1, 'rgba(12, 9, 7, 0.88)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw Name + 3 Roles with NAME_EXIT_SCALE_END applied
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(NAME_EXIT_SCALE_END, NAME_EXIT_SCALE_END);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Measure font sizes based on fluid clamp math
      // clamp(3.2rem, 15vw, 20rem)
      const nameFontSizePx = Math.min(Math.max(3.2 * 16, width * 0.15), 20 * 16);
      // clamp(1.4rem, 4.2vw, 4.8rem)
      const roleFontSizePx = Math.min(Math.max(1.4 * 16, width * 0.042), 4.8 * 16);

      // Name JAIRUS
      ctx.font = `700 ${nameFontSizePx}px "Cinzel Decorative", "Cinzel Variable", "Cinzel", serif`;
      ctx.fillStyle = '#FFF4E0';

      const nameYOffset = -roleFontSizePx * 1.6;
      ctx.fillText(heroContent.name, 0, nameYOffset);

      // Roles List
      ctx.font = `500 ${roleFontSizePx}px Satoshi, system-ui, sans-serif`;
      ctx.fillStyle = 'rgba(255, 244, 224, 0.65)';

      const roleLineGap = roleFontSizePx * 1.35;
      const startRoleY = nameYOffset + nameFontSizePx * 0.55 + roleFontSizePx;

      heroContent.roles.forEach((role, idx) => {
        ctx.fillText(role, 0, startRoleY + idx * roleLineGap);
      });

      ctx.restore();
      resolve(canvas);
    };

    if (bgImg.complete) {
      drawContent();
    } else {
      bgImg.onload = drawContent;
      bgImg.onerror = drawContent;
    }
  });
}

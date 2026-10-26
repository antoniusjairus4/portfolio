import { CanvasTexture, LinearMipmapLinearFilter, SRGBColorSpace } from 'three';
import { skillCategories } from '@/content/skills';

export interface CapabilityCardCopy {
  number: string;
  title: string;
  statement: string;
  skills: readonly string[];
  accent: string;
}

const ACCENTS = ['#aeb8bd', '#79b7be', '#83a58d', '#a5757b', '#bc9b69', '#9a91b9'] as const;

export const CAPABILITY_CARDS: readonly CapabilityCardCopy[] = skillCategories.map(
  (category, index) => ({
    number: `${category.index} / 06`,
    title: category.name,
    statement: category.statement,
    skills: category.skills,
    accent: ACCENTS[index],
  }),
);

const WIDTH = 900;
const HEIGHT = 1260;
const LEFT = 86;
const RIGHT = WIDTH - LEFT;

function fitFont(context: CanvasRenderingContext2D, text: string, maximum: number, limit: number) {
  let size = maximum;
  do {
    context.font = `600 ${size}px "Clash Display", sans-serif`;
    if (context.measureText(text).width <= limit) break;
    size -= 2;
  } while (size > 64);
  return size;
}

function drawWrapped(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(' ');
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width > maxWidth && line) {
      context.fillText(line, x, y);
      y += lineHeight;
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) context.fillText(line, x, y);
}

export function paintCapabilityCard(canvas: HTMLCanvasElement, card: CapabilityCardCopy) {
  const context = canvas.getContext('2d');
  if (!context) return;
  context.clearRect(0, 0, WIDTH, HEIGHT);
  context.textBaseline = 'alphabetic';

  context.fillStyle = card.accent;
  context.fillRect(LEFT, 86, 84, 7);
  context.font = '500 28px "Satoshi", sans-serif';
  context.fillText(card.number, LEFT, 145);
  context.textAlign = 'right';
  context.fillStyle = '#aab4b5';
  context.fillText('ANTONIUS JAIRUS', RIGHT, 145);
  context.textAlign = 'left';
  context.fillStyle = 'rgba(219, 226, 225, 0.25)';
  context.fillRect(LEFT, 175, RIGHT - LEFT, 2);

  const titleLines = card.title === 'BACKEND / DATABASE' ? ['BACKEND /', 'DATABASE'] : [card.title];
  let baseline = titleLines.length === 2 ? 345 : 390;
  for (const line of titleLines) {
    const size = fitFont(context, line, titleLines.length === 2 ? 132 : 145, RIGHT - LEFT);
    context.fillStyle = '#f1eee5';
    context.fillText(line, LEFT - 3, baseline);
    baseline += size * 0.95;
  }
  context.font = '400 30px "Satoshi", sans-serif';
  context.fillStyle = '#aab9b8';
  drawWrapped(context, card.statement, LEFT, 520, RIGHT - LEFT - 30, 43);

  context.fillStyle = 'rgba(219, 226, 225, 0.22)';
  context.fillRect(LEFT, 603, RIGHT - LEFT, 2);
  card.skills.forEach((skill, index) => {
    const y = 685 + index * 76;
    context.font = '500 27px "Satoshi", sans-serif';
    context.fillStyle = card.accent;
    context.fillText(String(index + 1).padStart(2, '0'), LEFT, y);
    context.font = '500 49px "Satoshi", sans-serif';
    context.fillStyle = '#e1e5e1';
    context.fillText(skill, LEFT + 92, y);
  });

  context.fillStyle = 'rgba(219, 226, 225, 0.22)';
  context.fillRect(LEFT, 1130, RIGHT - LEFT, 2);
  context.font = '500 24px "Satoshi", sans-serif';
  context.fillStyle = '#89999b';
  context.fillText('CAPABILITY LANDSCAPE', LEFT, 1182);
  context.textAlign = 'right';
  context.fillText('04 / SK', RIGHT, 1182);
  context.textAlign = 'left';
}

export function createCapabilityTexture(card: CapabilityCardCopy) {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  paintCapabilityCard(canvas, card);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.anisotropy = 4;
  return texture;
}

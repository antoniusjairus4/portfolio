export interface AchievementPhoto {
  id: string;
  originalPath: string;
  variants: Record<number, { webp: string; avif: string }>;
  blurDataURL: string;
  width: number;
  height: number;
  aspectRatio: number;
  isPortrait: boolean;
  alt: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  position: {
    top: string;
    left: string;
  };
  rotationDeg: number;
  fontFamily: string;
  fontName: string;
  summary: string; // Refined text block with proper capitalization/punctuation
  proofingNotes?: string; // Questions regarding spelling or factual details
  folderName: string;
}

export const achievementsContent: AchievementItem[] = [
  {
    id: 'table-tennis',
    title: 'Table Tennis',
    subtitle: '2x Tamil Nadu State Champion',
    category: 'Athletics',
    position: { top: '50%', left: '50%' },
    rotationDeg: 0,
    fontFamily: "'Syne Tactile', cursive",
    fontName: 'Syne Tactile (Expressive Script)',
    summary:
      'Two-time Tamil Nadu State Champion. Competing at the highest competitive level, honing reflexes, focus under high-stakes pressure, and tactical endurance.',
    folderName: 'table-tennis',
  },
  {
    id: 'speaking',
    title: 'Speaking',
    subtitle: 'Keynote & Oratory Speaker',
    category: 'Leadership',
    position: { top: '20%', left: '20%' },
    rotationDeg: 0,
    fontFamily: "'Syne Tactile', cursive",
    fontName: 'Syne Tactile (Expressive Script)',
    summary:
      'Spoke before Sid Ahmed, Sivakarthikeyan, and 15,000 people. Organized 7+ events and won 3rd place in the Coimbatore Book Festival (English edition).',
    proofingNotes:
      'Please confirm the exact spelling and formal titles of "Sid Ahmed" and "Sivakarthikeyan".',
    folderName: 'public-speaking',
  },
  {
    id: 'karate',
    title: 'Karate',
    subtitle: 'Black Belt Martial Artist',
    category: 'Discipline',
    position: { top: '20%', left: '80%' },
    rotationDeg: 0,
    fontFamily: "'Syne Tactile', cursive",
    fontName: 'Syne Tactile (Expressive Script)',
    summary:
      'Black Belt martial artist. Built unwavering physical conditioning, mental discipline, precision, and situational awareness through years of kata and kumite training.',
    folderName: 'karate',
  },
  {
    id: 'chess',
    title: 'Chess',
    subtitle: 'Competitive Tactical Player',
    category: 'Strategy',
    position: { top: '80%', left: '20%' },
    rotationDeg: 0,
    fontFamily: "'Syne Tactile', cursive",
    fontName: 'Syne Tactile (Expressive Script)',
    summary:
      'Competitive tactical player. Mastering deep calculation, pattern recognition, spatial control, and strategic foresight on the board.',
    folderName: 'chess',
  },
  {
    id: 'music',
    title: 'Music',
    subtitle: 'Instrumental & Acoustic Artist',
    category: 'Arts',
    position: { top: '80%', left: '80%' },
    rotationDeg: 0,
    fontFamily: "'Syne Tactile', cursive",
    fontName: 'Syne Tactile (Expressive Script)',
    summary:
      'Instrumental and acoustic artist. Exploring rhythm, harmony, composition, and emotional expression through musical creation.',
    folderName: 'music',
  },
];

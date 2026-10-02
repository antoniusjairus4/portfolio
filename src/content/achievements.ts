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
}

export const achievementsContent: AchievementItem[] = [
  {
    id: 'table-tennis',
    title: 'Table Tennis',
    subtitle: '2x Tamil Nadu State Champion',
    category: 'Athletics',
    position: { top: '50%', left: '50%' }, // Exact Center
    rotationDeg: 0,
    fontFamily: "'Syne Tactile', cursive",
    fontName: 'Syne Tactile (Expressive Script)',
  },
  {
    id: 'speaking',
    title: 'Speaking',
    subtitle: 'Keynote & Oratory Speaker',
    category: 'Leadership',
    position: { top: '20%', left: '20%' }, // Top-Left Corner
    rotationDeg: 0,
    fontFamily: "'Syne Tactile', cursive",
    fontName: 'Syne Tactile (Expressive Script)',
  },
  {
    id: 'karate',
    title: 'Karate',
    subtitle: 'Black Belt Martial Artist',
    category: 'Discipline',
    position: { top: '20%', left: '80%' }, // Top-Right Corner
    rotationDeg: 0,
    fontFamily: "'Syne Tactile', cursive",
    fontName: 'Syne Tactile (Expressive Script)',
  },
  {
    id: 'chess',
    title: 'Chess',
    subtitle: 'Competitive Tactical Player',
    category: 'Strategy',
    position: { top: '80%', left: '20%' }, // Bottom-Left Corner
    rotationDeg: 0,
    fontFamily: "'Syne Tactile', cursive",
    fontName: 'Syne Tactile (Expressive Script)',
  },
  {
    id: 'music',
    title: 'Music',
    subtitle: 'Instrumental & Acoustic Artist',
    category: 'Arts',
    position: { top: '80%', left: '80%' }, // Bottom-Right Corner
    rotationDeg: 0,
    fontFamily: "'Syne Tactile', cursive",
    fontName: 'Syne Tactile (Expressive Script)',
  },
];

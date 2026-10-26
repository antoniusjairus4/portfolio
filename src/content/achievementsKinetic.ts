export type AchievementDisciplineKey = 'table-tennis' | 'karate' | 'chess' | 'public-speaking';

export interface AchievementDiscipline {
  key: AchievementDisciplineKey;
  index: string;
  title: string;
  principle: string;
}

export const achievementDisciplines: readonly AchievementDiscipline[] = [
  {
    key: 'table-tennis',
    index: '01 / 04',
    title: 'TABLE TENNIS',
    principle: 'VELOCITY / SPIN / TRAJECTORY',
  },
  {
    key: 'karate',
    index: '02 / 04',
    title: 'KARATE',
    principle: 'IMPACT / PRECISION / STILLNESS',
  },
  {
    key: 'chess',
    index: '03 / 04',
    title: 'CHESS',
    principle: 'CALCULATION / STRUCTURE / SEQUENCE',
  },
  {
    key: 'public-speaking',
    index: '04 / 04',
    title: 'PUBLIC SPEAKING / LEADERSHIP',
    principle: 'AMPLIFICATION / SCALE / PRESENCE',
  },
] as const;

export const chessPeakRatings = [
  { label: 'RAPID', value: '1984' },
  { label: 'BLITZ', value: '2010' },
  { label: 'BULLET', value: '2198' },
] as const;

export interface AchievementExhibit {
  key: AchievementDisciplineKey;
  index: string;
  title: string;
  principle: string;
  headline: readonly string[];
  details: readonly { label: string; value: string }[];
  image: {
    src: string;
    alt: string;
    position: string;
  };
}

// One ordered source drives the scroll story and its paired image showcase.
export const achievementExhibits: readonly AchievementExhibit[] = [
  {
    ...achievementDisciplines[0],
    headline: ['2×', 'STATE CHAMPION'],
    details: [
      { value: '2×', label: 'Tamil Nadu state champion' },
      { value: 'Gold', label: 'National, Goa' },
      { value: 'Gold', label: 'RDS' },
    ],
    image: {
      src: '/images/achievements/table-tennis/photo-1-1280.webp',
      alt: 'Jairus holding a table tennis trophy, certificate, and medals',
      position: '50% 48%',
    },
  },
  {
    ...achievementDisciplines[1],
    headline: ['BLACK', 'BELT'],
    details: [
      { value: 'Black belt', label: 'Martial artist' },
      { value: '4×', label: 'National champion' },
      { value: '15+', label: 'State medals' },
    ],
    image: {
      src: '/images/achievements/karate/photo-1-1280.webp',
      alt: 'Jairus competing in a karate match',
      position: '52% 47%',
    },
  },
  {
    ...achievementDisciplines[2],
    headline: ['CHESS'],
    details: chessPeakRatings,
    image: {
      src: '/images/achievements/chess/photo-1-1280.webp',
      alt: 'Chess trophies, awards, and certificates on display',
      position: '50% 51%',
    },
  },
  {
    ...achievementDisciplines[3],
    headline: ['15+', 'SUCCESSFUL SPEECHES'],
    details: [
      { value: '15+', label: 'Successful speeches' },
      { value: '15,000', label: 'People addressed' },
    ],
    image: {
      src: '/images/achievements/public-speaking/photo-1-1024.webp',
      alt: 'Jairus speaking on stage into a microphone',
      position: '50% 35%',
    },
  },
];

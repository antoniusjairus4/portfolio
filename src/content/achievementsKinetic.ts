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

import { z } from 'zod';

export const AchievementStatSchema = z.object({
  value: z.string(),
  label: z.string(),
});

export const PhotoMetaOverrideSchema = z.object({
  alt: z.string().optional(),
  focus: z.tuple([z.number(), z.number()]).optional(),
  zoom: z.number().optional(),
  order: z.number().optional(),
});

export const AchievementEntrySchema = z.object({
  id: z.string(),
  slug: z.enum(['table-tennis', 'speaking', 'karate', 'chess', 'music']),
  title: z.string(),
  descriptor: z.string(),
  category: z.string(),
  order: z.number(),
  position: z.object({
    top: z.string(),
    left: z.string(),
  }),
  stats: z.array(AchievementStatSchema).max(3),
  caption: z.string().optional(),
  photoPath: z.string().optional(),
  photoMeta: z.record(z.string(), PhotoMetaOverrideSchema).optional(),
});

export type AchievementStat = z.infer<typeof AchievementStatSchema>;
export type PhotoMetaOverride = z.infer<typeof PhotoMetaOverrideSchema>;
export type AchievementEntry = z.infer<typeof AchievementEntrySchema>;
export type AchievementItem = AchievementEntry;

export const achievementsData: AchievementEntry[] = [
  {
    id: 'table-tennis',
    slug: 'table-tennis',
    title: 'Table Tennis',
    descriptor: '2x Tamil Nadu State Champion',
    category: 'Athletics',
    order: 1,
    position: { top: '50%', left: '50%' },
    stats: [
      { value: '2x', label: 'Tamil Nadu state champion' },
      { value: 'Gold', label: 'National, Goa' },
      { value: 'Gold', label: 'RDS' },
    ],
    caption: 'State & National Championship victories in Singles & Doubles',
    photoPath: '/images/achievements/table-tennis/photo-1-1280.jpg',
  },
  {
    id: 'speaking',
    slug: 'speaking',
    title: 'Public Speaking',
    descriptor: 'Keynote & Oratory Speaker',
    category: 'Leadership',
    order: 2,
    position: { top: '20%', left: '20%' },
    stats: [
      { value: '15,000', label: 'people addressed' },
      { value: '7+', label: 'events organised' },
      { value: '3rd', label: 'Coimbatore Book Festival, English edition' },
    ],
    caption: 'Addressed thousands across national summits and tech keynotes',
    photoPath: '/images/achievements/speaking/photo-1-1280.jpg',
  },
  {
    id: 'karate',
    slug: 'karate',
    title: 'Karate',
    descriptor: 'Black belt martial artist',
    category: 'Discipline',
    order: 3,
    position: { top: '20%', left: '80%' },
    stats: [
      { value: 'Black belt', label: 'Martial artist rank' },
      { value: '4x', label: 'National champion' },
      { value: '15+', label: 'State medals' },
    ],
    caption: 'First-degree Black Belt with multi-state kumite & kata titles',
    photoPath: '/images/achievements/karate/photo-1-1280.jpg',
  },
  {
    id: 'chess',
    slug: 'chess',
    title: 'Chess',
    descriptor: 'Competitive Tactical Player',
    category: 'Strategy',
    order: 4,
    position: { top: '80%', left: '20%' },
    stats: [
      { value: '2143', label: 'Peak bullet' },
      { value: '1985', label: 'Rapid' },
      { value: '1924', label: 'Blitz' },
    ],
    caption: 'Trophies and blitz tournament podium finishes across tournaments',
    photoPath: '/images/achievements/chess/photo-1-1280.jpg',
  },
  {
    id: 'music',
    slug: 'music',
    title: 'Music',
    descriptor: 'Instrumental & Acoustic Artist',
    category: 'Arts',
    order: 5,
    position: { top: '80%', left: '80%' },
    stats: [
      { value: '3 Grades', label: 'Trinity College London' },
      { value: 'Silver', label: 'Medalist, Campofez 2022' },
      { value: '4', label: 'Events participated' },
    ],
    caption: 'Trinity College certified keyboardist & live performance medalist',
    photoPath: '/images/achievements/music/photo-1-1280.jpg',
  },
];

export const achievementsContent = achievementsData;

export function getValidatedAchievements(): AchievementEntry[] {
  return achievementsData.map((entry) => AchievementEntrySchema.parse(entry));
}

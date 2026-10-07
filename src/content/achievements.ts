import { z } from 'zod';

export const AchievementStatSchema = z.object({
  value: z.string(),
  label: z.string(),
});

export const PhotoMetaOverrideSchema = z.object({
  alt: z.string().optional(),
  focus: z.tuple([z.number(), z.number()]).optional(), // [x, y] normalized 0..1
  zoom: z.number().optional(), // e.g. 1.0 to 2.0
  order: z.number().optional(),
});

export const AchievementEntrySchema = z.object({
  id: z.string(),
  slug: z.enum(['speaking', 'karate', 'table-tennis', 'chess', 'music']),
  title: z.string(),
  subtitle: z.string(),
  category: z.string(),
  order: z.number(),
  position: z.object({
    top: z.string(),
    left: z.string(),
  }),
  fontFamily: z.string(),
  stats: z.array(AchievementStatSchema).max(3),
  line: z.string().optional(),
  photoMeta: z.record(z.string(), PhotoMetaOverrideSchema).optional(),
  isDraft: z.boolean().default(false),
  proofingNotes: z.string().optional(),
});

export type AchievementStat = z.infer<typeof AchievementStatSchema>;
export type PhotoMetaOverride = z.infer<typeof PhotoMetaOverrideSchema>;
export type AchievementEntry = z.infer<typeof AchievementEntrySchema>;

export const achievementsData: AchievementEntry[] = [
  {
    id: 'speaking',
    slug: 'speaking',
    title: 'Speaking',
    subtitle: 'Keynote & Oratory Speaker',
    category: 'Leadership',
    order: 1,
    position: { top: '20%', left: '20%' },
    fontFamily: "'Syne Tactile', cursive",
    stats: [
      { value: '15,000', label: 'people addressed' },
      { value: '7+', label: 'events organised' },
      { value: '3rd', label: 'Coimbatore Book Festival, English edition' },
    ],
    line: 'Spoke before Sid Ahmed and Sivakarthikeyan.',
    proofingNotes: 'Please confirm the exact spelling and formal titles of "Sid Ahmed" and "Sivakarthikeyan".',
    photoMeta: {
      '01-podium.png': {
        alt: 'Jairus speaking at keynote podium',
        focus: [0.5, 0.35],
        zoom: 1.15,
      },
      '02-stage.png': {
        alt: 'Jairus addressing audience on event stage',
        focus: [0.5, 0.4],
        zoom: 1.1,
      },
    },
    isDraft: false,
  },
  {
    id: 'table-tennis',
    slug: 'table-tennis',
    title: 'Table Tennis',
    subtitle: '2x Tamil Nadu State Champion',
    category: 'Athletics',
    order: 2,
    position: { top: '50%', left: '50%' },
    fontFamily: "'Syne Tactile', cursive",
    stats: [
      { value: '2x', label: 'Tamil Nadu state champion' },
      { value: 'Gold', label: 'National, Goa' },
      { value: 'Gold', label: 'RDS' },
    ],
    isDraft: true,
  },
  {
    id: 'karate',
    slug: 'karate',
    title: 'Karate',
    subtitle: 'Black Belt Martial Artist',
    category: 'Discipline',
    order: 3,
    position: { top: '20%', left: '80%' },
    fontFamily: "'Syne Tactile', cursive",
    stats: [
      { value: 'Black belt', label: '' },
      { value: '4x', label: 'National champion' },
      { value: '15+', label: 'State medals' },
    ],
    isDraft: true,
  },
  {
    id: 'chess',
    slug: 'chess',
    title: 'Chess',
    subtitle: 'Competitive Tactical Player',
    category: 'Strategy',
    order: 4,
    position: { top: '80%', left: '20%' },
    fontFamily: "'Syne Tactile', cursive",
    stats: [
      { value: '2143', label: 'Peak bullet' },
      { value: '1985', label: 'Rapid' },
      { value: '1924', label: 'Blitz' },
    ],
    isDraft: true,
  },
  {
    id: 'music',
    slug: 'music',
    title: 'Music',
    subtitle: 'Instrumental & Acoustic Artist',
    category: 'Arts',
    order: 5,
    position: { top: '80%', left: '80%' },
    fontFamily: "'Syne Tactile', cursive",
    stats: [
      { value: '3', label: 'Trinity College London graded exams' },
    ],
    isDraft: true,
  },
];

// Validate all entries at runtime/build time
export function getValidatedAchievements(): AchievementEntry[] {
  return achievementsData.map((entry) => AchievementEntrySchema.parse(entry));
}

export const achievementsContent = achievementsData;
export type AchievementItem = AchievementEntry;


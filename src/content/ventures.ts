import { z } from 'zod';

export const VentureItemSchema = z.object({
  slug: z.string(),
  name: z.string(),
  chapterName: z.string().optional(),
  tagline: z.string().max(100),
  status: z.enum(['live', 'launched', 'development']),
  statusLabel: z.string(),
  liveUrl: z.string().url(),
  themeKey: z.enum(['palindrome', 'kaiforge', 'neuroshield']),
  demo: z.enum(['ledger-tamper', 'shot-sandbox', 'slice-scrubber']),
  motif: z.enum(['chain-blocks', 'ball-arc', 'node-network']),
});

export type VentureItem = z.infer<typeof VentureItemSchema>;

export const venturesContent: VentureItem[] = [
  VentureItemSchema.parse({
    slug: 'palindrome',
    name: 'PALINDROME',
    chapterName: 'Palindrome',
    tagline: 'A single, secure view of your assets and ledger.',
    status: 'live',
    statusLabel: 'Live · v2 in progress',
    liveUrl: 'https://palindrome.antoniusjairus.in',
    themeKey: 'palindrome',
    demo: 'ledger-tamper',
    motif: 'chain-blocks',
  }),
  VentureItemSchema.parse({
    slug: 'kaiforge',
    name: 'KAIFORGE',
    chapterName: 'KaiForge',
    tagline: 'Table tennis analytics, launched and sold.',
    status: 'launched',
    statusLabel: 'Launched · sold · rebuild planned',
    liveUrl: 'https://kaiforge.antoniusjairus.in',
    themeKey: 'kaiforge',
    demo: 'shot-sandbox',
    motif: 'ball-arc',
  }),
  VentureItemSchema.parse({
    slug: 'neuroshield',
    name: 'NEUROSHIELD',
    chapterName: 'NeuroShield AI',
    tagline: 'Early Alzheimer\'s detection from MRI scans.',
    status: 'development',
    statusLabel: 'In development',
    liveUrl: 'https://antoniusjairus4.github.io/neuro-shield/',
    themeKey: 'neuroshield',
    demo: 'slice-scrubber',
    motif: 'node-network',
  }),
];

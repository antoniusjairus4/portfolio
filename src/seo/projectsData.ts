export interface ProjectSEOData {
  slug: string;
  name: string;
  title: string;
  description: string;
  category: string;
  schemaType: 'SoftwareApplication' | 'CreativeWork';
  applicationCategory?: string;
  image: string;
  imageAlt: string;
  technologies: string[];
  problemStatement: string;
  architectureSummary: string;
  keyFeatures: string[];
  creatorRole: string;
  liveUrl?: string;
  canonicalPath: string;
}

export const projectsSEOList: ProjectSEOData[] = [
  {
    slug: 'kaiforge',
    name: 'KaiForge',
    title: 'KaiForge — Table Tennis Performance Analytics | Antonius Jairus',
    description:
      'Table-tennis performance tracking and match analytics web application created by Antonius Jairus. Explores practice logging, point-by-point telemetry, and tournament analytics.',
    category: 'Sports Analytics Platform',
    schemaType: 'SoftwareApplication',
    applicationCategory: 'SportsApplication',
    image: '/images/work-with-me/project-03-sports-app.png',
    imageAlt: 'KaiForge mobile interface showing table-tennis tournament performance records and analytics',
    technologies: ['TypeScript', 'React', 'Three.js', 'WebGL', 'Tailwind CSS', 'Vite'],
    problemStatement:
      'Competitive table tennis players and coaches frequently lack accessible digital tools to systematically break down point rhythms, rally duration, unforced error distributions, and tournament progression.',
    architectureSummary:
      'Built as an interactive, highly responsive web application integrating kinetic visualization models. Features modular tracking interfaces, telemetry capture, and visual progression telemetry engineered with TypeScript and high-performance WebGL rendering.',
    keyFeatures: [
      'Point-by-point rally rhythm and error distribution tracking',
      'Tournament bracket progress and head-to-head match logging',
      'Practice drill analytics with repetition and consistency metrics',
      'Dynamic 3D trajectory and spatial visualization models',
    ],
    creatorRole: 'Creator, lead developer, and interactive architect.',
    liveUrl: 'https://kaiforge.antoniusjairus.in',
    canonicalPath: '/projects/kaiforge',
  },
  {
    slug: 'palindrome',
    name: 'Palindrome',
    title: 'Palindrome — Consumer Financial Intelligence | Antonius Jairus',
    description:
      'Consumer financial-intelligence web application designed by Antonius Jairus to bring item-level context, recurring pattern recognition, and clarity to everyday spending.',
    category: 'Financial Intelligence Application',
    schemaType: 'SoftwareApplication',
    applicationCategory: 'FinanceApplication',
    image: '/images/work-with-me/project-02-pricing.png',
    imageAlt: 'Palindrome financial dashboard interface displaying item-level context and recurring spending patterns',
    technologies: ['TypeScript', 'React', 'Next.js', 'Tailwind CSS', 'PostgreSQL'],
    problemStatement:
      'Everyday consumers face aggregated banking statements and opaque monthly totals that disguise the actual recurring patterns, micro-spending habits, and root causes of expense inflation.',
    architectureSummary:
      'Designed around an editorial domestic-information architecture where spending is unpacked from monolithic aggregates into understandable category relationships, recurring subscriptions, and contextual item-level insights.',
    keyFeatures: [
      'De-aggregation of total sums into transparent line-item purchase patterns',
      'Automated recurring transaction and subscription recognition',
      'Context-aware budgeting that surfaces real spending dynamics',
      'Minimalist, calming user interface prioritizing comprehension over visual clutter',
    ],
    creatorRole: 'Product designer, full-stack engineer, and creator.',
    liveUrl: 'https://palindrome.antoniusjairus.in',
    canonicalPath: '/projects/palindrome',
  },
  {
    slug: 'neuroshield',
    name: 'NeuroShield.ai',
    title: 'NeuroShield.ai — AI Research Project | Antonius Jairus',
    description:
      "Ongoing machine-learning research project exploring Alzheimer's early detection through multimodal MRI neuroimaging analysis. Research contributions by Antonius Jairus.",
    category: 'Machine Learning Research',
    schemaType: 'CreativeWork',
    image: '/research/neuroshield/evidence-background.png',
    imageAlt: 'NeuroShield medical imaging research interface showcasing Alzheimer MRI neural analysis and experimental evidence',
    technologies: ['Python', 'PyTorch', 'Convolutional Neural Networks', 'Medical Image Processing', 'ADNI Dataset'],
    problemStatement:
      "Early diagnosis of neurodegenerative diseases such as Alzheimer's remains a critical challenge due to subtle morphological shifts in brain MRI scans that can precede clinical symptom onset by years.",
    architectureSummary:
      'Conducted within a collaborative multi-disciplinary research team. Utilizes structural magnetic resonance imaging (sMRI) datasets from ADNI (Alzheimer’s Disease Neuroimaging Initiative) to train deep convolutional neural architectures for predictive structural classification.',
    keyFeatures: [
      'Comparative evaluation of 3D CNN architectures on volumetric brain MRI scans',
      'Feature attribution maps highlighting hippocampal volume atrophy patterns',
      'Rigorous evaluation benchmarks distinguishing Cognitively Normal (CN) from Mild Cognitive Impairment (MCI)',
      'Scientific research documentation and evidence visualization pipeline',
    ],
    creatorRole:
      'Machine learning contributor responsible for training model pipelines on ADNI datasets, generating metric comparative runs, and producing experimental evidence graphs.',
    liveUrl: 'https://antoniusjairus4.github.io/neuro-shield/',
    canonicalPath: '/projects/neuroshield',
  },
  {
    slug: 'rajamanickam-chit-fund',
    name: 'Rajamanickam Chit Fund Platform',
    title: 'Rajamanickam Chit Fund — Financial Management Platform | Antonius Jairus',
    description:
      'Custom full-stack ledger, member accounting, and fund management system engineered by Antonius Jairus for private financial operations.',
    category: 'Enterprise Financial Application',
    schemaType: 'SoftwareApplication',
    applicationCategory: 'BusinessApplication',
    image: '/images/work-with-me/project-01-workspace.png',
    imageAlt: 'Rajamanickam Chit Fund custom management dashboard running on a workspace laptop',
    technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    problemStatement:
      'Traditional chit fund groups and peer credit communities frequently suffer from fragmented manual bookkeeping, paper ledgers, and error-prone reconciliation cycles between auction dates.',
    architectureSummary:
      'Engineered as a robust, auditable full-stack management portal providing real-time member balance calculation, automated auction dividend distribution, and secure payment ledger history.',
    keyFeatures: [
      'Automated monthly auction bidding recording and dividend distribution logic',
      'Member ledger management with penalty and interest calculations',
      'Downloadable transaction receipts and accounting summary statements',
      'Role-based access control protecting confidential financial operational data',
    ],
    creatorRole: 'Sole full-stack software engineer and system designer.',
    canonicalPath: '/projects/rajamanickam-chit-fund',
  },
  {
    slug: 'dr-js-yogesh-kumar-zsi',
    name: 'Dr. J.S. Yogesh Kumar Digital Archive',
    title: 'Dr. J.S. Yogesh Kumar — Digital Archive & Portfolio | Antonius Jairus',
    description:
      'Tailored scientific portfolio and marine biodiversity research archive developed by Antonius Jairus for Dr. J.S. Yogesh Kumar, E-Grade Scientist at the Zoological Survey of India (ZSI).',
    category: 'Scientific Archive & Digital Portfolio',
    schemaType: 'CreativeWork',
    image: '/images/work-with-me/project-04-marine-portfolio.png',
    imageAlt: 'Marine biodiversity research archive and digital portfolio designed for Dr. J.S. Yogesh Kumar',
    technologies: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
    problemStatement:
      'Senior scientific researchers with decades of peer-reviewed marine taxonomy discoveries, field expedition monographs, and conservation reports require specialized digital archives that honor academic rigor while remaining engaging to the global scientific community.',
    architectureSummary:
      'Custom-tailored academic showcase and digital repository honoring extensive coral reef and marine fauna research conducted for the Zoological Survey of India (ZSI). Designed with accessible taxonomy filtering and responsive document cataloging.',
    keyFeatures: [
      'Comprehensive index of scientific publications, species discovery papers, and expedition journals',
      'Taxonomic categorization of marine specimen research and underwater photography',
      'Fast, accessible client portfolio architecture built with Next.js and modern web standards',
      'Structured presentation of academic credentials, awards, and governmental conservation projects',
    ],
    creatorRole: 'Web designer and developer (contract client collaboration).',
    canonicalPath: '/projects/dr-js-yogesh-kumar-zsi',
  },
];

export function getProjectBySlug(slug: string): ProjectSEOData | undefined {
  return projectsSEOList.find((p) => p.slug === slug);
}


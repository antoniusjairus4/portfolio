export const siteMetadata = {
  siteUrl: 'https://antoniusjairus.in',
  siteName: 'Antonius Jairus',
  author: {
    name: 'Antonius Jairus',
    legalName: 'Antonius Jairus',
    url: 'https://antoniusjairus.in',
    gender: 'Male',
    nationality: 'Indian',
    jobTitle: 'Developer, Freelancer & Interactive Creative',
    description:
      'Developer, engineering student, freelancer and creator of KaiForge, Palindrome and interactive digital experiences. Based in Tamil Nadu, India.',
    knowsAbout: [
      'Web Development',
      'Interactive Web Experiences',
      'WebGL & Three.js',
      'React & Next.js',
      'Artificial Intelligence & Machine Learning',
      'Full-Stack Application Architecture',
      'Table Tennis Performance Analytics',
      'Competitive Athletics',
      'Karate Black Belt',
      'Competitive Chess Tactics',
    ],
    sameAs: [
      'https://github.com/antoniusjairus4',
      'https://www.linkedin.com/in/antoniusjairus4',
      'https://www.instagram.com/antoniusjairus4',
      'https://x.com/antoniusjairus4',
    ],
    contactPoint: {
      email: 'antoniusjairusofficial@gmail.com',
      contactType: 'Professional Collaboration',
    },
  },
  title: 'Antonius Jairus | Developer, Freelancer & Interactive Portfolio',
  description:
    'Official portfolio of Antonius Jairus — developer, engineering student, freelancer and creator of KaiForge, Palindrome and interactive digital experiences. Explore projects, research, achievements and selected work.',
  organization: {
    name: 'Palindrome Labs',
    alternateName: 'Palindrome Labs India',
    url: 'https://antoniusjairus.in',
    founder: 'Antonius Jairus',
    description:
      'Digital craft, interactive web development, and software engineering studio established by Antonius Jairus.',
  },
  ogImage: {
    url: '/images/og-preview.png',
    width: 1200,
    height: 630,
    alt: 'Antonius Jairus — Interactive Portfolio, Engineering & Product Showcase',
    type: 'image/png',
  },
  twitter: {
    handle: '@antoniusjairus4',
    cardType: 'summary_large_image',
  },
  // Placeholders for search engine verification (insert your token here when provided by Search Console / Bing)
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
    bing: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || '',
  },
} as const;


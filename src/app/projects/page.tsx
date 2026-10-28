import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { siteMetadata } from '@/seo/siteMetadata';
import { projectsSEOList } from '@/seo/projectsData';
import styles from './projects.module.css';

export const metadata: Metadata = {
  title: 'Projects & Engineering Work | Antonius Jairus',
  description:
    'Explore engineering projects, interactive web applications, software architecture, and research work created by Antonius Jairus.',
  alternates: {
    canonical: '/projects',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: `${siteMetadata.siteUrl}/projects`,
    siteName: siteMetadata.siteName,
    title: 'Projects & Engineering Work | Antonius Jairus',
    description:
      'Explore engineering projects, interactive web applications, software architecture, and research work created by Antonius Jairus.',
    images: [
      {
        url: `${siteMetadata.siteUrl}${siteMetadata.ogImage.url}`,
        width: 1200,
        height: 630,
        alt: 'Antonius Jairus Projects & Engineering Work',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Projects & Engineering Work | Antonius Jairus',
    description:
      'Explore engineering projects, interactive web applications, software architecture, and research work created by Antonius Jairus.',
    creator: siteMetadata.twitter.handle,
    images: [`${siteMetadata.siteUrl}${siteMetadata.ogImage.url}`],
  },
};

export default function ProjectsIndexPage() {
  return (
    <main className={styles.container}>
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className={styles.topNav}>
        <ol className={styles.breadcrumb}>
          <li>
            <Link href="/">Home</Link>
          </li>
          <span aria-hidden="true">/</span>
          <li>
            <span className={styles.breadcrumbCurrent}>Projects</span>
          </li>
        </ol>

        <Link href="/" className={styles.homeBackLink}>
          ← Interactive Portfolio
        </Link>
      </nav>

      {/* Header */}
      <header className={styles.header}>
        <span className={styles.eyebrow}>SELECTED WORK &amp; ENGINEERING</span>
        <h1 className={styles.title}>Projects &amp; Systems</h1>
        <p className={styles.lead}>
          Software applications, technical architecture, and research initiatives created and contributed to by Antonius Jairus.
        </p>
      </header>

      {/* Project Cards Grid */}
      <div className={styles.relatedGrid}>
        {projectsSEOList.map((project) => (
          <Link
            key={project.slug}
            href={project.canonicalPath}
            className={styles.relatedCard}
          >
            <div>
              <div style={{ position: 'relative', width: '100%', height: '180px', marginBottom: '1rem', borderRadius: '4px', overflow: 'hidden' }}>
                <Image
                  src={project.image}
                  alt={project.imageAlt}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <span className={styles.eyebrow}>{project.category}</span>
              <h2 className={styles.relatedName}>{project.name}</h2>
              <p className={styles.relatedDesc}>{project.description}</p>
            </div>
            <span className={styles.relatedArrow}>Read Project Case Study →</span>
          </Link>
        ))}
      </div>
    </main>
  );
}


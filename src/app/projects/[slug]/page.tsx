import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { siteMetadata } from '@/seo/siteMetadata';
import { getProjectBySlug, projectsSEOList } from '@/seo/projectsData';
import { getProjectStructuredData } from '@/seo/structuredData';
import styles from '../projects.module.css';

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return projectsSEOList.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {
      title: 'Project Not Found | Antonius Jairus',
    };
  }

  const canonicalUrl = `${siteMetadata.siteUrl}${project.canonicalPath}`;
  const imageUrl = `${siteMetadata.siteUrl}${project.image}`;

  return {
    title: project.title,
    description: project.description,
    alternates: {
      canonical: project.canonicalPath,
    },
    openGraph: {
      type: 'article',
      locale: 'en_US',
      url: canonicalUrl,
      siteName: siteMetadata.siteName,
      title: project.title,
      description: project.description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: project.imageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.description,
      creator: siteMetadata.twitter.handle,
      images: [imageUrl],
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const structuredData = getProjectStructuredData(project);
  const relatedProjects = projectsSEOList.filter((p) => p.slug !== project.slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <main className={styles.container}>
        {/* Breadcrumb & Navigation */}
        <nav aria-label="Breadcrumb" className={styles.topNav}>
          <ol className={styles.breadcrumb} itemScope itemType="https://schema.org/BreadcrumbList">
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link href="/" itemProp="item">
                <span itemProp="name">Home</span>
              </Link>
              <meta itemProp="position" content="1" />
            </li>
            <span aria-hidden="true">/</span>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link href="/projects" itemProp="item">
                <span itemProp="name">Projects</span>
              </Link>
              <meta itemProp="position" content="2" />
            </li>
            <span aria-hidden="true">/</span>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <span className={styles.breadcrumbCurrent} itemProp="name">
                {project.name}
              </span>
              <meta itemProp="position" content="3" />
            </li>
          </ol>

          <Link href="/" className={styles.homeBackLink}>
            ← Interactive Portfolio
          </Link>
        </nav>

        <article>
          {/* Header */}
          <header className={styles.header}>
            <span className={styles.eyebrow}>{project.category}</span>
            <h1 className={styles.title}>{project.name}</h1>
            <p className={styles.lead}>{project.description}</p>
          </header>

          {/* Project Screenshot / Visual */}
          <figure className={styles.imageSection}>
            <Image
              src={project.image}
              alt={project.imageAlt}
              width={1200}
              height={640}
              className={styles.projectImage}
              priority
            />
            <figcaption className={styles.imageCaption}>
              {project.imageAlt} — Architecture by Antonius Jairus
            </figcaption>
          </figure>

          {/* Grid Layout: Content & Sidebar */}
          <div className={styles.contentGrid}>
            <div>
              {/* Problem Statement */}
              <section className={styles.sectionBlock}>
                <h2 className={styles.sectionHeading}>The Challenge &amp; Problem</h2>
                <p className={styles.bodyText}>{project.problemStatement}</p>
              </section>

              {/* Architecture & Engineering */}
              <section className={styles.sectionBlock}>
                <h2 className={styles.sectionHeading}>Engineering &amp; Architecture</h2>
                <p className={styles.bodyText}>{project.architectureSummary}</p>
              </section>

              {/* Key Features */}
              <section className={styles.sectionBlock}>
                <h2 className={styles.sectionHeading}>Core Capabilities</h2>
                <ul className={styles.featureList}>
                  {project.keyFeatures.map((feature) => (
                    <li key={feature} className={styles.featureItem}>
                      {feature}
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {/* Sidebar Metadata */}
            <aside aria-label="Project Metadata">
              <div className={styles.sidebarCard}>
                <div className={styles.sectionBlock}>
                  <h3 className={styles.sectionHeading}>Role &amp; Authorship</h3>
                  <p className={styles.bodyText}>
                    <strong>Creator:</strong> Antonius Jairus
                    <br />
                    <span>{project.creatorRole}</span>
                  </p>
                </div>

                <div className={styles.sectionBlock}>
                  <h3 className={styles.sectionHeading}>Technologies Used</h3>
                  <div className={styles.techTags}>
                    {project.technologies.map((tech) => (
                      <span key={tech} className={styles.techTag}>
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.liveButton}
                  >
                    Open Live Project ↗
                  </a>
                )}
              </div>
            </aside>
          </div>

          {/* Sibling Projects Internal Linking */}
          <section className={styles.relatedSection}>
            <h2 className={styles.relatedHeading}>More Selected Projects</h2>
            <div className={styles.relatedGrid}>
              {relatedProjects.map((sibling) => (
                <Link
                  key={sibling.slug}
                  href={sibling.canonicalPath}
                  className={styles.relatedCard}
                >
                  <div>
                    <span className={styles.eyebrow}>{sibling.category}</span>
                    <h3 className={styles.relatedName}>{sibling.name}</h3>
                    <p className={styles.relatedDesc}>{sibling.description}</p>
                  </div>
                  <span className={styles.relatedArrow}>Explore Project →</span>
                </Link>
              ))}
            </div>
          </section>
        </article>
      </main>
    </>
  );
}


import { siteMetadata } from './siteMetadata';
import type { ProjectSEOData } from './projectsData';

export function getRootStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${siteMetadata.siteUrl}/#person`,
        name: siteMetadata.author.name,
        legalName: siteMetadata.author.legalName,
        url: siteMetadata.siteUrl,
        gender: siteMetadata.author.gender,
        nationality: siteMetadata.author.nationality,
        jobTitle: siteMetadata.author.jobTitle,
        description: siteMetadata.author.description,
        image: [
          `${siteMetadata.siteUrl}/images/contact/antonius-id-photo.png`,
          `${siteMetadata.siteUrl}/favicon-192x192.png`,
        ],
        knowsAbout: siteMetadata.author.knowsAbout,
        sameAs: siteMetadata.author.sameAs,
        contactPoint: {
          '@type': 'ContactPoint',
          email: siteMetadata.author.contactPoint.email,
          contactType: siteMetadata.author.contactPoint.contactType,
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${siteMetadata.siteUrl}/#website`,
        url: siteMetadata.siteUrl,
        name: siteMetadata.siteName,
        alternateName: [
          'Antonius Jairus Portfolio',
          'Jairus Portfolio',
          'Antonius Jairus Official Website',
        ],
        description: siteMetadata.description,
        author: {
          '@id': `${siteMetadata.siteUrl}/#person`,
        },
        publisher: {
          '@id': `${siteMetadata.siteUrl}/#person`,
        },
        inLanguage: 'en-US',
      },
      {
        '@type': 'ProfilePage',
        '@id': `${siteMetadata.siteUrl}/#webpage`,
        url: siteMetadata.siteUrl,
        name: siteMetadata.title,
        isPartOf: {
          '@id': `${siteMetadata.siteUrl}/#website`,
        },
        about: {
          '@id': `${siteMetadata.siteUrl}/#person`,
        },
        mainEntity: {
          '@id': `${siteMetadata.siteUrl}/#person`,
        },
        description: siteMetadata.description,
        inLanguage: 'en-US',
      },
      {
        '@type': 'Organization',
        '@id': `${siteMetadata.siteUrl}/#organization`,
        name: siteMetadata.organization.name,
        alternateName: siteMetadata.organization.alternateName,
        url: siteMetadata.organization.url,
        founder: {
          '@id': `${siteMetadata.siteUrl}/#person`,
        },
        description: siteMetadata.organization.description,
      },
    ],
  };
}

export function getProjectStructuredData(project: ProjectSEOData) {
  const projectUrl = `${siteMetadata.siteUrl}${project.canonicalPath}`;
  const imageUrl = `${siteMetadata.siteUrl}${project.image}`;

  const isApp = project.schemaType === 'SoftwareApplication';

  const creativeEntity: Record<string, unknown> = {
    '@type': isApp ? 'SoftwareApplication' : 'CreativeWork',
    '@id': `${projectUrl}#project`,
    name: project.name,
    headline: project.title,
    description: project.description,
    url: projectUrl,
    image: imageUrl,
    creator: {
      '@id': `${siteMetadata.siteUrl}/#person`,
    },
    author: {
      '@id': `${siteMetadata.siteUrl}/#person`,
    },
    publisher: {
      '@id': `${siteMetadata.siteUrl}/#person`,
    },
    genre: project.category,
    keywords: project.technologies.join(', '),
    inLanguage: 'en-US',
  };

  if (isApp && project.applicationCategory) {
    creativeEntity.applicationCategory = project.applicationCategory;
    creativeEntity.operatingSystem = 'All Web Browsers';
  }

  const breadcrumbs = {
    '@type': 'BreadcrumbList',
    '@id': `${projectUrl}#breadcrumbs`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteMetadata.siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Projects',
        item: `${siteMetadata.siteUrl}/projects`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: project.name,
        item: projectUrl,
      },
    ],
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [creativeEntity, breadcrumbs],
  };
}


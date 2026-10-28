import type { MetadataRoute } from 'next';
import { siteMetadata } from '@/seo/siteMetadata';
import { projectsSEOList } from '@/seo/projectsData';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString().split('T')[0];

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteMetadata.siteUrl}/`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${siteMetadata.siteUrl}/projects`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
  ];

  const projectRoutes: MetadataRoute.Sitemap = projectsSEOList.map((project) => ({
    url: `${siteMetadata.siteUrl}${project.canonicalPath}`,
    lastModified: currentDate,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...projectRoutes];
}

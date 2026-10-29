import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import type React from 'react';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource-variable/jetbrains-mono';
import '@fontsource/cinzel-decorative/700.css';
import '@fontsource-variable/cinzel';
import '@fontsource/syne/800.css';
import '@fontsource/syne-tactile';
import '@fontsource/playfair-display/700.css';
import '@fontsource/syncopate/700.css';
import '@fontsource/unifrakturmaguntia';
import '@/styles/globals.css';
import { ExperienceEnvironmentProvider } from '@/experience/ExperienceEnvironment';
import { GlobalEtherProvider } from '@/experience/GlobalEtherProvider';
import { LenisProvider } from '@/motion/lenis/LenisProvider';
import { siteMetadata } from '@/seo/siteMetadata';
import { getRootStructuredData } from '@/seo/structuredData';

export const viewport: Viewport = {
  themeColor: '#0C0907',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  title: {
    default: siteMetadata.title,
    template: '%s',
  },
  description: siteMetadata.description,
  applicationName: siteMetadata.siteName,
  authors: [{ name: siteMetadata.author.name, url: siteMetadata.siteUrl }],
  creator: siteMetadata.author.name,
  publisher: siteMetadata.siteName,
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteMetadata.siteUrl,
    siteName: siteMetadata.siteName,
    title: siteMetadata.title,
    description: siteMetadata.description,
    images: [
      {
        url: siteMetadata.ogImage.url,
        width: siteMetadata.ogImage.width,
        height: siteMetadata.ogImage.height,
        alt: siteMetadata.ogImage.alt,
        type: siteMetadata.ogImage.type,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteMetadata.title,
    description: siteMetadata.description,
    creator: siteMetadata.twitter.handle,
    site: siteMetadata.twitter.handle,
    images: [siteMetadata.ogImage.url],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const rootJsonLd = getRootStructuredData();

  return (
    <html lang="en" className="dark bg-[#0C0907]">
      <head>
        {/* Preload LCP Image */}
        <link
          rel="preload"
          as="image"
          href="/images/cover-1536.avif"
          type="image/avif"
          fetchPriority="high"
        />
        {/* Person, WebSite & ProfilePage Structured Data (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(rootJsonLd) }}
        />
      </head>
      <body className="bg-[#0C0907] text-[#F2E9D8] antialiased selection:bg-[#E0A93B] selection:text-[#0C0907]">
        <Script
          id="document-scroll-contract"
          src="/document-scroll-contract.js?v=scroll-restoration-2"
          strategy="beforeInteractive"
        />
        <ExperienceEnvironmentProvider>
          <LenisProvider>
            <GlobalEtherProvider>{children}</GlobalEtherProvider>
          </LenisProvider>
        </ExperienceEnvironmentProvider>
      </body>
    </html>
  );
}

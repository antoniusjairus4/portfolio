import type { Metadata } from 'next';
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

export const metadata: Metadata = {
  title: 'Antonius Jairus — Portfolio',
  description:
    'Personal portfolio of Antonius Jairus: cybersecurity student, table tennis state champion, and founder.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
      </head>
      <body className="bg-[#0C0907] text-[#F2E9D8] antialiased selection:bg-[#E0A93B] selection:text-[#0C0907]">
        <Script
          id="document-scroll-contract"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `history.scrollRestoration = 'auto';
(() => {
  const navigation = performance.getEntriesByType('navigation')[0];
  const isHistoryTraversal = navigation && navigation.type === 'back_forward';
  const hasDirectTarget = window.location.hash.length > 1;

  if (!isHistoryTraversal && !hasDirectTarget) {
    window.scrollTo(0, 0);
    window.addEventListener('pageshow', (event) => {
      if (!event.persisted) window.scrollTo(0, 0);
    }, { once: true });
  }

  window.addEventListener('pagehide', () => {
    history.replaceState({ ...history.state, __portfolioScrollY: window.scrollY }, '');
  });
})();`,
          }}
        />
        <ExperienceEnvironmentProvider>
          <LenisProvider>
            <GlobalEtherProvider>
              {children}
            </GlobalEtherProvider>
          </LenisProvider>
        </ExperienceEnvironmentProvider>
      </body>
    </html>
  );
}

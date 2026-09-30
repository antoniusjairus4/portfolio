import type { Metadata } from 'next';
import type React from 'react';
import '@/styles/globals.css';
import { LenisProvider } from '@/motion/lenis/LenisProvider';


export const metadata: Metadata = {
  title: 'Jairus — Portfolio',
  description:
    'Personal portfolio of Jairus: cybersecurity student, table tennis state champion, and founder.',
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
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}

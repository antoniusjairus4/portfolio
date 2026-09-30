'use client';

import { PhotoCoverSplit } from '@/components/layout/PhotoCoverSplit';
import { Preloader } from '@/components/preloader/Preloader';
import { useLenis } from '@/motion/lenis/LenisProvider';

export default function Home() {
  const { stop, start } = useLenis();

  return (
    <main className="relative w-full bg-[#0C0907]">
      {/* Preloader */}
      <Preloader onComplete={() => start()} />

      {/* Page 0 Cover & Split Reveal */}
      <PhotoCoverSplit />

      {/* Page 1 Text-Free Placeholder Space (Beneath Split) */}
      <section
        id="page-1-placeholder"
        className="w-full min-h-screen bg-[#0C0907] flex items-center justify-center p-8 select-none"
        aria-hidden="true"
      >
        <div className="w-full max-w-4xl h-96 rounded-2xl border border-[#E0A93B]/10 bg-[#17110C]/50 backdrop-blur-sm flex items-center justify-center shadow-2xl">
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-[#E0A93B]/30 to-transparent animate-pulse" />
        </div>
      </section>
    </main>
  );
}

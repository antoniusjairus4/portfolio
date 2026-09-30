'use client';

import { PhotoCoverSplit } from '@/components/layout/PhotoCoverSplit';
import { Preloader } from '@/components/preloader/Preloader';
import { useLenis } from '@/motion/lenis/LenisProvider';

export default function Home() {
  const { stop, start } = useLenis();

  return (
    <main className="relative w-full bg-[#0C0907]">
      {/* Preloader (Phase 1/2) */}
      <Preloader onComplete={() => start()} />

      {/* Page 0 Cover & Pinned Scroll Story Reveal */}
      <PhotoCoverSplit />

      {/* Page 1 Text-Free Placeholder Space (On Hold for Phase 3) */}
      <section
        id="page-1-placeholder"
        className="w-full h-[100svh] bg-[#0C0907] flex items-center justify-center p-8 select-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(224, 169, 59, 0.08) 0%, rgba(12, 9, 7, 1) 75%)',
        }}
      >
        {/* Soft gold glow placeholder - Page 1 on hold */}
      </section>
    </main>
  );
}

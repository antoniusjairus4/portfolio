'use client';

import { PhotoCoverSplit } from '@/components/layout/PhotoCoverSplit';
import { Preloader } from '@/components/preloader/Preloader';
import { VenturesSection } from '@/components/ventures/VenturesSection';
import { DisciplinesScrollSection } from '@/components/disciplines-scroll/DisciplinesScrollSection';
import { TechnicalSkillsTerminal } from '@/components/terminal/TechnicalSkillsTerminal';
import { useLenis } from '@/motion/lenis/LenisProvider';

export default function Home() {
  const { stop, start } = useLenis();

  return (
    <main className="relative w-full bg-[#0C0907]">
      {/* Preloader (Phase 1/2) */}
      <Preloader
        onComplete={() => {
          start();
          // Frame after preloader exits: refresh ScrollTrigger and verify pin position
          requestAnimationFrame(() => {
            if (typeof window !== 'undefined' && 'ScrollTrigger' in window) {
              const ST = (window as unknown as { ScrollTrigger: { refresh: () => void; update: () => void } }).ScrollTrigger;
              ST.refresh();
              ST.update();
            }
          });
        }}
      />


      {/* Page 0 Cover & Pinned Scroll Story Reveal */}
      <PhotoCoverSplit />

      {/* Page 1 Ventures Integrated Section */}
      <VenturesSection />

      {/* Page 2 Achievements Spatial Scroll-Driven Section */}
      <DisciplinesScrollSection />

      {/* Page 3 Technical Skills Terminal Section */}
      <TechnicalSkillsTerminal />
    </main>
  );
}

'use client';

import { DisciplinesScrollSection } from '@/components/disciplines-scroll/DisciplinesScrollSection';
import { KaiForgeChapter } from '@/components/kaiforge/KaiForgeChapter';
import { PhotoCoverSplit } from '@/components/layout/PhotoCoverSplit';
import { PalindromeChapter } from '@/components/palindrome/PalindromeChapter';
import { Preloader } from '@/components/preloader/Preloader';
import { TechnicalSkillsTerminal } from '@/components/terminal/TechnicalSkillsTerminal';
import { VenturesSection } from '@/components/ventures/VenturesSection';
import { ProjectExperienceProvider } from '@/experience/ProjectExperienceProvider';
import { useLenis } from '@/motion/lenis/LenisProvider';

export default function Home() {
  const { refresh } = useLenis();

  return (
    <main className="relative w-full bg-[#0C0907]">
      {/* Preloader (Phase 1/2) */}
      <Preloader
        onComplete={() => {
          requestAnimationFrame(refresh);
        }}
      />

      {/* Page 0 Cover & Pinned Scroll Story Reveal */}
      <PhotoCoverSplit />

      <ProjectExperienceProvider>
        {/* Phase 2: accepted KaiForge spatial and camera greybox */}
        <KaiForgeChapter />

        {/* Phase 3: Palindrome domestic-information greybox */}
        <PalindromeChapter />
      </ProjectExperienceProvider>

      {/* Legacy Palindrome / NeuroShield index; redesign is intentionally deferred. */}
      <VenturesSection />

      {/* Page 2 Achievements Spatial Scroll-Driven Section */}
      <DisciplinesScrollSection />

      {/* Page 3 Technical Skills Terminal Section */}
      <TechnicalSkillsTerminal />
    </main>
  );
}

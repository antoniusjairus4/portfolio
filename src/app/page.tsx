'use client';

import { DisciplinesScrollSection } from '@/components/disciplines-scroll/DisciplinesScrollSection';
import { KaiForgeChapter } from '@/components/kaiforge/KaiForgeChapter';
import { PhotoCoverSplit } from '@/components/layout/PhotoCoverSplit';
import { NeuroShieldChapter } from '@/components/neuroshield/NeuroShieldChapter';
import { PalindromeChapter } from '@/components/palindrome/PalindromeChapter';
import { Preloader } from '@/components/preloader/Preloader';
import { SkillsChapter } from '@/components/skills/SkillsChapter';
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

        {/* Phase 4: NeuroShield research-uncertainty greybox */}
        <NeuroShieldChapter />

        {/* Phase 5: continuous spatial capability landscape */}
        <SkillsChapter />
      </ProjectExperienceProvider>

      {/* Page 2 Achievements Spatial Scroll-Driven Section */}
      <DisciplinesScrollSection />
    </main>
  );
}

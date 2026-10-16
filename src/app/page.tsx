'use client';

import { AchievementsChapter } from '@/components/achievements-kinetic/AchievementsChapter';
import { ContactFinale } from '@/components/contact-finale/ContactFinale';
import { KaiForgeChapter } from '@/components/kaiforge/KaiForgeChapter';
import { PhotoCoverSplit } from '@/components/layout/PhotoCoverSplit';
import { NeuroShieldChapter } from '@/components/neuroshield/NeuroShieldChapter';
import { PalindromeChapter } from '@/components/palindrome/PalindromeChapter';
import { Preloader } from '@/components/preloader/Preloader';
import { SkillsChapter } from '@/components/skills/SkillsChapter';
import { ProjectExperienceProvider } from '@/experience/ProjectExperienceProvider';
import { useLenis } from '@/motion/lenis/LenisProvider';
import { useState } from 'react';

export default function Home() {
  const { refresh } = useLenis();
  const [criticalReady, setCriticalReady] = useState(false);

  return (
    <main id="top" className="relative w-full bg-[#0C0907]">
      {/* Preloader (Phase 1/2) */}
      <Preloader
        onComplete={() => {
          setCriticalReady(true);
          requestAnimationFrame(() => {
            refresh();
            requestAnimationFrame(() => {
              const targetId = decodeURIComponent(window.location.hash.slice(1));
              if (targetId) {
                document.getElementById(targetId)?.scrollIntoView({ behavior: 'instant' });
                return;
              }

              const navigation = performance.getEntriesByType(
                'navigation',
              )[0] as PerformanceNavigationTiming;
              const state = history.state as { __portfolioScrollY?: unknown } | null;
              if (navigation?.type === 'reload' || navigation?.type === 'navigate') {
                window.scrollTo({ top: 0, behavior: 'instant' });
                return;
              }
              if (
                navigation?.type === 'back_forward' &&
                typeof state?.__portfolioScrollY === 'number'
              ) {
                window.scrollTo({ top: state.__portfolioScrollY, behavior: 'instant' });
              }
            });
          });
        }}
      />

      {/* Page 0 Cover & Pinned Scroll Story Reveal */}
      <PhotoCoverSplit />

      <ProjectExperienceProvider criticalReady={criticalReady}>
        {/* Phase 2: accepted KaiForge spatial and camera greybox */}
        <KaiForgeChapter />

        {/* Phase 3: Palindrome domestic-information greybox */}
        <PalindromeChapter />

        {/* Phase 4: NeuroShield research-uncertainty greybox */}
        <NeuroShieldChapter />

        {/* Phase 5: continuous spatial capability landscape */}
        <SkillsChapter />
      </ProjectExperienceProvider>

      {/* Phase 6: kinetic editorial achievements sequence */}
      <AchievementsChapter />

      {/* Phase 7: quiet contact and document end */}
      <ContactFinale />
    </main>
  );
}

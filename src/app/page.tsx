'use client';

import { useEffect, useState } from 'react';
import { AchievementsChapter } from '@/components/achievements-kinetic/AchievementsChapter';
import { AchievementsContactLanyard } from '@/components/contact-finale/AchievementsContactLanyard';
import { ContactFinale } from '@/components/contact-finale/ContactFinale';
import { KaiForgeChapter } from '@/components/kaiforge/KaiForgeChapter';
import { PhotoCoverSplit } from '@/components/layout/PhotoCoverSplit';
import { NeuroShieldChapter } from '@/components/neuroshield/NeuroShieldChapter';
import { PalindromeChapter } from '@/components/palindrome/PalindromeChapter';
import { SkillsChapter } from '@/components/skills/SkillsChapter';
import { KaiPalindromeBridge } from '@/components/transitions/KaiPalindromeBridge';
import { PalindromeNeuroShieldBridge } from '@/components/transitions/PalindromeNeuroShieldBridge';
import { ProjectExperienceProvider } from '@/experience/ProjectExperienceProvider';
import { useLenis } from '@/motion/lenis/LenisProvider';

declare global {
  interface Window {
    __portfolioInitialScrollY?: number;
  }
}

export default function Home() {
  const { refresh } = useLenis();
  const [criticalReady, setCriticalReady] = useState(false);

  useEffect(() => {
    setCriticalReady(true);
    requestAnimationFrame(() => {
      refresh();
      requestAnimationFrame(() => {
        const targetId = decodeURIComponent(window.location.hash.slice(1));
        if (targetId) {
          document.getElementById(targetId)?.scrollIntoView({ behavior: 'instant' });
          return;
        }

        const savedScrollY = window.__portfolioInitialScrollY;
        const targetScrollY =
          typeof savedScrollY === 'number' && Number.isFinite(savedScrollY)
            ? Math.max(0, savedScrollY)
            : 0;
        const restorationStartedAt = performance.now();

        const restoreScrollPosition = () => {
          window.scrollTo({ top: targetScrollY, behavior: 'instant' });
          refresh();

          const waitingForLayout =
            Math.abs(window.scrollY - targetScrollY) > 1 &&
            performance.now() - restorationStartedAt < 1500;
          if (waitingForLayout) requestAnimationFrame(restoreScrollPosition);
        };

        restoreScrollPosition();
      });
    });
  }, [refresh]);

  return (
    <main id="top" className="relative w-full bg-[#0C0907]">
      {/* Page 0 Cover & Pinned Scroll Story Reveal */}
      <PhotoCoverSplit />

      <ProjectExperienceProvider criticalReady={criticalReady}>
        {/* Phase 2: accepted KaiForge spatial and camera greybox */}
        <KaiForgeChapter />

        <KaiPalindromeBridge />

        {/* Phase 3: Palindrome domestic-information greybox */}
        <PalindromeChapter />

        <PalindromeNeuroShieldBridge />

        {/* Phase 4: NeuroShield research-uncertainty greybox */}
        <NeuroShieldChapter />

        {/* Phase 5: continuous spatial capability landscape */}
        <SkillsChapter />

        {/* Phase 6: kinetic editorial achievements sequence */}
        <AchievementsChapter />
      </ProjectExperienceProvider>

      {/* Phase 7: quiet contact and document end */}
      <ContactFinale />

      {/* One continuous physical rig spanning the Achievements finale and Contact. */}
      <AchievementsContactLanyard />
    </main>
  );
}

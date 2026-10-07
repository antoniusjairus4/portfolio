import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

async function captureAchievementsInitial() {
  const screenshotDir = path.resolve('public/images/screenshots/achievements-before');
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

  const browser = await chromium.launch();

  // Desktop 1440x900
  const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktopPage.goto('http://localhost:3000');

  const skipBtn = desktopPage.getByRole('button', { name: 'Skip' });
  if (await skipBtn.isVisible()) {
    await skipBtn.click();
    await desktopPage.waitForTimeout(1000);
  }

  // Scroll window to position of achievements section
  await desktopPage.evaluate(() => {
    const el = document.getElementById('achievements-section');
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: 'instant' });
    }
  });
  await desktopPage.waitForTimeout(500);

  const speakingNode = desktopPage.locator('h3', { hasText: 'Speaking' });
  await desktopPage.screenshot({ path: path.join(screenshotDir, 'achievements-nodes-desktop-1440.png') });

  if (await speakingNode.isVisible()) {
    await speakingNode.click({ force: true });
    await desktopPage.waitForTimeout(600);
    await desktopPage.screenshot({ path: path.join(screenshotDir, 'achievements-speaking-detail-desktop-1440.png') });
  }

  // Mobile 390x844
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto('http://localhost:3000');

  const mobileSkipBtn = mobilePage.getByRole('button', { name: 'Skip' });
  if (await mobileSkipBtn.isVisible()) {
    await mobileSkipBtn.click();
    await mobilePage.waitForTimeout(1000);
  }

  await mobilePage.evaluate(() => {
    const el = document.getElementById('achievements-section');
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: 'instant' });
    }
  });
  await mobilePage.waitForTimeout(500);

  const mobileSpeakingNode = mobilePage.locator('h3', { hasText: 'Speaking' });
  await mobilePage.screenshot({ path: path.join(screenshotDir, 'achievements-nodes-mobile-390.png') });

  if (await mobileSpeakingNode.isVisible()) {
    await mobileSpeakingNode.click({ force: true });
    await mobilePage.waitForTimeout(600);
    await mobilePage.screenshot({ path: path.join(screenshotDir, 'achievements-speaking-detail-mobile-390.png') });
  }

  await browser.close();
  console.log('Saved initial state screenshots to public/images/screenshots/achievements-before/');
}

captureAchievementsInitial().catch(console.error);

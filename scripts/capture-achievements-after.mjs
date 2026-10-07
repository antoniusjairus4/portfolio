import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

async function captureAchievementsAfter() {
  const screenshotDir = path.resolve('public/images/screenshots/achievements-after');
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

  const browser = await chromium.launch();

  const disciplines = ['Speaking', 'Karate', 'Table Tennis', 'Chess', 'Music'];

  // Desktop 1440x900
  const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktopPage.goto('http://localhost:3000');

  const skipBtn = desktopPage.getByRole('button', { name: 'Skip' });
  if (await skipBtn.isVisible()) {
    await skipBtn.click();
    await desktopPage.waitForTimeout(500);
  }

  await desktopPage.evaluate(() => {
    const el = document.getElementById('achievements-section');
    if (el) el.scrollIntoView();
  });
  await desktopPage.waitForTimeout(600);

  // Capture node stage
  await desktopPage.screenshot({ path: path.join(screenshotDir, 'achievements-nodes-desktop-1440.png') });

  // Capture detail view for all 5 disciplines at 1440
  for (const title of disciplines) {
    const node = desktopPage.locator('div[role="button"]', { hasText: title });
    await node.click({ force: true });
    await desktopPage.waitForTimeout(600);
    const slug = title.toLowerCase().replace(/\s+/g, '-');
    await desktopPage.screenshot({ path: path.join(screenshotDir, `detail-${slug}-desktop-1440.png`) });

    const closeBtn = desktopPage.getByRole('button', { name: 'CLOSE' });
    await closeBtn.click();
    await desktopPage.waitForTimeout(500);
  }

  // Mobile 390x844
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto('http://localhost:3000');

  const mobileSkipBtn = mobilePage.getByRole('button', { name: 'Skip' });
  if (await mobileSkipBtn.isVisible()) {
    await mobileSkipBtn.click();
    await mobilePage.waitForTimeout(500);
  }

  await mobilePage.evaluate(() => {
    const el = document.getElementById('achievements-section');
    if (el) el.scrollIntoView();
  });
  await mobilePage.waitForTimeout(600);

  await mobilePage.screenshot({ path: path.join(screenshotDir, 'achievements-nodes-mobile-390.png') });

  // Capture detail view for all 5 disciplines at 390
  for (const title of disciplines) {
    const node = mobilePage.locator('div[role="button"]', { hasText: title });
    await node.click({ force: true });
    await mobilePage.waitForTimeout(600);
    const slug = title.toLowerCase().replace(/\s+/g, '-');
    await mobilePage.screenshot({ path: path.join(screenshotDir, `detail-${slug}-mobile-390.png`) });

    const closeBtn = mobilePage.getByRole('button', { name: 'CLOSE' });
    await closeBtn.click();
    await mobilePage.waitForTimeout(500);
  }

  await browser.close();
  console.log('Saved all discipline screenshots to public/images/screenshots/achievements-after/');
}

captureAchievementsAfter().catch(console.error);

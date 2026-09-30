import fs from 'node:fs';
import path from 'node:path';
import { chromium, devices } from '@playwright/test';

async function captureStoryBeats() {
  const screenshotDir = path.resolve('public/images/screenshots');
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

  const browser = await chromium.launch();

  // Desktop Page (1280x720)
  const desktopPage = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  console.log('--- DESKTOP SCROLL STORY BEATS VERIFICATION ---');
  await desktopPage.goto('http://localhost:3000');

  // Skip preloader
  const skipBtn = desktopPage.getByRole('button', { name: 'Skip' });
  if (await skipBtn.isVisible()) {
    await skipBtn.click();
  }
  await desktopPage.waitForTimeout(1000);

  // Total pinned distance: 3.5 * 720 = 2520px
  const totalDistance = 3.5 * 720;
  const percentages = [0, 0.20, 0.45, 0.75, 1.0];

  for (const p of percentages) {
    const scrollY = Math.round(p * totalDistance);
    await desktopPage.evaluate((pos) => window.scrollTo(0, pos), scrollY);
    await desktopPage.waitForTimeout(250);

    const stepInfo = await desktopPage.evaluate(() => {
      const container = document.querySelector('section[aria-label*="Full-screen photo cover"]');
      const left = container?.children[1];
      const right = container?.children[2];
      const textWrapper = container?.querySelector('div > div');
      return {
        scrollY: window.scrollY,
        leftTransform: left ? window.getComputedStyle(left).transform : 'NONE',
        rightTransform: right ? window.getComputedStyle(right).transform : 'NONE',
        textTransform: textWrapper ? window.getComputedStyle(textWrapper).transform : 'NONE',
        textOpacity: textWrapper ? window.getComputedStyle(textWrapper).opacity : 'NONE',
      };
    });

    const filename = `beat-${Math.round(p * 100)}pct.png`;
    await desktopPage.screenshot({ path: path.join(screenshotDir, filename) });
    console.log(`Saved: ${filename} (Scroll Y: ${scrollY}px, Left: ${stepInfo.leftTransform}, TextOpacity: ${stepInfo.textOpacity})`);
  }

  // Mobile Context (390x844 iPhone 12) - Beat B (45%)
  const mobilePage = await browser.newPage({ ...devices['iPhone 12'] });
  console.log('\n--- PORTRAIT PHONE BEAT B VERIFICATION ---');
  await mobilePage.goto('http://localhost:3000');

  const mobileSkipBtn = mobilePage.getByRole('button', { name: 'Skip' });
  if (await mobileSkipBtn.isVisible()) {
    await mobileSkipBtn.click();
  }
  await mobilePage.waitForTimeout(1000);

  const mobileBeatB = Math.round(0.45 * 3.5 * 844);
  await mobilePage.evaluate((pos) => window.scrollTo(0, pos), mobileBeatB);
  await mobilePage.waitForTimeout(250);

  await mobilePage.screenshot({ path: path.join(screenshotDir, 'beat-b-mobile-portrait.png') });
  console.log('Saved: beat-b-mobile-portrait.png');

  await browser.close();
  console.log('\nAll Phase 2 story beat screenshots saved to public/images/screenshots/');
}

captureStoryBeats().catch(console.error);

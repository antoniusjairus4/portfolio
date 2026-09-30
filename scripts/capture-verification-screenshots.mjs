import fs from 'node:fs';
import path from 'node:path';
import { chromium, devices } from '@playwright/test';

async function captureVerification() {
  const screenshotDir = path.resolve('public/images/screenshots');
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

  const browser = await chromium.launch();

  // Desktop Context (1280x720)
  const desktopPage = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  console.log('--- DESKTOP VERIFICATION ---');
  await desktopPage.goto('http://localhost:3000');

  // Capture ball at highest bounce on desktop
  await desktopPage.waitForTimeout(400); // During first high bounce (~55-65% viewport)
  await desktopPage.screenshot({ path: path.join(screenshotDir, 'ball-desktop-high-bounce.png') });
  console.log('Saved: ball-desktop-high-bounce.png');

  // Skip preloader
  const skipBtn = desktopPage.getByRole('button', { name: 'Skip' });
  if (await skipBtn.isVisible()) {
    await skipBtn.click();
  }
  await desktopPage.waitForTimeout(1000);

  // Scroll distance: 1 viewport height (720px)
  const totalDistance = 720;
  const percentages = [0, 0.35, 0.70, 1.0];
  const results = {};

  for (const p of percentages) {
    const scrollY = Math.round(p * totalDistance);
    await desktopPage.evaluate((pos) => window.scrollTo(0, pos), scrollY);
    await desktopPage.waitForTimeout(250);

    const stepInfo = await desktopPage.evaluate(() => {
      const container = document.querySelector('section[aria-label*="Full-screen photo cover"]');
      const left = container?.children[1];
      const right = container?.children[2];
      return {
        scrollY: window.scrollY,
        leftTransform: left ? window.getComputedStyle(left).transform : 'NONE',
        rightTransform: right ? window.getComputedStyle(right).transform : 'NONE',
      };
    });

    results[`${Math.round(p * 100)}%`] = stepInfo;
    const filename = `split-desktop-${Math.round(p * 100)}pct.png`;
    await desktopPage.screenshot({ path: path.join(screenshotDir, filename) });
    console.log(`Saved: ${filename} (Scroll Y: ${scrollY}px, Left: ${stepInfo.leftTransform}, Right: ${stepInfo.rightTransform})`);
  }

  // Mobile Context (390x844 iPhone 12/13/14)
  const mobilePage = await browser.newPage({ ...devices['iPhone 12'] });
  console.log('\n--- PORTRAIT PHONE VERIFICATION ---');
  await mobilePage.goto('http://localhost:3000');
  await mobilePage.waitForTimeout(400); // Ball high bounce on portrait phone
  await mobilePage.screenshot({ path: path.join(screenshotDir, 'ball-mobile-high-bounce.png') });
  console.log('Saved: ball-mobile-high-bounce.png');

  await browser.close();
  console.log('\nAll verification screenshots saved to public/images/screenshots/');
}

captureVerification().catch(console.error);

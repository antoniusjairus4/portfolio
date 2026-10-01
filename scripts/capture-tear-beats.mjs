import fs from 'fs';
import path from 'path';
import { chromium } from '@playwright/test';

async function capturePhase3Tear() {
  const screenshotDir = path.resolve('public/images/screenshots');
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

  const browser = await chromium.launch();

  const viewports = [
    { width: 1440, height: 900, name: 'desktop-1440', expectedStrips: 7 },
    { width: 900, height: 720, name: 'tablet-900', expectedStrips: 5 },
    { width: 390, height: 844, name: 'mobile-390', expectedStrips: 4 },
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    console.log(`--- CAPTURING TEAR BEATS: ${vp.name} ---`);
    await page.goto('http://localhost:3000');

    // Skip preloader
    const skipBtn = page.getByRole('button', { name: 'Skip' });
    if (await skipBtn.isVisible()) {
      await skipBtn.click();
    }
    await page.waitForTimeout(600);

    // Total scroll distance: 570vh
    const totalDist = vp.height * 5.7;

    // Beat D Tear Progress points (0%, 25%, 50%, 75%, 100% of Beat D)
    // Beat D is 61% -> 100% of total scroll story
    const tearPercentages = [0, 0.25, 0.50, 0.75, 1.0];

    for (const tp of tearPercentages) {
      const storyPercent = 0.61 + tp * 0.39;
      const scrollY = Math.round(storyPercent * totalDist);
      await page.evaluate((pos) => window.scrollTo(0, pos), scrollY);
      await page.waitForTimeout(300);

      const filename = `tear-${vp.name}-${Math.round(tp * 100)}pct.png`;
      await page.screenshot({ path: path.join(screenshotDir, filename) });

      // Verify canvas data-strips attribute
      const canvasStrips = await page.evaluate(() => {
        const canvasDiv = document.querySelector('div[data-strips]');
        return canvasDiv ? parseInt(canvasDiv.getAttribute('data-strips') || '0', 10) : 0;
      });

      console.log(`Saved: ${filename} (Scroll Y: ${scrollY}px, data-strips: ${canvasStrips})`);
    }

    await page.close();
  }

  await browser.close();
  console.log('All Phase 3 tear screenshots captured!');
}

capturePhase3Tear().catch(console.error);

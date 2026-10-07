import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

async function captureTemplateScreenshots() {
  const screenshotDir = path.resolve('public/images/screenshots/achievements-template');
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

  const browser = await chromium.launch();

  const disciplines = ['Speaking', 'Table Tennis', 'Karate', 'Chess', 'Music'];

  // Desktop 1440x900
  const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktopPage.goto('http://localhost:3000');

  const skipBtn = desktopPage.getByRole('button', { name: 'Skip' });
  if (await skipBtn.isVisible()) {
    await skipBtn.click();
    await desktopPage.waitForTimeout(500);
  }

  const section = desktopPage.locator('#achievements-section');
  await section.scrollIntoViewIfNeeded();
  await desktopPage.waitForTimeout(500);

  // Desktop node stage
  await desktopPage.screenshot({ path: path.join(screenshotDir, '00-nodes-desktop-1440.png') });

  for (const title of disciplines) {
    const node = desktopPage.locator('h3', { hasText: title });
    if (await node.isVisible()) {
      await node.click({ force: true });
      await desktopPage.waitForTimeout(800);
      const slug = title.toLowerCase().replace(/\s+/g, '-');
      await desktopPage.screenshot({ path: path.join(screenshotDir, `template-${slug}-desktop-1440.png`) });

      const closeBtn = desktopPage.getByRole('button', { name: 'Close detail view' });
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
        await desktopPage.waitForTimeout(400);
      }
    }
  }

  // Mobile 390x844
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto('http://localhost:3000');

  const mobileSkipBtn = mobilePage.getByRole('button', { name: 'Skip' });
  if (await mobileSkipBtn.isVisible()) {
    await mobileSkipBtn.click();
    await mobilePage.waitForTimeout(500);
  }

  const mobileSection = mobilePage.locator('#achievements-section');
  await mobileSection.scrollIntoViewIfNeeded();
  await mobilePage.waitForTimeout(500);

  await mobilePage.screenshot({ path: path.join(screenshotDir, '00-nodes-mobile-390.png') });

  for (const title of disciplines) {
    const node = mobilePage.locator('h3', { hasText: title });
    if (await node.isVisible()) {
      await node.click({ force: true });
      await mobilePage.waitForTimeout(800);
      const slug = title.toLowerCase().replace(/\s+/g, '-');
      await mobilePage.screenshot({ path: path.join(screenshotDir, `template-${slug}-mobile-390.png`) });

      const closeBtn = mobilePage.getByRole('button', { name: 'Close detail view' });
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
        await mobilePage.waitForTimeout(400);
      }
    }
  }

  await browser.close();
  console.log('Saved all template screenshots to public/images/screenshots/achievements-template/');
}

captureTemplateScreenshots().catch(console.error);

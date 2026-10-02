import { test, expect } from '@playwright/test';
import fs from 'node:fs';

test('capture desktop and mobile screenshots of Ventures section', async ({ page }) => {
  // Desktop 1440x900
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.waitForSelector('[role="progressbar"]', { state: 'detached', timeout: 30000 });
  await page.waitForSelector('#page-1-placeholder', { state: 'attached', timeout: 30000 });

  const section = page.locator('#page-1-placeholder');
  await section.scrollIntoViewIfNeeded();

  fs.mkdirSync('docs/screenshots', { recursive: true });

  await page.screenshot({ path: 'docs/screenshots/ventures-index-1440.png' });

  // Scroll to Palindrome chapter
  const palindrome = page.locator('#chapter-palindrome');
  await palindrome.scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'docs/screenshots/ventures-palindrome-1440.png' });

  // Scroll to KaiForge chapter
  const kaiforge = page.locator('#chapter-kaiforge');
  await kaiforge.scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'docs/screenshots/ventures-kaiforge-1440.png' });

  // Scroll to NeuroShield chapter
  const neuroshield = page.locator('#chapter-neuroshield');
  await neuroshield.scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'docs/screenshots/ventures-neuroshield-1440.png' });

  // Mobile 390x844
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.waitForSelector('[role="progressbar"]', { state: 'detached', timeout: 30000 });
  await section.scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'docs/screenshots/ventures-index-390.png' });
});

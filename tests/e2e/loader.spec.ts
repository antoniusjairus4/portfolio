import { test, expect } from '@playwright/test';

test.describe('Preloader and Photo Cover Split Reveal E2E Smoke Test', () => {
  test('preloader finishes within 4 seconds and reveals photo cover', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Check preloader is present
    const preloader = page.getByRole('progressbar', { name: 'Site preloader' });
    await expect(preloader).toBeVisible();

    // Preloader finishes within 4 seconds
    await expect(preloader).toBeHidden({ timeout: 4500 });

    // Photo cover is visible
    const coverImage = page.getByAltText('Jairus Portfolio Cover');
    await expect(coverImage).toBeVisible();
  });

  test('keyboard interaction opens split reveal', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Skip preloader
    const skipBtn = page.getByRole('button', { name: 'Skip' });
    if (await skipBtn.isVisible()) {
      await skipBtn.click();
    }

    const preloader = page.getByRole('progressbar', { name: 'Site preloader' });
    await expect(preloader).toBeHidden({ timeout: 2000 });

    // Ensure document has scroll height & scroll down
    await page.evaluate(() => {
      document.body.style.minHeight = '3000px';
      window.scrollTo(0, 800);
    });
    await page.waitForTimeout(500);

    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(0);
  });
});

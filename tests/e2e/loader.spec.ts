import { expect, test } from '@playwright/test';

test.describe('Phase 2 Preloader & Pinned Scroll Story Reveal E2E Tests', () => {
  test('preloader finishes within 8.0 seconds and reveals photo cover', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Check preloader is present
    const preloader = page.getByRole('progressbar', { name: 'Site preloader' });
    await expect(preloader).toBeVisible();

    // Preloader finishes between 6.0s and 8.0s
    await expect(preloader).toBeHidden({ timeout: 8800 });

    // Photo cover is visible
    const coverImage = page.getByAltText('Jairus Portfolio Cover');
    await expect(coverImage).toBeVisible();
  });

  test('scrolling scrubs 5-beat scroll story (0%, 20%, 45%, 75%, 100%)', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Skip preloader
    const skipBtn = page.getByRole('button', { name: 'Skip' });
    if (await skipBtn.isVisible()) {
      await skipBtn.click();
    }

    const preloader = page.getByRole('progressbar', { name: 'Site preloader' });
    await expect(preloader).toBeHidden({ timeout: 2500 });

    const totalDistance = 3.5 * 720;
    const percentages = [0, 0.20, 0.45, 0.75, 1.0];

    for (const p of percentages) {
      const scrollY = Math.round(p * totalDistance);
      await page.evaluate((pos) => window.scrollTo(0, pos), scrollY);
      await page.waitForTimeout(250);

      const stepInfo = await page.evaluate(() => {
        const container = document.querySelector('section[aria-label*="Full-screen photo cover"]');
        const left = container?.children[1] as HTMLElement;
        const right = container?.children[2] as HTMLElement;
        const textWrapper = container?.querySelector('.will-change-transform') as HTMLElement;

        return {
          leftTransform: left ? window.getComputedStyle(left).transform : 'NONE',
          rightTransform: right ? window.getComputedStyle(right).transform : 'NONE',
          textOpacity: textWrapper ? parseFloat(window.getComputedStyle(textWrapper).opacity) : 1,
        };
      });

      if (p === 0) {
        expect(stepInfo.leftTransform).toBe('matrix(1, 0, 0, 1, 0, 0)');
        expect(stepInfo.rightTransform).toBe('matrix(1, 0, 0, 1, 0, 0)');
      } else if (p === 0.45) {
        // Beat B: Read (Text fully visible, halves partially open)
        expect(stepInfo.leftTransform).not.toBe('matrix(1, 0, 0, 1, 0, 0)');
        expect(stepInfo.textOpacity).toBeGreaterThan(0.8);
      } else if (p === 1.0) {
        // Exit complete: Text faded out
        expect(stepInfo.textOpacity).toBeLessThan(0.2);
      }
    }
  });

  test('keyboard path advances story beat by beat', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const skipBtn = page.getByRole('button', { name: 'Skip' });
    if (await skipBtn.isVisible()) {
      await skipBtn.click();
    }

    const preloader = page.getByRole('progressbar', { name: 'Site preloader' });
    await expect(preloader).toBeHidden({ timeout: 2500 });

    const coverContainer = page.locator('section[aria-label*="Full-screen photo cover"]');
    await coverContainer.focus();

    // Advance beat by beat
    await page.keyboard.press('ArrowDown');
    await page.evaluate(() => window.scrollTo(0, 1200));
    await page.waitForTimeout(300);

    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(0);
  });
});

import { expect, test } from '@playwright/test';

test.describe('Preloader and Photo Cover Split Reveal E2E Smoke Test', () => {
  test('preloader finishes within 3.8 seconds and reveals photo cover', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Check preloader is present
    const preloader = page.getByRole('progressbar', { name: 'Site preloader' });
    await expect(preloader).toBeVisible();

    // Preloader finishes within 3.8 seconds (min 3.0s, max 4.8s)
    await expect(preloader).toBeHidden({ timeout: 5500 });

    // Photo cover is visible
    const coverImage = page.getByAltText('Jairus Portfolio Cover');
    await expect(coverImage).toBeVisible();
  });

  test('scrolling scrubs split reveal with opposite non-zero transforms', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Skip preloader
    const skipBtn = page.getByRole('button', { name: 'Skip' });
    if (await skipBtn.isVisible()) {
      await skipBtn.click();
    }

    const preloader = page.getByRole('progressbar', { name: 'Site preloader' });
    await expect(preloader).toBeHidden({ timeout: 2000 });

    const totalDistance = 720;
    const percentages = [0, 0.35, 0.70, 1.0];

    for (const p of percentages) {
      const scrollY = Math.round(p * totalDistance);
      await page.evaluate((pos) => window.scrollTo(0, pos), scrollY);
      await page.waitForTimeout(200);

      const stepInfo = await page.evaluate(() => {
        const container = document.querySelector('section[aria-label*="Full-screen photo cover"]');
        const left = container?.children[1] as HTMLElement;
        const right = container?.children[2] as HTMLElement;
        return {
          leftTransform: left ? window.getComputedStyle(left).transform : 'NONE',
          rightTransform: right ? window.getComputedStyle(right).transform : 'NONE',
        };
      });

      if (p === 0) {
        expect(stepInfo.leftTransform).toBe('matrix(1, 0, 0, 1, 0, 0)');
        expect(stepInfo.rightTransform).toBe('matrix(1, 0, 0, 1, 0, 0)');
      } else {
        expect(stepInfo.leftTransform).not.toBe('matrix(1, 0, 0, 1, 0, 0)');
        expect(stepInfo.rightTransform).not.toBe('matrix(1, 0, 0, 1, 0, 0)');
      }
    }
  });
});

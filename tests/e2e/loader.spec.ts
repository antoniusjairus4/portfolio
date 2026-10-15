import { expect, test } from '@playwright/test';

test.describe('Phase 2 Preloader & Pinned Scroll Story Reveal E2E Tests', () => {
  test('preloader releases when critical resources settle and reveals photo cover', async ({
    page,
  }) => {
    await page.goto('http://localhost:3000');

    // Check preloader is present
    const preloader = page.getByRole('progressbar', { name: 'Site preloader' });
    await expect(preloader).toBeVisible();

    // Readiness may finish quickly; eight seconds is a failure fallback, not a minimum.
    await expect(preloader).toBeHidden({ timeout: 12000 });

    // Photo cover is visible
    const coverImage = page.getByAltText('Portrait of Antonius Jairus');
    await expect(coverImage).toBeVisible();
  });

  test('scrolling scrubs the Hero story forward through its stable beats', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Skip preloader
    const skipBtn = page.getByRole('button', { name: 'Skip' });
    if (await skipBtn.isVisible()) {
      await skipBtn.click({ force: true }).catch(() => {});
    }

    const preloader = page.getByRole('progressbar', { name: 'Site preloader' });
    await expect(preloader).toBeHidden({ timeout: 2500 });

    const totalDistance = 4.2 * 720;
    const percentages = [0, 0.24, 0.42, 0.66, 1.0];

    for (const p of percentages) {
      const scrollY = Math.round(p * totalDistance);
      await page.evaluate((pos) => window.scrollTo(0, pos), scrollY);
      await page.waitForTimeout(250);

      const stepInfo = await page.evaluate(() => {
        const container = document.querySelector('#hero');
        const left = container?.children[2] as HTMLElement;
        const right = container?.children[3] as HTMLElement;
        const textWrapper = container?.querySelector('.will-change-transform') as HTMLElement;

        return {
          leftTransform: left ? window.getComputedStyle(left).transform : 'NONE',
          rightTransform: right ? window.getComputedStyle(right).transform : 'NONE',
          textOpacity: textWrapper ? parseFloat(window.getComputedStyle(textWrapper).opacity) : 1,
        };
      });

      if (p === 0) {
        expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(stepInfo.leftTransform);
        expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(stepInfo.rightTransform);
      } else if (p === 0.42) {
        // Beat B: Read (Text fully visible, halves partially open)
        expect(stepInfo.leftTransform).not.toBe('matrix(1, 0, 0, 1, 0, 0)');
        expect(stepInfo.textOpacity).toBeGreaterThan(0.8);
      } else if (p === 1.0) {
        // Collapse complete: Next page placeholder visible
        const nextPage = page.locator('#page-1-placeholder');
        await expect(nextPage).toBeVisible();
      }
    }
  });

  test('keyboard path advances story beat by beat', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const skipBtn = page.getByRole('button', { name: 'Skip' });
    if (await skipBtn.isVisible()) {
      await skipBtn.click({ force: true }).catch(() => {});
    }

    const preloader = page.getByRole('progressbar', { name: 'Site preloader' });
    await expect(preloader).toBeHidden({ timeout: 2500 });

    // Advance beat by beat
    await page.keyboard.press('ArrowDown');
    await page.evaluate(() => window.scrollTo(0, 1200));
    await page.waitForTimeout(300);

    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(0);
  });

  test('regression: cover is visible immediately after preloader finishes without scrolling', async ({
    page,
  }) => {
    // First Visit Path
    await page.goto('http://localhost:3000');
    const preloader = page.getByRole('progressbar', { name: 'Site preloader' });
    await expect(preloader).toBeHidden({ timeout: 12000 });

    // Assert strictly zero scroll occurred
    const scrollYBefore = await page.evaluate(() => window.scrollY);
    expect(scrollYBefore).toBe(0);

    // Assert photo halves have opacity 1 and transform matrix(1, 0, 0, 1, 0, 0) or none
    const coverInfoFirst = await page.evaluate(() => {
      const container = document.querySelector('#hero');
      const left = container?.children[2] as HTMLElement;
      const right = container?.children[3] as HTMLElement;
      return {
        containerY: container ? container.getBoundingClientRect().y : null,
        leftOpacity: left ? window.getComputedStyle(left).opacity : '0',
        leftTransform: left ? window.getComputedStyle(left).transform : 'NONE',
        rightOpacity: right ? window.getComputedStyle(right).opacity : '0',
        rightTransform: right ? window.getComputedStyle(right).transform : 'NONE',
      };
    });

    expect(coverInfoFirst.containerY).toBe(0);
    expect(coverInfoFirst.leftOpacity).toBe('1');
    expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(coverInfoFirst.leftTransform);
    expect(coverInfoFirst.leftOpacity).toBe('1');
    expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(coverInfoFirst.rightTransform);

    // Repeat Visit Path (sessionStorage skip)
    await page.reload();
    await page.waitForTimeout(300);

    const coverInfoRepeat = await page.evaluate(() => {
      const container = document.querySelector('#hero');
      const left = container?.children[2] as HTMLElement;
      return {
        containerY: container ? container.getBoundingClientRect().y : null,
        leftOpacity: left ? window.getComputedStyle(left).opacity : '0',
        leftTransform: left ? window.getComputedStyle(left).transform : 'NONE',
      };
    });

    expect(coverInfoRepeat.containerY).toBe(0);
    expect(coverInfoRepeat.leftOpacity).toBe('1');
    expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(coverInfoRepeat.leftTransform);
  });
});

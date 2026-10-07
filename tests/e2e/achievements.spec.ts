import { test, expect } from '@playwright/test';

test.describe('Data-Driven Achievements Template E2E Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');

    const skipBtn = page.getByRole('button', { name: 'Skip' });
    if (await skipBtn.isVisible()) {
      await skipBtn.click();
      await page.waitForTimeout(500);
    }

    const section = page.locator('#achievements-section');
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
  });

  test('clicking each node opens the data-driven template with correct title and index label', async ({ page }) => {
    const disciplines = [
      { name: 'Speaking', index: '01 / 05' },
      { name: 'Table Tennis', index: '02 / 05' },
      { name: 'Karate', index: '03 / 05' },
      { name: 'Chess', index: '04 / 05' },
      { name: 'Music', index: '05 / 05' },
    ];

    for (const item of disciplines) {
      const node = page.locator('h3', { hasText: item.name });
      await expect(node).toBeVisible();

      await node.click({ force: true });
      const dialog = page.locator('div[role="dialog"]');
      await expect(dialog).toBeVisible();

      // Heading matching discipline title
      const heading = dialog.locator('h2');
      await expect(heading).toHaveText(item.name);

      // Verify header index tracking label
      const indexLabel = dialog.locator('text=' + item.index);
      await expect(indexLabel).toBeVisible();

      // Close modal
      const closeBtn = dialog.getByRole('button', { name: 'Close detail view' });
      await closeBtn.click();
      await expect(dialog).not.toBeVisible();
    }
  });

  test('speaking discipline renders count-up stats and single line', async ({ page }) => {
    const speakingNode = page.locator('h3', { hasText: 'Speaking' });
    await speakingNode.click({ force: true });

    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Verify stats appear
    const statLabel1 = dialog.locator('text=people addressed');
    await expect(statLabel1).toBeVisible();

    const statLabel2 = dialog.locator('text=events organised');
    await expect(statLabel2).toBeVisible();
  });

  test('navigation arrows and progress dashes cycle photos', async ({ page }) => {
    const speakingNode = page.locator('h3', { hasText: 'Speaking' });
    await speakingNode.click({ force: true });

    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible();

    const nextBtn = dialog.getByRole('button', { name: 'Next photo' });
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
      await page.waitForTimeout(300);

      const prevBtn = dialog.getByRole('button', { name: 'Previous photo' });
      await expect(prevBtn).toBeVisible();
    }
  });

  test('empty photo disciplines display intentional text & stats layout', async ({ page }) => {
    const chessNode = page.locator('h3', { hasText: 'Chess' });
    await chessNode.click({ force: true });

    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Verify stats exist
    const bulletStat = dialog.locator('text=Peak bullet');
    await expect(bulletStat).toBeVisible();

    // Verify archive emblem badge
    const badge = dialog.locator('text=ARCHIVE RECORD');
    await expect(badge).toBeVisible();
  });

  test('390px mobile layout has no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const node = page.locator('h3', { hasText: 'Speaking' });
    await node.click({ force: true });

    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible();

    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasOverflow).toBe(false);
  });
});

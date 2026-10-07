import { test, expect } from '@playwright/test';

test.describe('Achievements Detail View E2E Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Skip preloader
    const skipBtn = page.getByRole('button', { name: 'Skip' });
    if (await skipBtn.isVisible()) {
      await skipBtn.click();
      await page.waitForTimeout(500);
    }

    // Scroll to achievements section
    const section = page.locator('#achievements-section');
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
  });

  test('clicking each node opens the dialog with proper discipline title & full text', async ({ page }) => {
    const nodes = ['Speaking', 'Karate', 'Table Tennis', 'Chess', 'Music'];

    for (const title of nodes) {
      const node = page.locator('h3', { hasText: title });
      await expect(node).toBeVisible();

      await node.click({ force: true });
      const dialog = page.locator('div[role="dialog"]');
      await expect(dialog).toBeVisible();

      const heading = dialog.locator('h2');
      await expect(heading).toHaveText(title);

      // Verify close button exists
      const closeBtn = dialog.getByRole('button', { name: 'Close detail view' });
      await expect(closeBtn).toBeVisible();

      // Close dialog
      await closeBtn.click();
      await expect(dialog).not.toBeVisible();
    }
  });

  test('mouse movement does not close the dialog', async ({ page }) => {
    const speakingNode = page.locator('h3', { hasText: 'Speaking' });
    await speakingNode.click({ force: true });

    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Move mouse across the screen
    await page.mouse.move(100, 100);
    await page.mouse.move(500, 500);
    await page.mouse.move(800, 200);
    await page.waitForTimeout(500);

    // Dialog should remain open
    await expect(dialog).toBeVisible();
  });

  test('Escape key, close button, and backdrop click close the dialog', async ({ page }) => {
    const speakingNode = page.locator('h3', { hasText: 'Speaking' });

    // 1. Close via Escape key
    await speakingNode.click({ force: true });
    const dialog1 = page.locator('div[role="dialog"]');
    await expect(dialog1).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog1).not.toBeVisible();

    // 2. Close via backdrop click
    await speakingNode.click({ force: true });
    const dialog2 = page.locator('div[role="dialog"]');
    await expect(dialog2).toBeVisible();
    const backdrop = dialog2.locator('div[title="Click background to close"]');
    await backdrop.click({ position: { x: 50, y: 50 } });
    await expect(dialog2).not.toBeVisible();
  });

  test('focus returns to originating node on close', async ({ page }) => {
    const speakingNode = page.locator('div[role="button"]', { hasText: 'Speaking' });
    await speakingNode.focus();
    await page.keyboard.press('Enter');

    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();

    // Verify focus returned to speaking button
    await expect(speakingNode).toBeFocused();
  });

  test('disciplines without photos render intentional text-only fallback layout', async ({ page }) => {
    const chessNode = page.locator('h3', { hasText: 'Chess' });
    await chessNode.click({ force: true });

    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible();

    const fallback = dialog.locator('text=Discipline records & archives held in physical trophies');
    await expect(fallback).toBeVisible();
  });

  test('390px mobile layout has no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const node = page.locator('h3', { hasText: 'Speaking' });
    await node.click({ force: true });

    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible();

    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(overflow).toBe(false);
  });
});

import { test, expect } from '@playwright/test';

test.describe('Ventures Section E2E Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for preloader transition to complete
    await page.waitForSelector('[role="progressbar"]', { state: 'detached', timeout: 30000 });
    await page.waitForSelector('#page-1-placeholder', { state: 'attached', timeout: 30000 });
  });

  test('renders index with three product names in fixed order', async ({ page }) => {
    const section = page.locator('#page-1-placeholder');
    await expect(section).toBeVisible();

    const names = section.locator('.venture-index-name a');
    await expect(names).toHaveCount(3);
    await expect(names.nth(0)).toHaveText('PALINDROME');
    await expect(names.nth(1)).toHaveText('KAIFORGE');
    await expect(names.nth(2)).toHaveText('NEUROSHIELD');
  });

  test('verifies Palindrome Tamper Test demo breaking state & reset', async ({ page }) => {
    const demo = page.locator('#demo-palindrome');
    await demo.scrollIntoViewIfNeeded();
    await expect(demo).toBeVisible();

    const block1Input = demo.locator('input').nth(0);
    await block1Input.fill('Tampered transaction data $999,999');

    // Downstream block breaking alert should appear
    const alert = demo.locator('[role="alert"]');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText('Chain broken at block 2');

    // Click Restore Chain inside alert banner
    const restoreBtn = alert.locator('button', { hasText: 'Restore Chain' });
    await restoreBtn.click({ force: true });
    await expect(alert).not.toBeVisible();
  });

  test('verifies KaiForge Shot Sandbox trajectory calculation', async ({ page }) => {
    const demo = page.locator('#demo-kaiforge');
    await demo.scrollIntoViewIfNeeded();
    await expect(demo).toBeVisible();

    const svgTrail = demo.locator('svg polyline');
    await expect(svgTrail).toBeVisible();
  });

  test('verifies NeuroShield MRI slice scrubber slider', async ({ page }) => {
    const demo = page.locator('#demo-neuroshield');
    await demo.scrollIntoViewIfNeeded();
    await expect(demo).toBeVisible();

    const slider = demo.locator('input[type="range"]');
    await expect(slider).toBeVisible();
    await slider.fill('7');
    await expect(demo.locator('text=SLICE 8 / 10')).toBeVisible();
  });
});

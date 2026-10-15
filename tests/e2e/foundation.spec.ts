import { expect, test } from '@playwright/test';

test('preloader locks document scrolling and always releases it', async ({ page }) => {
  await page.route(/\/images\/cover-1536\.(avif|webp|jpeg)$/, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    await route.continue();
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const preloader = page.getByRole('progressbar', { name: 'Site preloader' });
  await expect(preloader).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.style.overflow))
    .toBe('hidden');
  await page.keyboard.press('PageDown');
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await expect(preloader).toBeHidden({ timeout: 12000 });
  await expect
    .poll(() => page.evaluate(() => document.documentElement.style.overflow))
    .not.toBe('hidden');
  await page.locator('section[aria-label*="Full-screen photo cover"]').focus();
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
});

test('reduced motion bypasses decorative waiting and retains normal scrolling', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('progressbar', { name: 'Site preloader' })).toBeHidden({
    timeout: 3000,
  });
  await expect(page.getByAltText('Jairus Portfolio Cover')).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.style.overflow))
    .not.toBe('hidden');
});

test('failed critical image does not leave the page locked', async ({ page }) => {
  await page.route(/\/images\/cover-.*\.(avif|webp|jpeg)$/, (route) => route.abort());
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('progressbar', { name: 'Site preloader' })).toBeHidden({
    timeout: 12000,
  });
  await expect
    .poll(() => page.evaluate(() => document.documentElement.style.overflow))
    .not.toBe('hidden');
});

test('refresh preserves the browser scroll position', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('progressbar', { name: 'Site preloader' })).toBeHidden({
    timeout: 12000,
  });
  await page.evaluate(() => window.scrollTo(0, 500));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await page.reload();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
});

test('existing chapters remain reachable in both scroll directions after resize', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('progressbar', { name: 'Site preloader' })).toBeHidden({
    timeout: 12000,
  });

  for (const selector of [
    '#page-1-placeholder',
    '#achievements-section',
    '#technical-skills-section',
  ]) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await expect(page.locator(selector)).toBeVisible();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('section[aria-label*="Full-screen photo cover"]').scrollIntoViewIfNeeded();
  await expect(page.getByAltText('Jairus Portfolio Cover')).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.style.overflow))
    .not.toBe('hidden');
});

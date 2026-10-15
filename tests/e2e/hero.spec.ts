import { expect, test } from '@playwright/test';

async function enterSite(page: import('@playwright/test').Page) {
  await page.goto('/');
  const skip = page.getByRole('button', { name: 'Skip' });
  if (await skip.isVisible()) await skip.click({ force: true }).catch(() => {});
  await expect(page.getByRole('progressbar', { name: 'Site preloader' })).toBeHidden({
    timeout: 12000,
  });
}

test('full identity and handoff contract are available in semantic HTML', async ({ page }) => {
  await enterSite(page);
  await expect(page.getByRole('heading', { level: 1, name: 'ANTONIUS JAIRUS' })).toBeAttached();
  await expect(page.locator('#hero')).toHaveAttribute('data-hero-handoff', 'center-seam');
});

test('forward, reverse, and rapid scroll derive deterministic Hero states', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enterSite(page);
  const hero = page.locator('#hero');
  const distance = 900 * 4.2;

  await page.evaluate((position) => window.scrollTo(0, position), distance * 0.3);
  await expect(hero).toHaveAttribute('data-hero-state', 'identity');

  await page.evaluate((position) => window.scrollTo(0, position), distance);
  await expect(hero).toHaveAttribute('data-hero-state', 'handoff');

  await page.evaluate((position) => window.scrollTo(0, position), distance * 0.1);
  await expect(hero).toHaveAttribute('data-hero-state', 'opening');

  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(hero).toHaveAttribute('data-hero-state', 'portrait');
});

for (const viewport of [
  { width: 320, height: 700 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
]) {
  test(`${viewport.width}x${viewport.height} Hero has no horizontal overflow`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await enterSite(page);
    await page.evaluate((height) => window.scrollTo(0, height * 4.2 * 0.3), viewport.height);
    await expect(page.locator('#hero')).toHaveAttribute('data-hero-state', 'identity');
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  });
}

test('reduced motion exposes portrait and complete identity without a pinned story', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await enterSite(page);
  const hero = page.locator('#hero');
  await expect(hero).toHaveAttribute('data-reduced-motion', 'true');
  await expect(page.getByRole('heading', { level: 1, name: 'ANTONIUS JAIRUS' })).toBeVisible();
  await expect(page.getByAltText('Portrait of Antonius Jairus')).toBeVisible();
  expect(
    await hero.evaluate((element) => element.parentElement?.classList.contains('pin-spacer')),
  ).toBe(false);
});

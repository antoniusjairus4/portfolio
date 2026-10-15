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
  await expect(page.locator('[data-hero-surface="editorial"]')).toHaveCount(1);
  await expect(page.locator('.hero-editorial-accent')).toHaveCount(0);
  await expect(page.locator('.hero-crimson-rupture')).toHaveCount(1);
  await expect(page.locator('#hero img[src*="after_split"]')).toHaveCount(0);
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

test('typographic split opens and reconstructs from scroll progress', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enterSite(page);
  const hero = page.locator('#hero');
  const lines = page.locator('.hero-name-line');
  const distance = 900 * 4.2;

  await page.evaluate((position) => window.scrollTo(0, position), distance * 0.78);
  await expect(hero).toHaveAttribute('data-hero-depth', 'active');
  await expect
    .poll(async () => {
      const [antoniusY, jairusY] = await lines.evaluateAll((elements) =>
        elements.map(
          (element) => new DOMMatrixReadOnly(window.getComputedStyle(element).transform).m42,
        ),
      );
      return { antoniusMovesUp: antoniusY < 0, jairusMovesDown: jairusY > 0 };
    })
    .toEqual({ antoniusMovesUp: true, jairusMovesDown: true });

  await page.evaluate((position) => window.scrollTo(0, position), distance * 0.58);
  await expect(hero).toHaveAttribute('data-hero-depth', 'inactive');
  await expect(hero).toHaveCSS('--hero-opening', '0.0000');
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

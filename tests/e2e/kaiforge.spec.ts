import { expect, type Page, test } from '@playwright/test';

async function enterSite(page: Page) {
  await page.goto('/');
  const skip = page.getByRole('button', { name: 'Skip' });
  if (await skip.isVisible()) await skip.click({ force: true }).catch(() => {});
  await expect(page.getByRole('progressbar', { name: 'Site preloader' })).toBeHidden({
    timeout: 12000,
  });
}

async function setChapterProgress(page: Page, progress: number) {
  await page.locator('#kaiforge').evaluate((element, nextProgress) => {
    const top = element.getBoundingClientRect().top + window.scrollY;
    const distance = element.getBoundingClientRect().height - window.innerHeight;
    window.scrollTo({ top: top + distance * nextProgress, behavior: 'instant' });
  }, progress);
}

test('semantic KaiForge story and verified destination work without reading the renderer', async ({
  page,
}) => {
  await enterSite(page);
  await expect(page.getByRole('heading', { level: 2, name: 'KaiForge' })).toBeAttached();
  await expect(page.locator('#kaiforge')).toContainText(
    'A table-tennis performance and tracking platform',
  );
  await expect(page.getByRole('link', { name: /Visit KaiForge/ })).toHaveAttribute(
    'href',
    'https://kaiforge.antoniusjairus.in',
  );
});

test('Hero handoff and forward/reverse/direct jumps reconstruct one shared renderer', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enterSite(page);
  await expect(page.locator('#hero')).toHaveAttribute('data-hero-handoff', 'center-seam');

  const chapter = page.locator('#kaiforge');
  await setChapterProgress(page, 0.28);
  await expect(chapter).toHaveAttribute('data-kaiforge-beat', 'approach');
  await expect(page.locator('[data-experience-renderer="shared"]')).toHaveCount(1);

  await setChapterProgress(page, 0.91);
  await expect(chapter).toHaveAttribute('data-kaiforge-beat', 'release');
  await expect(page.locator('[data-experience-renderer="shared"]')).toHaveCount(1);

  await setChapterProgress(page, 0.455);
  await expect(chapter).toHaveAttribute('data-kaiforge-beat', 'impact');
  await expect(page.locator('[data-experience-renderer="shared"]')).toHaveCount(1);

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(page.locator('[data-experience-renderer="shared"]')).toHaveCount(0);
  await setChapterProgress(page, 0.67);
  await expect(chapter).toHaveAttribute('data-kaiforge-beat', 'understanding');
  await expect(page.locator('[data-experience-renderer="shared"]')).toHaveCount(1);

  await page.setViewportSize({ width: 390, height: 844 });
  await setChapterProgress(page, 0.67);
  await expect(chapter).toHaveAttribute('data-kaiforge-beat', 'understanding');
  await expect(page.locator('[data-experience-renderer="shared"]')).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

for (const viewport of [
  { width: 390, height: 844, label: 'phone portrait' },
  { width: 768, height: 1024, label: 'tablet portrait' },
  { width: 1440, height: 900, label: 'desktop' },
  { width: 1920, height: 1080, label: 'wide desktop' },
]) {
  test(`${viewport.label} recomposes without horizontal overflow`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await enterSite(page);
    await setChapterProgress(page, 0.67);
    await expect(page.locator('#kaiforge')).toHaveAttribute('data-kaiforge-beat', 'understanding');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      viewport.width,
    );
  });
}

test('reduced motion provides an intentional static chapter without WebGL', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await enterSite(page);
  const chapter = page.locator('#kaiforge');
  await expect(chapter).toHaveClass(/kaiforge-static/);
  await expect(chapter.locator('[data-fallback-reason="reduced-motion"]')).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'KaiForge' })).toBeVisible();
  await expect(page.locator('[data-experience-renderer="shared"]')).toHaveCount(0);
});

test('no-WebGL fallback retains project meaning without an error state', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function getContext(type, ...args) {
      if (String(type).startsWith('webgl')) return null;
      return original.call(this, type, ...args);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await enterSite(page);
  const chapter = page.locator('#kaiforge');
  await expect(chapter.locator('[data-fallback-reason="no-webgl"]')).toBeVisible();
  await expect(chapter).toContainText('The point, understood.');
  await expect(page.locator('[data-experience-renderer="shared"]')).toHaveCount(0);
  await expect(chapter).not.toContainText(/WebGL is required/i);
});

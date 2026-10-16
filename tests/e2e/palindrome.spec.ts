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
  await page.locator('#palindrome').evaluate((element, nextProgress) => {
    const top = element.getBoundingClientRect().top + window.scrollY;
    const distance = element.getBoundingClientRect().height - window.innerHeight;
    window.scrollTo({ top: top + distance * nextProgress, behavior: 'instant' });
  }, progress);
}

test('semantic story states the current product direction and conservative disclosure', async ({
  page,
}) => {
  await enterSite(page);
  const chapter = page.locator('#palindrome');
  await expect(page.getByRole('heading', { level: 2, name: 'PALINDROME' })).toHaveCount(1);
  await expect(chapter).toContainText('consumer financial-intelligence web application');
  await expect(chapter).toContainText('does not promise automatic categorization');
  await expect(page.getByRole('link', { name: /Visit Palindrome/ })).toHaveAttribute(
    'href',
    'https://palindrome.antoniusjairus.in',
  );
});

test('five beats reconstruct through forward, reverse, and rapid direct jumps', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await enterSite(page);
  const chapter = page.locator('#palindrome');
  for (const [progress, beat] of [
    [0.08, 'ordinary'],
    [0.29, 'fragmentation'],
    [0.515, 'relationships'],
    [0.735, 'organization'],
    [0.92, 'control'],
    [0.515, 'relationships'],
    [0.08, 'ordinary'],
    [0.92, 'control'],
  ] as const) {
    await setChapterProgress(page, progress);
    await expect(chapter).toHaveAttribute('data-palindrome-beat', beat);
    await expect(page.locator('[data-experience-renderer="shared"]')).toHaveCount(1);
    await expect(page.locator('[data-project-scene="palindrome"]')).toHaveCount(1);
  }
});

test('KaiForge boundary hands one shared renderer to Palindrome', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enterSite(page);
  await page.locator('#kaiforge').evaluate((element) => {
    const top = element.getBoundingClientRect().top + window.scrollY;
    const distance = element.getBoundingClientRect().height - window.innerHeight;
    window.scrollTo({ top: top + distance * 0.91, behavior: 'instant' });
  });
  await expect(page.locator('[data-project-scene="kaiforge"]')).toHaveCount(1);
  await expect(page.locator('[data-experience-renderer="shared"]')).toHaveCount(1);

  await setChapterProgress(page, 0.04);
  await expect(page.locator('[data-project-scene="palindrome"]')).toHaveCount(1);
  await expect(page.locator('[data-experience-renderer="shared"]')).toHaveCount(1);
});

test('portrait composition preserves the narrative without horizontal overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterSite(page);
  await setChapterProgress(page, 0.735);
  await expect(page.locator('#palindrome')).toHaveAttribute('data-palindrome-beat', 'organization');
  await expect(page.locator('[data-project-scene="palindrome"]')).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('reduced motion uses a complete static editorial chapter without WebGL', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await enterSite(page);
  const chapter = page.locator('#palindrome');
  await chapter.scrollIntoViewIfNeeded();
  await expect(chapter).toHaveClass(/palindrome-static/);
  await expect(chapter.locator('[data-fallback-reason="reduced-motion"]')).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'PALINDROME' })).toBeVisible();
  await expect(page.locator('[data-experience-renderer="shared"]')).toHaveCount(0);
});

test('no-WebGL fallback remains understandable and renderer-free', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function getContext(type, ...args) {
      if (String(type).startsWith('webgl')) return null;
      return original.call(this, type, ...args);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await enterSite(page);
  const chapter = page.locator('#palindrome');
  await chapter.scrollIntoViewIfNeeded();
  await expect(chapter.locator('[data-fallback-reason="no-webgl"]')).toBeVisible();
  await expect(chapter).toContainText('everyday spending easier to understand');
  await expect(page.locator('[data-experience-renderer="shared"]')).toHaveCount(0);
  await expect(chapter).not.toContainText(/WebGL is required/i);
});

import { expect, type Page, test } from '@playwright/test';

async function enterSite(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem('jairus_portfolio_visited', 'true');
  });
  await page.goto('/');
  await expect(page.getByRole('progressbar', { name: 'Site preloader' })).toBeHidden({
    timeout: 12000,
  });
}

async function setChapterProgress(page: Page, progress: number) {
  await page.locator('#neuroshield').evaluate((element, nextProgress) => {
    const top = element.getBoundingClientRect().top + window.scrollY;
    const distance = element.getBoundingClientRect().height - window.innerHeight;
    window.scrollTo({ top: top + distance * nextProgress, behavior: 'instant' });
  }, progress);
}

async function setPalindromeProgress(page: Page, progress: number) {
  await page.locator('#palindrome').evaluate((element, nextProgress) => {
    const top = element.getBoundingClientRect().top + window.scrollY;
    const distance = element.getBoundingClientRect().height - window.innerHeight;
    window.scrollTo({ top: top + distance * nextProgress, behavior: 'instant' });
  }, progress);
}

test('semantic story states the team research role and clinical boundary', async ({ page }) => {
  await enterSite(page);
  const chapter = page.locator('#neuroshield');
  await expect(page.getByRole('heading', { level: 2, name: 'NEUROSHIELD' })).toHaveCount(1);
  await expect(chapter).toContainText('ongoing machine-learning research project');
  await expect(chapter).toContainText('SIX-PERSON TEAM');
  await expect(chapter).toContainText('ADNI datasets');
  await expect(chapter).toContainText('not a clinical diagnostic tool');
  await expect(page.getByRole('link', { name: /View research project/ })).toHaveAttribute(
    'href',
    'https://antoniusjairus4.github.io/neuro-shield/',
  );
  await expect(chapter).not.toContainText(/detects Alzheimer's|diagnoses Alzheimer's/i);
});

test('five beats reconstruct through forward, reverse, and rapid direct jumps', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await enterSite(page);
  const chapter = page.locator('#neuroshield');
  for (const [progress, beat] of [
    [0.08, 'observation'],
    [0.29, 'hypothesis'],
    [0.52, 'experiment'],
    [0.74, 'evidence'],
    [0.92, 'uncertainty'],
    [0.29, 'hypothesis'],
    [0.08, 'observation'],
    [0.92, 'uncertainty'],
  ] as const) {
    await setChapterProgress(page, progress);
    await expect(chapter).toHaveAttribute('data-neuroshield-beat', beat);
    await expect(page.locator('[data-experience-renderer="shared"]')).toHaveCount(1);
    await expect(page.locator('[data-project-scene="neuroshield"]')).toHaveCount(1);
  }
});

test('Palindrome boundary hands one shared renderer to NeuroShield', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enterSite(page);
  await setPalindromeProgress(page, 0.92);
  await expect(page.locator('[data-project-scene="palindrome"]')).toHaveCount(1);
  await expect(page.locator('[data-experience-renderer="shared"]')).toHaveCount(1);

  await setChapterProgress(page, 0.04);
  await expect(page.locator('[data-project-scene="neuroshield"]')).toHaveCount(1);
  await expect(page.locator('[data-project-scene="palindrome"]')).toHaveCount(0);
  await expect(page.locator('[data-experience-renderer="shared"]')).toHaveCount(1);
});

test('portrait composition preserves the research narrative without horizontal overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterSite(page);
  await setChapterProgress(page, 0.92);
  await expect(page.locator('#neuroshield')).toHaveAttribute(
    'data-neuroshield-beat',
    'uncertainty',
  );
  await expect(page.locator('[data-project-scene="neuroshield"]')).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('reduced motion uses a complete static editorial chapter without WebGL', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await enterSite(page);
  const chapter = page.locator('#neuroshield');
  await chapter.scrollIntoViewIfNeeded();
  await expect(chapter).toHaveClass(/neuroshield-static/);
  await expect(chapter.locator('[data-fallback-reason="reduced-motion"]')).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'NEUROSHIELD' })).toBeVisible();
  await expect(chapter).toContainText('ongoing machine-learning research project');
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
  const chapter = page.locator('#neuroshield');
  await chapter.scrollIntoViewIfNeeded();
  await expect(chapter.locator('[data-fallback-reason="no-webgl"]')).toBeVisible();
  await expect(chapter).toContainText('experimental research');
  await expect(page.locator('[data-experience-renderer="shared"]')).toHaveCount(0);
  await expect(chapter).not.toContainText(/WebGL is required/i);
});

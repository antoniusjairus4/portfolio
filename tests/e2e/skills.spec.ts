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

async function setChapterProgress(page: Page, selector: string, progress: number) {
  await page.locator(selector).evaluate((element, nextProgress) => {
    const top = element.getBoundingClientRect().top + window.scrollY;
    const distance = element.getBoundingClientRect().height - window.innerHeight;
    window.scrollTo({ top: top + distance * nextProgress, behavior: 'instant' });
  }, progress);
}

test('semantic Skills content contains the verified six-category taxonomy', async ({ page }) => {
  await enterSite(page);
  const chapter = page.locator('#skills');
  await expect(page.getByRole('heading', { level: 2, name: 'SKILLS' })).toHaveCount(1);
  for (const category of [
    'PROGRAMMING',
    'WEB',
    'BACKEND / DATABASE',
    'CYBERSECURITY',
    'TOOLS',
    'AI TOOLS',
  ]) {
    await expect(
      chapter.getByRole('heading', { level: 3, name: category, exact: true }),
    ).toHaveCount(1);
  }
  await expect(chapter.locator('li')).toHaveCount(27);
  await expect(chapter).toContainText('Antigravity');
  await expect(chapter).toContainText('Learnado');
  await expect(chapter).not.toContainText(/expert|proficiency|%/i);
});

test('six categories reconstruct through forward, reverse, and direct jumps', async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await enterSite(page);
  const chapter = page.locator('#skills');
  for (const [progress, category] of [
    [0.06, 'programming'],
    [0.23, 'web'],
    [0.4, 'backend'],
    [0.58, 'cybersecurity'],
    [0.76, 'tools'],
    [0.92, 'ai-tools'],
    [0.23, 'web'],
    [0.58, 'cybersecurity'],
    [0.06, 'programming'],
  ] as const) {
    await setChapterProgress(page, '#skills', progress);
    await expect(chapter).toHaveAttribute('data-skills-category', category);
    await expect(page.locator('[data-experience-renderer="shared"]')).toHaveCount(1);
    await expect(page.locator('[data-project-scene="skills"]')).toHaveCount(1);
  }
});

test('NeuroShield boundary transfers one renderer into Skills', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enterSite(page);
  await setChapterProgress(page, '#neuroshield', 0.92);
  await expect(page.locator('[data-project-scene="neuroshield"]')).toHaveCount(1);
  await expect(page.locator('[data-experience-renderer="shared"]')).toHaveCount(1);

  await setChapterProgress(page, '#skills', 0.03);
  await expect(page.locator('[data-project-scene="skills"]')).toHaveCount(1);
  await expect(page.locator('[data-project-scene="neuroshield"]')).toHaveCount(0);
  await expect(page.locator('[data-experience-renderer="shared"]')).toHaveCount(1);
});

test('bounded pointer observation cannot change category or document progress', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enterSite(page);
  await setChapterProgress(page, '#skills', 0.4);
  const before = await page.evaluate(() => window.scrollY);
  await page.mouse.move(2, 2);
  await page.mouse.move(1438, 898);
  await expect(page.locator('#skills')).toHaveAttribute('data-skills-category', 'backend');
  expect(await page.evaluate(() => window.scrollY)).toBe(before);
});

test('portrait and touch-independent composition preserve all content without overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterSite(page);
  await setChapterProgress(page, '#skills', 0.76);
  await expect(page.locator('#skills')).toHaveAttribute('data-skills-category', 'tools');
  await expect(page.locator('#skills li')).toHaveCount(27);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('Skills releases the shared renderer before Achievements takes ownership', async ({
  page,
}) => {
  await enterSite(page);
  await setChapterProgress(page, '#skills', 0.999);
  await expect(page.locator('#skills')).toHaveAttribute('data-renderer-active', 'false');
  await expect(page.locator('[data-experience-renderer="shared"]')).toHaveCount(0);
  await expect(page.locator('#achievements-section')).toHaveCount(1);
});

test('reduced motion shows all categories as static editorial content', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await enterSite(page);
  const chapter = page.locator('#skills');
  await chapter.scrollIntoViewIfNeeded();
  await expect(chapter).toHaveClass(/skills-static/);
  await expect(chapter.locator('[data-fallback-reason="reduced-motion"]')).toBeVisible();
  await expect(chapter.locator('h3')).toHaveCount(6);
  await expect(chapter.locator('li')).toHaveCount(27);
  await expect(page.locator('[data-experience-renderer="shared"]')).toHaveCount(0);
});

test('no-WebGL fallback remains complete and never revives the old terminal', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function getContext(this: any, type, ...args) {
      if (String(type).startsWith('webgl')) return null;
      return original.call(this, type, ...args);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await enterSite(page);
  const chapter = page.locator('#skills');
  await chapter.scrollIntoViewIfNeeded();
  await expect(chapter.locator('[data-fallback-reason="no-webgl"]')).toBeVisible();
  await expect(chapter.locator('h3')).toHaveCount(6);
  await expect(chapter.locator('li')).toHaveCount(27);
  await expect(page.locator('#technical-skills-section')).toHaveCount(0);
  await expect(page.locator('[data-experience-renderer="shared"]')).toHaveCount(0);
});

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

async function setPanelProgress(page: Page, discipline: string, progress: number) {
  await page
    .locator(`[data-achievement-discipline="${discipline}"]`)
    .evaluate((element, nextProgress) => {
      const bounds = element.getBoundingClientRect();
      const top = bounds.top + window.scrollY;
      const distance = bounds.height - window.innerHeight;
      window.scrollTo({ top: top + distance * nextProgress, behavior: 'instant' });
    }, progress);
}

test('renders four semantic disciplines with conservative claims', async ({ page }) => {
  await enterSite(page);
  const chapter = page.locator('#achievements-section');
  await expect(page.getByRole('heading', { level: 2, name: 'Achievements' })).toHaveCount(1);
  for (const title of ['STATE CHAMPION', 'BLACK BELT', 'PEAK RATINGS', 'SUCCESSFUL SPEECHES']) {
    await expect(chapter.getByRole('heading', { level: 3, name: title })).toHaveCount(1);
  }
  await expect(chapter).toContainText('2×');
  await expect(chapter).toContainText('3×');
  await expect(chapter).toContainText('1984');
  await expect(chapter).toContainText('2010');
  await expect(chapter).toContainText('2198');
  await expect(chapter).toContainText('15,000+');
  await expect(chapter).not.toContainText('4×');
  await expect(chapter).not.toContainText(/Sivakarthikeyan|Sid Ahmed|events organised/i);
});

test('four motion languages reconstruct through forward, reverse, and direct jumps', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enterSite(page);
  for (const [discipline, progress, beat] of [
    ['table-tennis', 0.3, 'trajectory'],
    ['karate', 0.3, 'impact'],
    ['chess', 0.65, 'ratings'],
    ['public-speaking', 0.62, 'audience'],
    ['karate', 0.72, 'stillness'],
    ['table-tennis', 0.58, 'peak'],
  ] as const) {
    await setPanelProgress(page, discipline, progress);
    await expect(page.locator(`[data-achievement-discipline="${discipline}"]`)).toHaveAttribute(
      'data-achievement-beat',
      beat,
    );
  }
});

test('Skills hands off with every WebGL renderer released', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enterSite(page);
  await setPanelProgress(page, 'table-tennis', 0.12);
  await expect(page.locator('#achievements-section')).toHaveAttribute(
    'data-achievements-mode',
    'kinetic',
  );
  await expect(page.locator('[data-experience-renderer="shared"]')).toHaveCount(0);
  await expect(page.locator('#achievements-section canvas')).toHaveCount(0);
  await expect(page.locator('canvas')).toHaveCount(0);
});

test('portrait choreography has no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterSite(page);
  for (const discipline of ['table-tennis', 'karate', 'chess', 'public-speaking']) {
    await setPanelProgress(page, discipline, 0.62);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      390,
    );
  }
});

test('reduced motion presents a complete static editorial sequence', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await enterSite(page);
  const chapter = page.locator('#achievements-section');
  await chapter.scrollIntoViewIfNeeded();
  await expect(chapter).toHaveAttribute('data-achievements-mode', 'static');
  await expect(chapter.locator('[data-achievement-beat="static"]')).toHaveCount(4);
  await expect(chapter).toContainText('15,000+');
  await expect(chapter.locator('canvas')).toHaveCount(0);
});

test('forced WebGL failure upstream does not affect Achievements', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function getContext(type, ...args) {
      if (String(type).startsWith('webgl')) return null;
      return original.call(this, type, ...args);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await enterSite(page);
  await setPanelProgress(page, 'chess', 0.65);
  await expect(page.locator('[data-achievement-discipline="chess"]')).toHaveAttribute(
    'data-achievement-beat',
    'ratings',
  );
  await expect(page.locator('#achievements-section')).toContainText('2198');
});

test('the final state subtracts spectacle for the Contact boundary', async ({ page }) => {
  await enterSite(page);
  await setPanelProgress(page, 'public-speaking', 0.94);
  await expect(page.locator('[data-achievement-discipline="public-speaking"]')).toHaveAttribute(
    'data-achievement-beat',
    'silence',
  );
  await expect(page.locator('[data-experience-renderer="shared"]')).toHaveCount(0);
});

test('decorative motion geometry is hidden from assistive technology', async ({ page }) => {
  await enterSite(page);
  const chapter = page.locator('#achievements-section');
  await expect(chapter.locator('[aria-hidden="true"]')).toHaveCount(10);
  await expect(chapter.getByRole('list')).toHaveCount(0);
});

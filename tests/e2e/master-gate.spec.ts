import { expect, type Page, test } from '@playwright/test';

const journey = [
  'hero',
  'kaiforge',
  'palindrome',
  'neuroshield',
  'skills',
  'achievements-section',
  'contact',
] as const;

async function enter(page: Page, path = '/') {
  await page.addInitScript(() => sessionStorage.setItem('jairus_portfolio_visited', 'true'));
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('progressbar', { name: 'Site preloader' })).toBeHidden({
    timeout: 12000,
  });
}

async function jumpTo(page: Page, id: (typeof journey)[number]) {
  await page.locator(`#${id}`).evaluate((element) => {
    const top = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: 'instant' });
  });
  await expect(page.locator(`#${id}`)).toBeInViewport({ ratio: 0.1 });
}

async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    )
    .toBe(true);
}

test('fresh entry and refresh start at Hero while history traversal restores position', async ({
  page,
}) => {
  await enter(page);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);

  await jumpTo(page, 'skills');
  const skillsPosition = await page.evaluate(() => window.scrollY);
  expect(skillsPosition).toBeGreaterThan(0);

  await page.goto('/missing-history-probe', { waitUntil: 'domcontentloaded' });
  await page.goBack({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('progressbar', { name: 'Site preloader' })).toBeHidden();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(skillsPosition - 5);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('progressbar', { name: 'Site preloader' })).toBeHidden();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page.locator('#hero')).toHaveAttribute('data-hero-state', 'portrait');
});

test('direct hashes and Back to Top preserve the native document contract', async ({ page }) => {
  for (const id of ['palindrome', 'contact'] as const) {
    await enter(page, `/#${id}`);
    await expect(page.locator(`#${id}`)).toBeInViewport({ ratio: 0.1 });
  }

  await page.getByRole('link', { name: /back to top/i }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5);
  await expect(page.locator('#hero')).toBeInViewport();
  await expect(page.getByRole('progressbar', { name: 'Site preloader' })).toBeHidden();
});

test('desktop journey owns one project scene and releases it before Contact', async ({ page }) => {
  test.slow();
  await page.setViewportSize({ width: 1440, height: 900 });
  await enter(page);

  for (const id of journey) {
    await jumpTo(page, id);
    await expectNoHorizontalOverflow(page);
    if (['kaiforge', 'palindrome', 'neuroshield', 'skills'].includes(id)) {
      await expect(page.locator('[data-project-scene]')).toHaveAttribute('data-project-scene', id, {
        timeout: 5000,
      });
      await expect(page.locator('[data-project-scene] canvas')).toHaveCount(1);
      await expect(page.locator('canvas')).toHaveCount(1);
    }
  }

  await expect(page.locator('[data-project-scene]')).toHaveCount(0);
  await expect(page.locator('canvas')).toHaveCount(0);

  for (const id of [...journey].reverse()) {
    await jumpTo(page, id);
    await expectNoHorizontalOverflow(page);
  }
  await expect(page.locator('#hero')).toBeInViewport();

  await page.setViewportSize({ width: 1920, height: 1080 });
  for (const id of ['hero', 'skills', 'contact'] as const) {
    await jumpTo(page, id);
    await expectNoHorizontalOverflow(page);
  }
  await expect(page.locator('canvas')).toHaveCount(0);
});

test('portrait journey remains complete through rapid forward and reverse jumps', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enter(page);

  for (const id of ['neuroshield', 'contact', 'kaiforge', 'skills', 'hero'] as const) {
    await jumpTo(page, id);
    await expectNoHorizontalOverflow(page);
  }
});

test('reduced motion presents every chapter without a shared renderer', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await enter(page);

  for (const id of journey) {
    await jumpTo(page, id);
    await expect(page.locator(`#${id}`)).toBeAttached();
    await expectNoHorizontalOverflow(page);
  }
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.getByRole('link', { name: /back to top/i }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5);
});

test('no-WebGL mode exposes every project fallback and reaches Contact', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function getContext(type, ...args) {
      if (String(type).startsWith('webgl')) return null;
      return original.call(this, type, ...args);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await enter(page);

  for (const id of ['kaiforge', 'palindrome', 'neuroshield', 'skills'] as const) {
    await jumpTo(page, id);
    await expect(page.locator(`#${id}`)).toHaveClass(/-static/);
    await expect(page.locator(`#${id} h2`)).toBeAttached();
  }
  await jumpTo(page, 'contact');
  await expect(page.getByRole('link', { name: 'antoniusjairusofficial@gmail.com' })).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
});

test('semantic identity, focus, and zoom layouts remain accessible', async ({ page }) => {
  await enter(page);
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('ANTONIUS JAIRUS');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  for (const name of ['KaiForge', 'PALINDROME', 'NEUROSHIELD', 'SKILLS', 'Achievements']) {
    await expect(page.getByRole('heading', { level: 2, name })).toHaveCount(1);
  }
  expect(
    await page
      .locator('a')
      .evaluateAll((links) =>
        links.every(
          (link) =>
            link.textContent?.trim() ||
            link.getAttribute('aria-label') ||
            link.getAttribute('aria-labelledby'),
        ),
      ),
  ).toBe(true);

  await jumpTo(page, 'kaiforge');
  const projectLink = page.getByRole('link', { name: /visit kaiforge/i });
  await projectLink.focus();
  await expect(projectLink).toBeFocused();
  await expect(projectLink).toBeInViewport();

  await page.setViewportSize({ width: 720, height: 450 });
  await jumpTo(page, 'contact');
  const email = page.getByRole('link', { name: 'antoniusjairusofficial@gmail.com' });
  await email.focus();
  await expect(email).toBeFocused();
  expect(
    await email.evaluate((element) => {
      const style = getComputedStyle(element);
      return style.outlineStyle !== 'none' && style.outlineWidth !== '0px';
    }),
  ).toBe(true);
  await expectNoHorizontalOverflow(page);

  await page.setViewportSize({ width: 360, height: 225 });
  await email.scrollIntoViewIfNeeded();
  await expect(email).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await expect(page.locator('#contact figure img')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.getByText('Scan to email')).toBeAttached();
});

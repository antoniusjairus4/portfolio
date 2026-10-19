import { expect, test } from '@playwright/test';

const fixtureUrl = /\/test-fixtures\/asset-lifecycle\.txt/;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.clear());
});

test('prefetches bytes after critical readiness, prepares near KaiForge, disposes, and reacquires', async ({
  page,
}) => {
  const requests: string[] = [];
  page.on('request', (request) => {
    if (fixtureUrl.test(request.url())) requests.push(request.url());
  });
  await page.goto('/?assetLifecycleFixture=1');
  await page.waitForFunction(
    () =>
      window.__portfolioAssetLifecycle
        ?.snapshot()
        .find((asset) => asset.id === 'TEST_LIFECYCLE_FIXTURE')?.state === 'downloaded',
  );
  expect(requests).toHaveLength(1);

  await page.locator('#kaiforge').scrollIntoViewIfNeeded();
  await page.waitForFunction(
    () =>
      window.__portfolioAssetLifecycle
        ?.snapshot()
        .find((asset) => asset.id === 'TEST_LIFECYCLE_FIXTURE')?.state === 'prepared',
  );

  await page.locator('#palindrome').scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, window.innerHeight));
  await page.waitForFunction(
    () =>
      window.__portfolioAssetLifecycle
        ?.snapshot()
        .find((asset) => asset.id === 'TEST_LIFECYCLE_FIXTURE')?.state === 'disposed',
  );

  await page.locator('#kaiforge').scrollIntoViewIfNeeded();
  await page.waitForFunction(
    () =>
      window.__portfolioAssetLifecycle
        ?.snapshot()
        .find((asset) => asset.id === 'TEST_LIFECYCLE_FIXTURE')?.state === 'prepared',
  );
  expect(requests.length).toBeGreaterThanOrEqual(2);
});

test('does not request production resources for reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const requests: string[] = [];
  page.on('request', (request) => {
    if (fixtureUrl.test(request.url())) requests.push(request.url());
  });
  await page.goto('/?assetLifecycleFixture=1');
  await page.waitForTimeout(500);
  expect(requests).toHaveLength(0);
});

test('does not request production resources without WebGL', async ({ page }) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
  });
  const requests: string[] = [];
  page.on('request', (request) => {
    if (fixtureUrl.test(request.url())) requests.push(request.url());
  });
  await page.goto('/?assetLifecycleFixture=1');
  await page.waitForTimeout(500);
  expect(requests).toHaveLength(0);
});

test('keeps Contact at zero canvas and releases fixture state', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => {
    if (fixtureUrl.test(request.url())) requests.push(request.url());
  });
  await page.addInitScript(() => sessionStorage.setItem('jairus_portfolio_visited', 'true'));
  await page.goto('/?assetLifecycleFixture=1#contact');
  await expect(page.getByRole('progressbar', { name: 'Site preloader' })).toBeHidden({
    timeout: 12000,
  });
  await expect(page.locator('#contact')).toBeInViewport();
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.waitForFunction(() => {
    const asset = window.__portfolioAssetLifecycle
      ?.snapshot()
      .find((asset) => asset.id === 'TEST_LIFECYCLE_FIXTURE');
    return asset && !asset.downloaded && !asset.prepared && !asset.resident && !asset.active;
  });
  expect(requests).toHaveLength(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    await page.evaluate(() => document.documentElement.clientWidth),
  );
});

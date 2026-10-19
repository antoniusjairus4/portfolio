import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from '@playwright/test';

const output = 'docs/review/kf-sculptural-athlete';
fs.mkdirSync(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ?? '/usr/bin/google-chrome',
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader'],
});
const errors = [];
const samples = [];

async function scrub(page, progress) {
  await page.locator('#kaiforge').evaluate((element, value) => {
    const rect = element.getBoundingClientRect();
    window.scrollTo({
      top: rect.top + scrollY + (rect.height - innerHeight) * value,
      behavior: 'instant',
    });
  }, progress);
  await page.waitForFunction((value) => {
    const data = document.querySelector('canvas[data-kf-metrics]')?.dataset.kfMetrics;
    if (!data) return false;
    const metrics = JSON.parse(data);
    return metrics.athlete && Math.abs(metrics.progress - value) < 0.001;
  }, progress);
  return JSON.parse(await page.locator('canvas[data-kf-metrics]').getAttribute('data-kf-metrics'));
}

try {
  for (const [width, height] of [
    [1440, 900],
    [390, 844],
  ]) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000/', {
      waitUntil: 'domcontentloaded',
    });
    await page
      .getByRole('progressbar', { name: 'Site preloader' })
      .waitFor({ state: 'hidden', timeout: 60000 });
    for (const [name, progress] of [
      ['recognition', 0.08],
      ['impact', 0.455],
    ]) {
      const metrics = await scrub(page, progress);
      assert.equal(metrics.athleteInstances, 1);
      assert.equal(await page.locator('[data-experience-renderer="shared"]').count(), 1);
      const lease = await page.evaluate(() =>
        window.__portfolioAssetLifecycle
          ?.snapshot()
          .find((asset) => asset.id === 'KF_ATHLETE_ASSEMBLY'),
      );
      assert.equal(lease?.leaseCount, 1);
      await page.screenshot({
        path: `${output}/${width}x${height}-${name}.png`,
        animations: 'disabled',
      });
      samples.push({ width, height, name, metrics });
    }
    const canvas = page.locator('canvas[data-kf-metrics]');
    const impact = await canvas.screenshot();
    if (width === 1440) {
      // Pixel crop of the real locked Impact shot; no debug camera or model transform.
      await page.screenshot({
        path: `${output}/1440x900-impact-athlete-crop.png`,
        clip: { x: 410, y: 240, width: 360, height: 590 },
      });
    }
    const load = await scrub(page, 0.28);
    assert.ok(load.athleteFrame > 6.9 && load.athleteFrame < 7.1);
    assert.ok(!(await canvas.screenshot()).equals(impact));
    await scrub(page, 0.67);
    await scrub(page, 0.455);
    assert.ok(
      (await canvas.screenshot()).equals(impact),
      'Impact must reconstruct exactly on reverse',
    );
    console.log(`${width}x${height}: one athlete, active lease, scroll/reverse pixels verified`);
    await page.close();
  }
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
  fs.writeFileSync(`${output}/review.json`, `${JSON.stringify({ samples, errors }, null, 2)}\n`);
}

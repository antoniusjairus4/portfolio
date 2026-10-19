import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from '@playwright/test';

const output = 'docs/review/kf-handoff-fixes';
fs.mkdirSync(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ?? '/usr/bin/google-chrome',
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader'],
});
const errors = [];
const samples = [];
try {
  for (const [width, height] of [
    [1440, 900],
    [390, 844],
  ]) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    page.on('pageerror', (error) => errors.push(error.message));
    // Fresh browser context, modest network latency, no cached scene chunks.
    const client = await page.context().newCDPSession(page);
    await client.send('Network.enable');
    await client.send('Network.setCacheDisabled', { cacheDisabled: true });
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 100,
      downloadThroughput: 1024 * 1024,
      uploadThroughput: 512 * 1024,
    });
    await page.goto(process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000/', {
      waitUntil: 'domcontentloaded',
    });
    await page.getByRole('progressbar', { name: 'Site preloader' }).waitFor({
      state: 'hidden',
      timeout: 60000,
    });
    const preparationStart = performance.now();
    await page.waitForFunction(() => {
      const data = document.querySelector('canvas[data-kf-metrics]')?.dataset.kfMetrics;
      return data && JSON.parse(data).robotInstances === 1;
    });
    const preparationMs = Math.round(performance.now() - preparationStart);
    assert.equal(await page.evaluate(() => scrollY), 0, 'Robot prepared before any scroll');
    const canvas = await page.locator('canvas[data-kf-metrics]').elementHandle();
    await canvas.evaluate((element) => {
      element.dataset.handoffReview = 'original';
    });
    assert.equal(await page.locator('.hero-crimson-rupture, .hero-horizontal-rupture').count(), 0);

    for (const [name, progress] of [
      ['identity', 0.5],
      ['split', 0.78],
      ['handoff', 0.94],
    ]) {
      await page.evaluate(
        (p) => window.scrollTo({ top: innerHeight * 4.2 * p, behavior: 'instant' }),
        progress,
      );
      await page.waitForFunction((p) => {
        const hero = document.querySelector('#hero');
        return Math.abs(Number(hero.style.getPropertyValue('--hero-progress')) - p) < 0.001;
      }, progress);
      // Let the existing scrubbed typography settle before the review capture.
      await page.waitForTimeout(600);
      assert.equal(await canvas.evaluate((element) => element.isConnected), true);
      assert.equal(await page.locator('[data-experience-renderer="shared"]').count(), 1);
      const ornament = await page
        .locator('.hero-editorial-ornament')
        .evaluate((element) => getComputedStyle(element).opacity);
      assert.equal(ornament, name === 'identity' ? '1' : '0');
      assert.equal(
        await page
          .locator('.hero-editorial-crossbar')
          .evaluate((element) => getComputedStyle(element).backgroundColor),
        'rgb(121, 31, 43)',
      );
      await page.screenshot({ path: `${output}/${width}x${height}-${name}.png` });
    }
    await page.locator('#kaiforge').evaluate((element) => {
      const rect = element.getBoundingClientRect();
      window.scrollTo({
        top: scrollY + rect.top + (rect.height - innerHeight) * 0.47,
        behavior: 'instant',
      });
    });
    await page.waitForFunction(() => {
      const data = document.querySelector('canvas[data-kf-metrics]')?.dataset.kfMetrics;
      return data && Math.abs(JSON.parse(data).progress - 0.47) < 0.001;
    });
    const metrics = JSON.parse(await canvas.getAttribute('data-kf-metrics'));
    assert.equal(metrics.robotInstances, 1);
    assert.equal(metrics.athleteInstances, 0);
    assert.ok(metrics.contactError < 0.000001);
    await page.screenshot({ path: `${output}/${width}x${height}-impact.png` });
    await page.evaluate(() =>
      window.scrollTo({ top: innerHeight * 4.2 * 0.5, behavior: 'instant' }),
    );
    await page.waitForFunction(
      () => document.querySelector('#hero').style.getPropertyValue('--hero-opening') === '0.0000',
    );
    assert.equal(
      await canvas.evaluate((element) => element.isConnected),
      true,
      'Reverse Hero retains the prepared renderer',
    );
    samples.push({
      width,
      height,
      preparationMs,
      preparedBeforeScroll: true,
      sameCanvasAcrossHandoffAndReverse: true,
      contactError: metrics.contactError,
    });
    console.log(
      `${width}x${height}: prepared before scroll (${preparationMs} ms after preloader), same canvas through handoff/reverse, no overlay lines`,
    );
    await page.close();
  }
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
  fs.writeFileSync(`${output}/review.json`, `${JSON.stringify({ samples, errors }, null, 2)}\n`);
}

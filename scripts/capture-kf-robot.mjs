import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from '@playwright/test';

const output = 'docs/review/kf-robot-poc';
fs.mkdirSync(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ?? '/usr/bin/google-chrome',
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader'],
});
const errors = [];
const glbRequests = [];
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
    return metrics.robotInstances === 1 && Math.abs(metrics.progress - value) < 0.001;
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
    page.on('request', (request) => {
      if (/\.glb(?:\?|$)/.test(request.url())) glbRequests.push(request.url());
    });
    await page.goto(process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000/', {
      waitUntil: 'domcontentloaded',
    });
    await page
      .getByRole('progressbar', { name: 'Site preloader' })
      .waitFor({ state: 'hidden', timeout: 60000 });
    let impactMetrics;
    for (const [name, progress] of [
      ['recognition', 0.08],
      ['impact', 0.47],
    ]) {
      const metrics = await scrub(page, progress);
      assert.equal(metrics.robotInstances, 1);
      assert.equal(metrics.athleteInstances, 0);
      assert.equal(await page.locator('[data-experience-renderer="shared"]').count(), 1);
      if (name === 'impact') {
        assert.ok(metrics.contactError < 0.000001, `Contact error ${metrics.contactError}`);
        impactMetrics = metrics;
      }
      await page.screenshot({
        path: `${output}/${width}x${height}-${name}.png`,
        animations: 'disabled',
      });
      samples.push({ width, height, name, metrics });
    }
    const canvas = page.locator('canvas[data-kf-metrics]');
    const impact = await canvas.screenshot();
    if (width === 1440) {
      await page.screenshot({
        path: `${output}/1440x900-impact-robot-crop.png`,
        clip: { x: 350, y: 280, width: 450, height: 550 },
      });
    }
    const load = await scrub(page, 0.29);
    assert.equal(load.robotPhase, 'load');
    assert.notDeepEqual(load.robotPose, impactMetrics.robotPose);
    await scrub(page, 0.64);
    const reconstructed = await scrub(page, 0.47);
    assert.deepEqual(reconstructed.robotPose, impactMetrics.robotPose);
    assert.ok((await canvas.screenshot()).equals(impact), 'Reverse Impact pixels must reconstruct');
    console.log(
      `${width}x${height}: one procedural robot, no human, contact ${impactMetrics.contactError.toExponential(2)} m, ${impactMetrics.robotTriangles} robot triangles, ${impactMetrics.calls} scene draws`,
    );
    await page.close();
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(glbRequests, []);
} finally {
  await browser.close();
  fs.writeFileSync(
    `${output}/review.json`,
    `${JSON.stringify({ samples, errors, glbRequests }, null, 2)}\n`,
  );
}

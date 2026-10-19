import fs from 'node:fs';
import { chromium } from '@playwright/test';

const output = 'docs/review/kf-integration-pass1';
fs.mkdirSync(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ?? '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader'],
});
const errors = [];
const samples = [];
const viewports = [
  [
    1440,
    900,
    [
      ['recognition', 0.08],
      ['approach', 0.28],
      ['impact', 0.455],
      ['understanding', 0.67],
      ['release', 0.91],
    ],
  ],
  [
    390,
    844,
    [
      ['recognition', 0.08],
      ['impact', 0.455],
      ['release', 0.91],
    ],
  ],
  [1920, 1080, [['impact', 0.455]]],
];

try {
  for (const [width, height, beats] of viewports) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    page.on('pageerror', (error) => errors.push(`${width}x${height}: ${error.message}`));
    await page.goto(process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000/', {
      waitUntil: 'domcontentloaded',
      timeout: 120000,
    });
    await page.getByRole('progressbar', { name: 'Site preloader' }).waitFor({
      state: 'hidden',
      timeout: 60000,
    });
    for (const [name, progress] of beats) {
      await page.locator('#kaiforge').evaluate((element, value) => {
        const rect = element.getBoundingClientRect();
        window.scrollTo({
          top: rect.top + scrollY + (rect.height - innerHeight) * value,
          behavior: 'instant',
        });
      }, progress);
      await page.waitForFunction(
        (value) => {
          const data = document
            .querySelector('canvas[data-kf-metrics]')
            ?.getAttribute('data-kf-metrics');
          if (!data) return false;
          const metrics = JSON.parse(data);
          return metrics.athlete && Math.abs(metrics.progress - value) < 0.001;
        },
        progress,
        { timeout: 30000 },
      );
      await page.screenshot({
        path: `${output}/${width}x${height}-${name}.png`,
        animations: 'disabled',
      });
      const metrics = JSON.parse(
        await page.locator('canvas[data-kf-metrics]').getAttribute('data-kf-metrics'),
      );
      const lifecycle = await page.evaluate(() =>
        window.__portfolioAssetLifecycle
          ?.snapshot()
          .find((item) => item.id === 'KF_ATHLETE_ASSEMBLY'),
      );
      samples.push({ width, height, name, metrics, lifecycle });
      console.log(
        `${width}x${height} ${name}: ${metrics.calls} calls, ${metrics.visibleTriangles} visible triangles`,
      );
    }
    await page.close();
  }
} finally {
  await browser.close();
  fs.writeFileSync(`${output}/metrics.json`, `${JSON.stringify({ samples, errors }, null, 2)}\n`);
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
}

import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/google-chrome' });
const allCases = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'phone', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'wide', width: 1920, height: 1080 },
];
const allBeats = [0.06, 0.28, 0.455, 0.67, 0.91];
const quick = process.argv.includes('--quick');
const cases = quick
  ? allCases.filter(({ name }) => name === 'desktop' || name === 'phone')
  : allCases;
const beats = quick ? allBeats.slice(0, 3) : allBeats;

for (const viewport of cases) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  const skip = page.getByRole('button', { name: 'Skip' });
  if (await skip.isVisible()) await skip.click({ force: true }).catch(() => {});
  await page
    .getByRole('progressbar', { name: 'Site preloader' })
    .waitFor({ state: 'hidden', timeout: 12000 });
  const section = page.locator('#kaiforge');
  const chapter = await section.evaluate((element) => ({
    top: element.getBoundingClientRect().top + window.scrollY,
    height: element.getBoundingClientRect().height,
  }));
  for (let index = 0; index < beats.length; index += 1) {
    await page.evaluate(
      ({ top, height, progress }) => {
        const distance = height - window.innerHeight;
        window.scrollTo({ top: top + distance * progress, behavior: 'instant' });
      },
      { ...chapter, progress: beats[index] },
    );
    await page.waitForTimeout(500);
    await page.screenshot({ path: `/tmp/phase2-${viewport.name}-${index + 1}.png` });
  }
  const metrics = await page.evaluate(() => ({
    canvases: document.querySelectorAll('canvas').length,
    renderers: document.querySelectorAll('[data-experience-renderer="shared"]').length,
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    beat: document.querySelector('#kaiforge')?.getAttribute('data-kaiforge-beat'),
  }));
  console.log(viewport.name, JSON.stringify(metrics), JSON.stringify(errors));
  await context.close();
}
await browser.close();

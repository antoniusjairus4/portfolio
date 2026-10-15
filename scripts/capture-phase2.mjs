import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/google-chrome' });
const cases = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'phone', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'wide', width: 1920, height: 1080 },
];
const beats = [0.06, 0.28, 0.455, 0.67, 0.91];

for (const viewport of cases) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
  const skip = page.getByRole('button', { name: 'Skip' });
  if (await skip.isVisible()) await skip.click({ force: true }).catch(() => {});
  await page
    .getByRole('progressbar', { name: 'Site preloader' })
    .waitFor({ state: 'hidden', timeout: 12000 });
  const section = page.locator('#kaiforge');
  for (let index = 0; index < beats.length; index += 1) {
    await section.evaluate((element, progress) => {
      const top = element.getBoundingClientRect().top + window.scrollY;
      const distance = element.getBoundingClientRect().height - window.innerHeight;
      window.scrollTo(0, top + distance * progress);
    }, beats[index]);
    await page.waitForTimeout(350);
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

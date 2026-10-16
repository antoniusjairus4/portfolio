import { chromium } from '@playwright/test';

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });

async function capture(viewport, discipline, progress, name) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  await page.addInitScript(() => sessionStorage.setItem('jairus_portfolio_visited', 'true'));
  await page.goto('http://localhost:3010', { waitUntil: 'networkidle' });
  await page.locator(`[data-achievement-discipline="${discipline}"]`).evaluate((element, value) => {
    const top = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + (element.clientHeight - window.innerHeight) * value, behavior: 'instant' });
  }, progress);
  await page.waitForTimeout(320);
  await page.screenshot({ path: `/tmp/phase6-visual/final-${name}.png` });
  await context.close();
}

for (const [viewport, discipline, progress, name] of [
  [{ width: 390, height: 844 }, 'karate', 0.3, 'portrait-karate'],
  [{ width: 1440, height: 900 }, 'public-speaking', 0.4, 'desktop-speaking-build'],
  [{ width: 1440, height: 900 }, 'public-speaking', 0.62, 'desktop-speaking-resolved'],
  [{ width: 390, height: 844 }, 'public-speaking', 0.62, 'portrait-speaking-resolved'],
  [{ width: 390, height: 844 }, 'public-speaking', 0.72, 'portrait-speaking-peak'],
]) await capture(viewport, discipline, progress, name);

await browser.close();

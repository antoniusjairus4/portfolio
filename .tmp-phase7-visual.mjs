import { chromium } from '@playwright/test';

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
for (const [width, height] of [[1440, 900], [1920, 1080], [768, 1024], [390, 844]]) {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  await page.addInitScript(() => sessionStorage.setItem('jairus_portfolio_visited', 'true'));
  await page.goto('http://localhost:3010');
  await page.getByRole('progressbar', { name: 'Site preloader' }).waitFor({ state: 'hidden' });
  const contact = page.locator('#contact');
  await contact.evaluate((element) => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY));
  await page.waitForTimeout(500);
  await page.screenshot({ path: `/tmp/phase7-${width}-arrival.png` });
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(500);
  await page.screenshot({ path: `/tmp/phase7-${width}-end.png` });
  console.log(width, {
    contact: await contact.boundingBox(),
    email: await contact.getByRole('link', { name: 'antoniusjairusofficial@gmail.com' }).boundingBox(),
    overflow: await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
    canvas: await page.locator('canvas').count(),
  });
  if (width === 1440) {
    await page.locator('[data-achievement-discipline="public-speaking"]').evaluate((element) => {
      const top = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top + (element.clientHeight - window.innerHeight) * 0.94);
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: '/tmp/phase7-1440-achievements-exit.png' });
    await contact.evaluate((element) => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 150));
    await page.waitForTimeout(500);
    await page.screenshot({ path: '/tmp/phase7-1440-boundary.png' });
    await contact.evaluate((element) => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY + 250));
    await page.waitForTimeout(500);
    await page.locator('img[src="/contact-email-qr.svg"]').screenshot({ path: '/tmp/phase7-qr.png' });
  }
  await context.close();
}
await browser.close();

import { chromium } from '@playwright/test';

const baseURL = process.env.PHASE6_BASE_URL ?? 'http://localhost:3010';
const output = '/tmp/phase6-visual';
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ?? '/usr/bin/google-chrome',
});

async function openPage(width, height, reducedMotion = 'no-preference') {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion });
  const page = await context.newPage();
  await page.addInitScript(() => {
    sessionStorage.setItem('jairus_portfolio_visited', 'true');
  });
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  return { context, page };
}

async function setProgress(page, selector, progress) {
  await page.locator(selector).evaluate((element, nextProgress) => {
    const bounds = element.getBoundingClientRect();
    const top = bounds.top + window.scrollY;
    const distance = bounds.height - window.innerHeight;
    window.scrollTo({ top: top + distance * nextProgress, behavior: 'instant' });
  }, progress);
  await page.waitForTimeout(320);
}

const desktop = await openPage(1440, 900);
for (const [name, discipline, progress] of [
  ['tt-entry', 'table-tennis', 0.1],
  ['tt-trajectory', 'table-tennis', 0.3],
  ['tt-peak', 'table-tennis', 0.58],
  ['tt-exit', 'table-tennis', 0.9],
  ['karate-entry', 'karate', 0.1],
  ['karate-impact', 'karate', 0.3],
  ['karate-stillness', 'karate', 0.65],
  ['karate-exit', 'karate', 0.9],
  ['chess-entry', 'chess', 0.1],
  ['chess-calculation', 'chess', 0.36],
  ['chess-ratings', 'chess', 0.68],
  ['chess-exit', 'chess', 0.9],
  ['speaking-speeches', 'public-speaking', 0.18],
  ['speaking-build', 'public-speaking', 0.4],
  ['speaking-resolved', 'public-speaking', 0.58],
  ['speaking-audience', 'public-speaking', 0.68],
  ['speaking-silence', 'public-speaking', 0.94],
]) {
  await setProgress(desktop.page, `[data-achievement-discipline="${discipline}"]`, progress);
  await desktop.page.screenshot({ path: `${output}/desktop-${name}.png` });
}
await setProgress(desktop.page, '#skills', 0.99);
await desktop.page.screenshot({ path: `${output}/boundary-skills-exit.png` });
await setProgress(desktop.page, '[data-achievement-discipline="table-tennis"]', 0.02);
await desktop.page.screenshot({ path: `${output}/boundary-achievements-entry.png` });
await desktop.context.close();

const wide = await openPage(1920, 1080);
await setProgress(wide.page, '[data-achievement-discipline="public-speaking"]', 0.68);
await wide.page.screenshot({ path: `${output}/wide-speaking-peak.png` });
await wide.context.close();

const portrait = await openPage(390, 844);
for (const [name, discipline, progress] of [
  ['tt-peak', 'table-tennis', 0.58],
  ['karate-impact', 'karate', 0.3],
  ['chess-ratings', 'chess', 0.68],
  ['speaking-resolved', 'public-speaking', 0.58],
  ['speaking-audience', 'public-speaking', 0.68],
  ['speaking-silence', 'public-speaking', 0.94],
]) {
  await setProgress(portrait.page, `[data-achievement-discipline="${discipline}"]`, progress);
  await portrait.page.screenshot({ path: `${output}/portrait-${name}.png` });
}
await portrait.context.close();

const reduced = await openPage(1440, 900, 'reduce');
for (const discipline of ['table-tennis', 'karate', 'chess', 'public-speaking']) {
  await reduced.page.locator(`[data-achievement-discipline="${discipline}"]`).scrollIntoViewIfNeeded();
  await reduced.page.waitForTimeout(120);
  await reduced.page.screenshot({ path: `${output}/reduced-${discipline}.png` });
}
await reduced.context.close();

await browser.close();

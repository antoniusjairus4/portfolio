import { expect, type Page, test } from '@playwright/test';

const email = 'antoniusjairusofficial@gmail.com';

async function enter(page: Page, path = '/') {
  await page.addInitScript(() => sessionStorage.setItem('jairus_portfolio_visited', 'true'));
  await page.goto(path);
  await expect(page.getByRole('progressbar', { name: 'Site preloader' })).toBeHidden({
    timeout: 12000,
  });
}

test('renders one quiet semantic finale with approved destinations', async ({ page }) => {
  await enter(page);
  const contact = page.locator('#contact');
  await expect(contact.getByRole('heading', { level: 2, name: 'Antonius Jairus.' })).toHaveCount(1);
  await expect(contact.getByRole('link', { name: email })).toHaveAttribute(
    'href',
    `mailto:${email}`,
  );
  for (const [label, destination] of [
    ['GITHUB', 'https://github.com/antoniusjairus4'],
    ['LINKEDIN', 'https://www.linkedin.com/in/antoniusjairus4/'],
    ['INSTAGRAM', 'https://www.instagram.com/antoniusjairus4/'],
  ]) {
    const link = contact.getByRole('link', { name: label });
    await expect(link).toHaveAttribute('href', destination);
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  }
  await expect(contact.getByRole('link', { name: /back to top/i })).toHaveAttribute('href', '#top');
  await expect(contact.locator('form')).toHaveCount(0);
  await expect(contact.locator('a[href^="tel:"]')).toHaveCount(0);
  await expect(page.locator('#contact')).toHaveCount(1);
});

test('desktop QR is a static local SVG and direct email remains available', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enter(page);
  const contact = page.locator('#contact');
  await contact.scrollIntoViewIfNeeded();
  const qr = contact.locator('img[src="/contact-email-qr.svg"]');
  await expect(qr).toBeVisible();
  await expect(contact.getByText('Scan to email')).toBeVisible();
  await expect(contact.getByRole('link', { name: email })).toBeVisible();
  const response = await page.request.get('/contact-email-qr.svg');
  expect(response.ok()).toBe(true);
  expect(await response.text()).toContain('<svg');
});

test('portrait prioritizes email, hides QR, and has no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enter(page);
  const contact = page.locator('#contact');
  await contact.scrollIntoViewIfNeeded();
  await expect(contact.getByRole('link', { name: email })).toBeVisible();
  await expect(contact.locator('img[src="/contact-email-qr.svg"]')).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('Back to Top returns in-session without replaying the preloader', async ({ page }) => {
  await enter(page);
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await page.getByRole('link', { name: /back to top/i }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5);
  await expect(page.getByRole('progressbar', { name: 'Site preloader' })).toBeHidden();
  await expect(page.locator('#hero')).toBeInViewport();
});

test('direct Contact jump and reverse traversal reconstruct chapter ownership', async ({
  page,
}) => {
  await enter(page, '/#contact');
  await expect(page.locator('#contact')).toBeInViewport();
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.locator('[data-achievement-discipline="public-speaking"]').scrollIntoViewIfNeeded();
  await expect(page.locator('[data-achievement-discipline="public-speaking"]')).toBeInViewport();
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await expect(page.locator('#contact')).toBeInViewport();
  await expect(page.locator('canvas')).toHaveCount(0);
});

test('Contact is static, keyboard reachable, and works without WebGL', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function getContext(type, ...args) {
      if (String(type).startsWith('webgl')) return null;
      return original.call(this, type, ...args);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await enter(page, '/#contact');
  const contact = page.locator('#contact');
  await expect(contact.getByRole('link', { name: email })).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
  await contact.getByRole('link', { name: email }).focus();
  await expect(contact.getByRole('link', { name: email })).toBeFocused();
});

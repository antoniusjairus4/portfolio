import { expect, test, type Page } from '@playwright/test';

async function progress(page: Page, p: number) {
  await page.locator('#kaiforge').evaluate((element, value) => {
    const rect = element.getBoundingClientRect();
    window.scrollTo({
      top: rect.top + scrollY + (rect.height - innerHeight) * value,
      behavior: 'instant',
    });
  }, p);
  await expect
    .poll(async () => {
      const json = await page.locator('canvas[data-kf-metrics]').getAttribute('data-kf-metrics');
      return Math.abs(JSON.parse(json ?? '{}').progress - p);
    })
    .toBeLessThan(0.001);
}
for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  test(`production scene reconstructs pixels and stays within budget ${viewport.width}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.getByRole('progressbar', { name: 'Site preloader' })).toBeHidden({
      timeout: 15000,
    });
    await progress(page, 0.49);
    const canvas = page.locator('canvas[data-kf-metrics]');
    const original = await canvas.screenshot();
    const initial = JSON.parse((await canvas.getAttribute('data-kf-metrics')) ?? '{}');
    await progress(page, 0.91);
    await progress(page, 0.08);
    await progress(page, 0.49);
    expect((await canvas.screenshot()).equals(original)).toBe(true);
    const reconstructed = JSON.parse((await canvas.getAttribute('data-kf-metrics')) ?? '{}');
    expect(reconstructed.camera).toEqual(initial.camera);
    expect(reconstructed.geometries).toBeLessThanOrEqual(initial.geometries + 2);
    expect(reconstructed.calls).toBeLessThan(viewport.width === 390 ? 40 : 80);
    expect(reconstructed.visibleTriangles).toBeLessThan(5000);
    expect(reconstructed.materials).toBeLessThanOrEqual(10);
    await expect(page.locator('[data-experience-renderer="shared"]')).toHaveCount(1);
    await expect(page.locator('#hero')).toHaveAttribute('data-hero-handoff', 'center-seam');
  });
}

test('direct chapter hash and browser history preserve KaiForge ownership', async ({ page }) => {
  await page.goto('/#kaiforge');
  await expect(page.getByRole('progressbar', { name: 'Site preloader' })).toBeHidden({
    timeout: 15000,
  });
  await expect(page.locator('[data-project-scene="kaiforge"]')).toBeAttached();
  await page.evaluate(() => {
    location.hash = 'palindrome';
  });
  await expect(page.locator('[data-project-scene="palindrome"]')).toBeAttached();
  await page.goBack();
  await expect(page.locator('[data-project-scene="kaiforge"]')).toBeAttached();
  await expect(page.locator('[data-experience-renderer="shared"]')).toHaveCount(1);
});

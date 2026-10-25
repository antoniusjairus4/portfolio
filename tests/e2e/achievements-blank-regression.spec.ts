import { expect, test } from '@playwright/test';

test('achievement panels and handoffs never resolve to a blank viewport', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  await page.addInitScript(() => sessionStorage.setItem('jairus_portfolio_visited', 'true'));
  await page.goto('/');
  await expect(page.getByRole('progressbar', { name: 'Site preloader' })).toBeHidden({
    timeout: 12000,
  });

  const panels = await page.locator('[data-achievement-panel]').evaluateAll((nodes) =>
    nodes.map((node) => {
      const rect = node.getBoundingClientRect();
      return {
        panel: node.getAttribute('data-achievement-panel'),
        top: rect.top + window.scrollY,
        height: rect.height,
      };
    }),
  );

  const visibleAchievementText = () =>
    page.locator('#achievements-section').evaluate((chapter) => {
      const candidates = chapter.querySelectorAll(
        'h3, strong, dt, dd, [class*="Statement"] p, [class*="Concepts"] span, [class*="Disciplines"] span',
      );
      return [...candidates].filter((element) => {
        let opacity = 1;
        let current: Element | null = element;
        while (current && current !== chapter) {
          opacity *= Number.parseFloat(getComputedStyle(current).opacity || '1');
          current = current.parentElement;
        }
        const rect = element.getBoundingClientRect();
        return (
          opacity > 0.04 &&
          rect.bottom > 0 &&
          rect.top < innerHeight &&
          rect.right > 0 &&
          rect.left < innerWidth
        );
      }).length;
    });

  for (const entry of panels) {
    const hold = entry.top + Math.max(0, entry.height - 900) * 0.5;
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), hold);
    await page.waitForTimeout(120);
    const count = await visibleAchievementText();
    if (!count) {
      const debug = await page
        .locator(`[data-achievement-panel="${entry.panel}"]`)
        .evaluate((node) => {
          const title = node.querySelector('h3, strong');
          return {
            scrollY,
            panel: node.getBoundingClientRect().toJSON(),
            stage: node.firstElementChild?.getBoundingClientRect().toJSON(),
            title: title?.getBoundingClientRect().toJSON(),
            titleOpacity: title ? getComputedStyle(title).opacity : null,
            parentOpacity: title?.parentElement
              ? getComputedStyle(title.parentElement).opacity
              : null,
            variables: {
              progress: node.getAttribute('data-achievement-progress'),
              start: node.getAttribute('data-achievement-start'),
              end: node.getAttribute('data-achievement-end'),
              intro: getComputedStyle(node).getPropertyValue('--intro-title'),
              exit: getComputedStyle(node).getPropertyValue('--achievement-exit'),
            },
          };
        });
      console.log(JSON.stringify(debug));
    }
    expect(count, `${entry.panel} hold`).toBeGreaterThan(0);
  }

  for (const incoming of panels.slice(1)) {
    await page.evaluate(
      (top) => window.scrollTo({ top: top - innerHeight * 0.5, behavior: 'instant' }),
      incoming.top,
    );
    await page.waitForTimeout(120);
    expect(await visibleAchievementText(), `${incoming.panel} handoff`).toBeGreaterThan(0);
  }

  expect(errors).toEqual([]);
});

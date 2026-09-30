import { chromium } from '@playwright/test';

async function diagnose() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000');

  // Skip preloader
  const skipBtn = page.getByRole('button', { name: 'Skip' });
  if (await skipBtn.isVisible()) {
    await skipBtn.click();
  }

  // Wait 1 second for preloader transition
  await page.waitForTimeout(1000);

  const diagnostics = await page.evaluate(() => {
    const pinSpacer = document.querySelector('.pin-spacer');
    const container = document.querySelector('section[aria-label*="Full-screen photo cover"]');
    const leftHalf = container?.children[1];
    const rightHalf = container?.children[2];

    const isPinned = !!pinSpacer;
    const pinSpacerHeight = pinSpacer ? window.getComputedStyle(pinSpacer).height : 'NONE';
    const documentScrollHeight = document.scrollingElement?.scrollHeight || 0;
    const viewportHeight = window.innerHeight;
    const isDocumentTaller = documentScrollHeight > viewportHeight;

    const htmlOverflow = window.getComputedStyle(document.documentElement).overflow;
    const bodyOverflow = window.getComputedStyle(document.body).overflow;

    // Check Lenis instance state on window or ScrollTrigger
    const scrollTriggers = window.ScrollTrigger?.getAll() || [];
    const triggerCount = scrollTriggers.length;

    // Check pointer events on top elements
    const topElement = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
    const topElementTag = topElement ? `${topElement.tagName}.${topElement.className}` : 'NONE';
    const topElementPointerEvents = topElement ? window.getComputedStyle(topElement).pointerEvents : 'NONE';

    return {
      isPinned,
      pinSpacerHeight,
      documentScrollHeight,
      viewportHeight,
      isDocumentTaller,
      htmlOverflow,
      bodyOverflow,
      triggerCount,
      topElementTag,
      topElementPointerEvents,
    };
  });

  console.log('=== DIAGNOSTIC EVIDENCE REPORT ===');
  console.log(JSON.stringify(diagnostics, null, 2));

  // Test scrolling to 0, 0.5, 1.0 viewport and inspect transforms
  const transforms = {};
  for (const fraction of [0, 0.5, 1.0]) {
    const scrollPos = Math.round(fraction * diagnostics.viewportHeight);
    await page.evaluate((pos) => window.scrollTo(0, pos), scrollPos);
    await page.waitForTimeout(200);

    const stepData = await page.evaluate(() => {
      const container = document.querySelector('section[aria-label*="Full-screen photo cover"]');
      const left = container?.children[1];
      const right = container?.children[2];
      return {
        scrollY: window.scrollY,
        leftTransform: left ? window.getComputedStyle(left).transform : 'NONE',
        rightTransform: right ? window.getComputedStyle(right).transform : 'NONE',
      };
    });
    transforms[`${fraction * 100}% (${scrollPos}px)`] = stepData;
  }

  console.log('\n=== TRANSFORMS AT SCROLL POSITIONS ===');
  console.log(JSON.stringify(transforms, null, 2));

  await browser.close();
}

diagnose().catch(console.error);

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

async function extractTheme(url, name) {
  console.log(`Extracting theme for ${name} from ${url}...`);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  } catch (e) {
    console.log(`Warning: networkidle timed out for ${url}, continuing...`, e.message);
  }

  const data = await page.evaluate(() => {
    const getComp = (el) => window.getComputedStyle(el);
    const body = document.body;
    const bodyComp = getComp(body);
    
    // Find buttons
    const buttons = Array.from(document.querySelectorAll('button, a[class*="btn"], a[class*="button"], [role="button"]'));
    let primaryBtnStyle = null;
    if (buttons.length > 0) {
      const b = buttons[0];
      const bc = getComp(b);
      primaryBtnStyle = {
        bg: bc.backgroundColor,
        color: bc.color,
        borderRadius: bc.borderRadius,
        border: bc.border,
        background: bc.background,
      };
    }

    // Root CSS vars
    const rootStyles = window.getComputedStyle(document.documentElement);
    const customProps = {};
    for (let i = 0; i < document.styleSheets.length; i++) {
      try {
        const rules = document.styleSheets[i].cssRules;
        if (!rules) continue;
        for (let j = 0; j < rules.length; j++) {
          if (rules[j].selectorText === ':root') {
            const style = rules[j].style;
            for (let k = 0; k < style.length; k++) {
              const prop = style[k];
              if (prop.startsWith('--')) {
                customProps[prop] = rootStyles.getPropertyValue(prop).trim();
              }
            }
          }
        }
      } catch (e) {
        // Cross-origin stylesheet access restriction
      }
    }

    // Headings
    const h1 = document.querySelector('h1, h2');
    const h1Comp = h1 ? getComp(h1) : null;

    return {
      bodyBg: bodyComp.backgroundColor,
      bodyColor: bodyComp.color,
      fontFamily: bodyComp.fontFamily,
      h1FontFamily: h1Comp ? h1Comp.fontFamily : null,
      primaryBtnStyle,
      customProps,
    };
  });

  await browser.close();
  return data;
}

async function run() {
  const palindrome = await extractTheme('https://palindrome.antoniusjairus.in', 'Palindrome');
  const kaiforge = await extractTheme('https://kaiforge.antoniusjairus.in', 'KaiForge');
  const neuroshield = await extractTheme('https://antoniusjairus4.github.io/neuro-shield/', 'NeuroShield AI');

  const result = { palindrome, kaiforge, neuroshield };
  console.log('EXTRACTED_THEMES:', JSON.stringify(result, null, 2));
  fs.writeFileSync('extracted_themes.json', JSON.stringify(result, null, 2));
}

run().catch(console.error);

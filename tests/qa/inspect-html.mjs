import { chromium } from '@playwright/test';
const BASE = 'http://localhost:8080';

(async () => {
  const b = await chromium.launch({ headless: true });
  const c = await b.newContext({ viewport: { width: 1920, height: 1080 } });
  const p = await c.newPage();

  for (const route of ['/login', '/register']) {
    await p.goto(BASE + route, { waitUntil: 'networkidle' });
    await p.waitForTimeout(2500);
    const inputs = await p.evaluate(() => [...document.querySelectorAll('input')].map(i => ({
      type: i.type, name: i.name, id: i.id, placeholder: i.placeholder, autocomplete: i.autocomplete,
    })));
    console.log(`=== ${route} ===`);
    console.log(JSON.stringify(inputs, null, 2));
  }

  // Login as customer to inspect catalog/orders
  await p.goto(BASE + '/login', { waitUntil: 'networkidle' });
  await p.waitForTimeout(2000);
  // Try multiple selectors
  await p.locator('input[type="email"], input[name="email"], input[id="email"]').first().fill('customer@urban8.com').catch(() => {});
  await p.locator('input[type="password"], input[name="password"], input[id="password"]').first().fill('password').catch(() => {});
  await p.locator('button[type="submit"]').first().click().catch(() => {});
  await p.waitForLoadState('networkidle').catch(() => {});
  await p.waitForTimeout(2000);

  for (const route of ['/catalog', '/orders']) {
    await p.goto(BASE + route, { waitUntil: 'networkidle' });
    await p.waitForTimeout(2500);
    const links = await p.evaluate(() => [...document.querySelectorAll('a[href]')].map(a => ({
      href: a.getAttribute('href'),
      text: a.textContent?.trim().slice(0, 50),
    })).filter(x => x.href && !x.href.startsWith('#')).slice(0, 40));
    const cards = await p.evaluate(() => [...document.querySelectorAll('[role="link"], button, [data-testid]')].map(el => ({
      tag: el.tagName,
      text: el.textContent?.trim().slice(0, 40),
      testid: el.getAttribute('data-testid'),
      ariaLabel: el.getAttribute('aria-label'),
    })).filter(x => x.text || x.testid).slice(0, 20));
    console.log(`=== ${route} LINKS ===`);
    console.log(JSON.stringify(links, null, 2));
    console.log(`=== ${route} CARDS/BUTTONS ===`);
    console.log(JSON.stringify(cards, null, 2));
  }

  await b.close();
})();

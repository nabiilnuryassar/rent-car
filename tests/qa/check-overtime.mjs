/**
 * Quick error checker — login admin, visit overtime page, dump errors
 */
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:8080';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await ctx.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(`PAGE ERROR: ${err.message}`));

  // Login admin
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.locator('input[type="email"]').first().fill('admin@urban8.com');
  await page.locator('input[type="password"]').first().fill('password');
  await Promise.all([
    page.waitForLoadState('networkidle').catch(() => {}),
    page.locator('button[type="submit"]').first().click(),
  ]);
  await page.waitForTimeout(2000);

  await page.goto(`${BASE}/admin/overtime-penalties`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  console.log('=== STATUS:', page.url());
  console.log('=== TITLE:', await page.title());

  // Get visible error banners / messages
  const errors = await page.evaluate(() => {
    const out = [];
    const errorSelectors = [
      '.error', '.alert-danger', '[role="alert"]',
      '[class*="error"]', '[class*="Error"]',
      '.text-red-500', '.text-red-600', '.bg-red-50', '.bg-red-100',
      '[data-slot="error"]',
    ];
    for (const sel of errorSelectors) {
      document.querySelectorAll(sel).forEach((el) => {
        const t = el.textContent?.trim();
        if (t && t.length > 3 && t.length < 500) out.push({ selector: sel, text: t });
      });
    }
    // Inertia error component
    const flashErrors = document.querySelectorAll('[class*="bg-destructive"], [class*="bg-red"]');
    flashErrors.forEach((el) => {
      const t = el.textContent?.trim();
      if (t && t.length > 3 && t.length < 500) out.push({ selector: 'flash', text: t });
    });
    return out;
  });

  console.log('=== VISIBLE ERROR ELEMENTS ===');
  console.log(JSON.stringify(errors, null, 2));

  console.log('=== CONSOLE ERRORS ===');
  console.log(consoleErrors.length ? consoleErrors.join('\n') : '(none)');

  // Get page main heading + first card content
  const main = await page.evaluate(() => ({
    h1: document.querySelector('h1')?.textContent?.trim(),
    h2: [...document.querySelectorAll('h2')].map(h => h.textContent?.trim()).slice(0, 5),
    bodyText: document.body.innerText.slice(0, 2000),
  }));
  console.log('=== H1:', main.h1);
  console.log('=== H2s:', main.h2);
  console.log('=== BODY TEXT (first 2000 chars) ===');
  console.log(main.bodyText);

  await browser.close();
})();

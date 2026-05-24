/**
 * Manual modal probe — buka modal, dump struktur DOM
 */
import { chromium } from '@playwright/test';
const BASE = 'http://localhost:8080';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await ctx.newPage();

  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.locator('input[type="email"]').first().fill('admin@urban8.com');
  await page.locator('input[type="password"]').first().fill('password');
  await Promise.all([
    page.waitForLoadState('networkidle').catch(() => {}),
    page.locator('button[type="submit"]').first().click(),
  ]);
  await page.waitForTimeout(1500);

  await page.goto(`${BASE}/admin/vehicles`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.locator('button', { hasText: /Tambah Kendaraan/i }).first().click();
  await page.waitForTimeout(2000);

  const snapshot = await page.evaluate(() => {
    return {
      dialogs: document.querySelectorAll('[role="dialog"]').length,
      headlessui: document.querySelectorAll('[id*="headlessui"]').length,
      portals: document.querySelectorAll('div[data-headlessui-state]').length,
      classes: [...document.querySelectorAll('div.fixed')].map(d => d.className).slice(0, 5),
      bodyContains: document.body.textContent.includes('Tambah Kendaraan Baru'),
    };
  });
  console.log('Vehicle modal probe:', JSON.stringify(snapshot, null, 2));

  // Order detail
  await page.goto(`${BASE}/admin/orders`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const orderHref = await page.locator('a[href*="/admin/orders/"]').first().getAttribute('href');
  await page.goto(BASE + orderHref, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  // Find ALL action buttons
  const actionBtns = await page.evaluate(() =>
    [...document.querySelectorAll('button')].map(b => b.textContent?.trim()).filter(t => t && t.length < 60).slice(0, 30)
  );
  console.log('Order detail buttons:', JSON.stringify(actionBtns, null, 2));

  // Try Catat Pengembalian
  const ret = page.locator('button', { hasText: /Catat Pengembalian|Pengembalian|Return|Kembalikan/i });
  console.log('Return-like btn count:', await ret.count());
  const completeBtn = page.locator('button', { hasText: /Selesai|Complete/i });
  console.log('Complete-like btn count:', await completeBtn.count());

  await browser.close();
})();

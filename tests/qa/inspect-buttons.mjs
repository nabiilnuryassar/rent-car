/**
 * Inspect actual UI patterns: tombol mana yg modal vs nav, dimana letak detail row buttons
 */
import { chromium } from '@playwright/test';
const BASE = 'http://localhost:8080';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await ctx.newPage();

  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.locator('input[type="email"]').first().fill('admin@urban8.com');
  await page.locator('input[type="password"]').first().fill('password');
  await Promise.all([
    page.waitForLoadState('networkidle').catch(() => {}),
    page.locator('button[type="submit"]').first().click(),
  ]);
  await page.waitForTimeout(1500);

  for (const url of ['/admin/vehicles', '/admin/drivers', '/admin/pricing-rules', '/admin/shuttle-tariffs']) {
    await page.goto(BASE + url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    console.log(`\n========== ${url} ==========`);

    // Top-level action buttons (Tambah)
    const topButtons = await page.evaluate(() => {
      // Buttons not inside table rows
      const all = [...document.querySelectorAll('button, a.button, [role="button"], a.btn')];
      return all
        .filter((el) => !el.closest('tr') && !el.closest('tbody'))
        .map((el) => ({
          tag: el.tagName,
          text: el.textContent?.trim().slice(0, 60),
          href: el.getAttribute('href'),
          dataState: el.getAttribute('data-state'),
        }))
        .filter((x) => x.text && x.text.length > 0 && x.text.length < 60)
        .slice(0, 25);
    });
    console.log('TOP BUTTONS:');
    console.log(JSON.stringify(topButtons.filter(b => /tambah|buat|add|baru|edit|hapus|delete|create/i.test(b.text || '')), null, 2));

    // Row buttons
    const rowButtons = await page.evaluate(() => {
      const tr = document.querySelector('tbody tr');
      if (!tr) return [];
      return [...tr.querySelectorAll('button, a, [role="button"]')].map((el) => ({
        tag: el.tagName,
        text: el.textContent?.trim().slice(0, 50),
        href: el.getAttribute('href'),
        ariaLabel: el.getAttribute('aria-label'),
      })).filter(x => x.text || x.ariaLabel);
    });
    console.log('FIRST ROW BUTTONS:');
    console.log(JSON.stringify(rowButtons, null, 2));
  }

  // Verifikasi page (cek refund button per row)
  await page.goto(BASE + '/admin/payments/verification?tab=paid', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  console.log('\n========== /admin/payments/verification?tab=paid ==========');
  const refundRow = await page.evaluate(() => {
    const tr = document.querySelector('tbody tr');
    if (!tr) return [];
    return [...tr.querySelectorAll('button, a, [role="button"]')].map((el) => ({
      tag: el.tagName,
      text: el.textContent?.trim().slice(0, 50),
      ariaLabel: el.getAttribute('aria-label'),
    })).filter(x => x.text || x.ariaLabel);
  });
  console.log('PAID TAB ROW BUTTONS:');
  console.log(JSON.stringify(refundRow, null, 2));

  // Admin order detail (cek dispatch/return/complete buttons)
  const orderLink = await page.evaluate(() => {
    const a = document.querySelector('a[href*="/admin/orders/"]');
    return a ? a.getAttribute('href') : null;
  }).catch(() => null);

  await page.goto(BASE + '/admin/orders', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const orderDetailHref = await page.evaluate(() => {
    const a = document.querySelector('a[href*="/admin/orders/"]');
    return a ? a.getAttribute('href') : null;
  });
  if (orderDetailHref) {
    await page.goto(BASE + orderDetailHref, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    console.log(`\n========== ${orderDetailHref} ==========`);
    const allBtns = await page.evaluate(() => {
      return [...document.querySelectorAll('button, a, [role="button"]')].map((el) => ({
        tag: el.tagName,
        text: el.textContent?.trim().slice(0, 60),
        href: el.getAttribute('href'),
      })).filter(x => x.text && x.text.length > 0 && x.text.length < 60).slice(0, 50);
    });
    console.log('ALL ACTION BUTTONS:');
    console.log(JSON.stringify(allBtns.filter(b => /dispatch|kirim|return|kembalikan|selesai|complete|batalkan|cancel|refund|catat/i.test(b.text || '')), null, 2));
  }

  await browser.close();
})();

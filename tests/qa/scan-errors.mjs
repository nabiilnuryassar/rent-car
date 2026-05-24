/**
 * Pre-flight scanner — visit semua URL + buka semua modal trigger,
 * deteksi error pages dan modal yang gagal load, output list buat di-fix.
 *
 * Tidak generate screenshot final, cuma scan + report.
 */
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:8080';

const URLS = {
  customer: [
    '/register',
    '/login',
    '/dashboard',
    '/catalog',
    '/drivers',
    '/shuttle',
    '/orders',
    '/profile',
  ],
  admin: [
    '/admin/dashboard',
    '/admin/vehicles',
    '/admin/vehicle-categories',
    '/admin/pricing-rules',
    '/admin/drivers',
    '/admin/shuttle-tariffs',
    '/admin/reports',
    '/admin/payments/verification',
    '/admin/payments/verification?tab=paid',
    '/admin/orders',
    '/admin/settings',
  ],
};

const issues = [];

async function detectError(page, label) {
  try {
    const status = page.url().startsWith(BASE) ? 'ok' : 'redirected';
    const title = await page.title();
    const errorMarkers = [
      'MethodNotAllowedHttpException',
      'NotFoundHttpException',
      'Server Error',
      'Whoops',
      'RuntimeException',
      'TypeError',
      'ParseError',
      'QueryException',
      'AuthorizationException',
      'AuthenticationException',
      'HttpException',
    ];
    if (errorMarkers.some((m) => title.includes(m))) {
      return { kind: 'page-error', detail: title.slice(0, 200) };
    }
    const body = await page.evaluate(() => {
      const t = (document.body?.innerText || '').slice(0, 500);
      const m = t.match(/^(Method Not Allowed|Not Found|Server Error|Page Expired|Forbidden|Unauthorized|Too Many Requests|Whoops|Service Unavailable)\b.*$/m);
      return m ? m[0] : null;
    });
    if (body) return { kind: 'page-error', detail: body.slice(0, 200) };
    return null;
  } catch (e) {
    return { kind: 'scan-error', detail: e?.message?.slice(0, 200) };
  }
}

async function scanModalTriggers(page, scope, url) {
  // Find all clickable elements that could open a modal
  const triggers = await page.evaluate(() => {
    const trigs = [];
    document.querySelectorAll('button, a').forEach((el) => {
      const text = el.textContent?.trim();
      if (!text || text.length > 50) return;
      // Modal trigger heuristic
      const patterns = [
        /^Tambah\b/i, /^Buat\b/i, /^Add\b/i, /^Edit\b/i,
        /^Verifikasi\b/i, /^Tolak\b/i, /^Refund\b/i,
        /^Dispatch\b/i, /^Kirim\b/i, /^Return\b/i, /^Selesai\b/i,
        /^Batalkan\b/i, /^Complete\b/i, /^Hapus\b/i,
        /Bukti Transfer/i, /Pembayaran Tunai/i, /Kwitansi/i, /Receipt/i,
      ];
      if (patterns.some((p) => p.test(text))) {
        trigs.push({
          tag: el.tagName, text, idx: trigs.length,
          // Note: cannot pass DOM ref out, use selector recipe
        });
      }
    });
    return trigs.slice(0, 10);
  });
  return triggers;
}

async function login(page, email, password = 'password') {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.locator('input[type="email"]').first().fill(email);
  await page.locator('input[type="password"]').first().fill(password);
  await Promise.all([
    page.waitForLoadState('networkidle').catch(() => {}),
    page.locator('button[type="submit"]').first().click(),
  ]);
  await page.waitForTimeout(1000);
}

async function tryOpenModal(page, triggerText, scope, url) {
  try {
    const trig = page.locator('button, a', { hasText: new RegExp(`^${triggerText}\\b`, 'i') }).first();
    if (!(await trig.count())) return { ok: false, reason: 'trigger not found' };

    await trig.scrollIntoViewIfNeeded().catch(() => {});
    await trig.click({ timeout: 4000 }).catch((e) => { throw e; });
    const modal = page.locator('[role="dialog"], [role="alertdialog"]').first();
    try {
      await modal.waitFor({ state: 'visible', timeout: 3000 });
    } catch {
      // Maybe it was a navigation, not modal
      const newUrl = page.url().replace(BASE, '');
      if (newUrl !== url) {
        // Navigated to another page — check error
        const err = await detectError(page);
        if (err) {
          issues.push({ scope, url: newUrl, trigger: triggerText, problem: err.detail, kind: 'navigation-error' });
          return { ok: false, reason: `navigated to ${newUrl} with error: ${err.detail}` };
        }
        return { ok: 'navigated', target: newUrl };
      }
      return { ok: false, reason: 'no dialog appeared' };
    }
    // Modal visible — check for inline errors
    const inlineErr = await page.evaluate(() => {
      const dlg = document.querySelector('[role="dialog"], [role="alertdialog"]');
      if (!dlg) return null;
      const t = dlg.textContent || '';
      const m = t.match(/(Server Error|Failed|Error \d+|Unauthorized|Forbidden|404|500)\b/i);
      return m ? m[0] : null;
    });
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(300);
    if (inlineErr) {
      issues.push({ scope, url, trigger: triggerText, problem: inlineErr, kind: 'modal-error' });
      return { ok: false, reason: `modal error: ${inlineErr}` };
    }
    return { ok: true };
  } catch (e) {
    issues.push({ scope, url, trigger: triggerText, problem: e?.message?.slice(0, 120), kind: 'modal-throw' });
    return { ok: false, reason: e?.message?.slice(0, 120) };
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  // Customer scan
  for (const role of [
    { email: 'customer@urban8.com', urls: URLS.customer, scope: 'customer' },
    { email: 'admin@urban8.com', urls: URLS.admin, scope: 'admin' },
    { email: 'kasir@urban8.com', urls: URLS.admin, scope: 'kasir' },
  ]) {
    const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await ctx.newPage();
    page.setDefaultTimeout(8000);
    page.setDefaultNavigationTimeout(15000);

    if (role.email !== 'public') await login(page, role.email);

    for (const u of role.urls) {
      console.log(`\n[${role.scope}] GET ${u}`);
      try {
        await page.goto(BASE + u, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(800);
      } catch (e) {
        issues.push({ scope: role.scope, url: u, problem: `nav failed: ${e?.message?.slice(0, 100)}`, kind: 'nav-fail' });
        console.log(`  ❌ nav fail`);
        continue;
      }

      const err = await detectError(page);
      if (err) {
        issues.push({ scope: role.scope, url: u, problem: err.detail, kind: err.kind });
        console.log(`  ❌ ${err.detail}`);
        continue;
      }
      console.log(`  ✓ page ok`);

      // Try common modal triggers (only for admin/kasir pages with management UI)
      if (role.scope !== 'customer' || u === '/orders') {
        const candidates = ['Tambah', 'Edit', 'Verifikasi', 'Tolak', 'Refund', 'Dispatch', 'Selesai', 'Batalkan'];
        for (const c of candidates) {
          const trig = page.locator('button', { hasText: new RegExp(`^${c}\\b`, 'i') }).first();
          if (await trig.count()) {
            const r = await tryOpenModal(page, c, role.scope, u);
            console.log(`    modal[${c}]: ${r.ok === true ? '✓' : r.ok === 'navigated' ? `→${r.target}` : '✗ ' + r.reason}`);
          }
        }
      }
    }

    await ctx.close();
  }

  console.log('\n\n══════════════ ISSUES SUMMARY ══════════════\n');
  if (!issues.length) {
    console.log('✅ No issues detected.');
  } else {
    for (const i of issues) {
      console.log(`[${i.scope}] ${i.kind} @ ${i.url}${i.trigger ? ' (trigger: ' + i.trigger + ')' : ''}`);
      console.log(`   → ${i.problem}\n`);
    }
    console.log(`\nTotal issues: ${issues.length}`);
  }

  await browser.close();
})();

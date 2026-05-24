/**
 * UML AS-BUILT — End-to-End Manual Book Walk-Through (modal-aware)
 * 1920×1080 desktop viewport, full-page screenshots.
 *
 * Output:
 *   docs/qa-reports/screenshots/*.png
 *   docs/qa-reports/.results.json
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = 'http://localhost:8080';
const SCREENSHOT_DIR = path.resolve('docs/qa-reports/screenshots');
const RESULTS_FILE = path.resolve('docs/qa-reports/.results.json');

if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const results = [];

async function shot(page, file) {
  const full = path.join(SCREENSHOT_DIR, `${file}.png`);
  await page.screenshot({ path: full, fullPage: true });
  return `screenshots/${file}.png`;
}

async function detectError(page) {
  try {
    const title = await page.title();
    const titleMarkers = [
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
    if (titleMarkers.some((m) => title.includes(m))) return title.slice(0, 200);

    const bodyError = await page.evaluate(() => {
      const t = (document.body?.innerText || '').slice(0, 500);
      const m = t.match(/^(Method Not Allowed|Not Found|Server Error|Page Expired|Forbidden|Unauthorized|Too Many Requests|Whoops|Service Unavailable)\b.*$/m);
      return m ? m[0] : null;
    });
    if (bodyError) return bodyError.slice(0, 200);
  } catch {}
  return null;
}

async function record(page, uc, name, url, component, condition, filename, status = 'pass', notes) {
  const screenshot = await shot(page, filename);

  let detectedError = null;
  if (status === 'pass') detectedError = await detectError(page);

  const finalStatus = detectedError ? 'fail' : status;
  const finalNotes = detectedError ? `[AUTO-DETECTED ERROR] ${detectedError}` : (notes ?? null);

  results.push({
    uc, name,
    url: url || page.url().replace(BASE_URL, ''),
    component, condition, screenshot,
    status: finalStatus, notes: finalNotes,
  });
  console.log(`  [${String(finalStatus).toUpperCase()}] ${uc} — ${name}`);
  if (detectedError) console.log(`         ⚠ ${detectedError}`);
}

/**
 * Click a trigger that opens a Radix/shadcn dialog/sheet, screenshot the modal,
 * then close it (Esc). Returns true if a modal was actually opened.
 */
async function captureModal(page, triggerLocator, uc, name, url, component, condition, filename, notes) {
  try {
    if (!(await triggerLocator.count())) {
      console.log(`         ↪ skip ${filename} (trigger not found)`);
      return false;
    }
    await triggerLocator.first().scrollIntoViewIfNeeded().catch(() => {});
    await triggerLocator.first().click({ timeout: 5000 });
    // Headless UI Transition needs time to mount + animate in
    await page.waitForTimeout(400);
    const modal = page.locator('[role="dialog"], [role="alertdialog"]').first();
    try {
      await modal.waitFor({ state: 'visible', timeout: 6000 });
    } catch {
      // Fallback: visible="visible" check on Transition wrapper
      const visibleByPortal = await page.locator('[data-headlessui-state="open"]').count();
      if (visibleByPortal === 0) {
        console.log(`         ⚠ modal not appearing for ${filename}`);
        await page.keyboard.press('Escape').catch(() => {});
        return false;
      }
    }
    // Let modal content render
    await page.waitForTimeout(800);
    await record(page, uc, name, url, component, condition, filename, 'pass', notes);
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(500);
    return true;
  } catch (e) {
    console.log(`         ⚠ modal capture failed: ${filename} (${e?.message?.slice(0, 80)})`);
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(300);
    return false;
  }
}

async function login(page, email, password = 'password') {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.locator('input[type="email"], input[autocomplete="email"]').first().fill(email);
  await page.locator('input[type="password"], input[autocomplete="current-password"]').first().fill(password);
  await Promise.all([
    page.waitForLoadState('networkidle').catch(() => {}),
    page.locator('button[type="submit"]').first().click(),
  ]);
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1200);
}

async function newSession(browser) {
  const ctx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  page.setDefaultTimeout(15000);
  page.setDefaultNavigationTimeout(20000);
  return { ctx, page };
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  // ════════════════════════════════════════════════════════════
  // UC-01 — Registrasi Customer
  // ════════════════════════════════════════════════════════════
  try {
    const { ctx, page } = await newSession(browser);
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
    await record(page, 'UC-01', 'Halaman Registrasi Customer', '/register', 'Form registrasi', 'Initial render', 'uc01-register-form');

    const ts = Date.now();
    const newEmail = `qa.${ts}@urban8.local`;
    await page.locator('input[autocomplete="name"], input[type="text"]').first().fill('F QA Tester');
    await page.locator('input[autocomplete="email"], input[type="email"]').first().fill(newEmail);
    await page.locator('input[autocomplete="tel"], input[type="tel"]').first().fill('081234567890').catch(() => {});
    const pwInputs = page.locator('input[type="password"]');
    await pwInputs.first().fill('Password1!');
    if ((await pwInputs.count()) > 1) await pwInputs.nth(1).fill('Password1!');
    await record(page, 'UC-01', 'Form Registrasi Filled', '/register', 'Form filled', 'Filled with valid data', 'uc01-register-filled');

    await Promise.all([
      page.waitForLoadState('networkidle').catch(() => {}),
      page.click('button[type="submit"]'),
    ]);
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1200);
    await record(page, 'UC-01', 'After Register Submit', page.url().replace(BASE_URL, ''), 'Submit success', 'Setelah register sukses', 'uc01-register-after', 'pass', `Email: ${newEmail}`);
    await ctx.close();
  } catch (e) { console.error('UC-01 error', e?.message); }

  // ════════════════════════════════════════════════════════════
  // UC-01b/UC-26 — Login + role redirect Customer
  // ════════════════════════════════════════════════════════════
  try {
    const { ctx, page } = await newSession(browser);
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await record(page, 'UC-01', 'Halaman Login', '/login', 'Form login', 'Initial', 'uc01b-login-form');
    await login(page, 'customer@urban8.com');
    await record(page, 'UC-26', 'Dashboard Customer (role redirect)', '/dashboard', 'Auto-redirect', 'Customer login', 'uc26-customer-dashboard');
    await ctx.close();
  } catch (e) { console.error('UC-01b error', e?.message); }

  // ════════════════════════════════════════════════════════════
  // UC-02 — Browse Katalog & Detail
  // ════════════════════════════════════════════════════════════
  try {
    const { ctx, page } = await newSession(browser);
    await page.goto(`${BASE_URL}/catalog`, { waitUntil: 'networkidle' });
    await record(page, 'UC-02', 'Browse Katalog (publik)', '/catalog', 'List kategori/kendaraan', 'Anonymous browse', 'uc02-catalog-index');

    const catalogLink = page.locator('a[href*="/catalog/"]:not([href$="/catalog"]), button[aria-label^="Pesan"]').first();
    if (await catalogLink.count()) {
      const tag = await catalogLink.evaluate((el) => el.tagName);
      if (tag === 'A') {
        const href = await catalogLink.getAttribute('href');
        if (href) {
          await page.goto(BASE_URL + href, { waitUntil: 'networkidle' });
          await page.waitForTimeout(1200);
          await record(page, 'UC-02', 'Detail Kategori/Kendaraan', href, 'Halaman detail', 'Click katalog item', 'uc02-catalog-detail');
        }
      } else {
        await Promise.all([
          page.waitForLoadState('networkidle').catch(() => {}),
          catalogLink.click(),
        ]);
        await page.waitForTimeout(1500);
        await record(page, 'UC-02', 'Detail Kategori/Kendaraan', page.url().replace(BASE_URL, ''), 'Halaman detail', 'Click katalog item', 'uc02-catalog-detail');
      }
    } else {
      await record(page, 'UC-02', 'Detail Kategori/Kendaraan', '/catalog', 'Detail link', 'Tidak ada item', 'uc02-catalog-empty', 'skip', 'Katalog kosong');
    }
    await ctx.close();
  } catch (e) { console.error('UC-02 error', e?.message); }

  // ════════════════════════════════════════════════════════════
  // UC-03..UC-08 — Customer Order Flow (modal step-by-step)
  // ════════════════════════════════════════════════════════════
  async function captureVehicleOrderSteps(page, email, prefix, loyalLabel) {
    await login(page, email);
    await page.goto(`${BASE_URL}/catalog`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    await record(page, 'UC-03', `${loyalLabel} — Mulai Buat Order`, '/catalog', 'Catalog list (logged-in)', 'Customer logged-in browsing', `${prefix}-order-start`);

    const trigger = page.locator('button[aria-label^="Pesan"]').first();
    if (!(await trigger.count())) {
      await record(page, 'UC-03', `${loyalLabel} — Form Order Tidak Tersedia`, '/catalog', 'Order modal', 'Catalog kosong / tombol Pesan tidak ada', `${prefix}-order-empty`, 'skip');
      return;
    }

    await trigger.click();
    await page.waitForTimeout(1000);
    await record(page, 'UC-03', `${loyalLabel} — Modal Order Step 1 Detail`, '/catalog', 'Vehicle order modal', 'Step 1 Detail kendaraan', `${prefix}-order-modal-step1-detail`);

    await page.locator('button[aria-label="Pesan Sekarang"]').last().click();
    await page.waitForTimeout(800);
    await record(page, 'UC-04', `${loyalLabel} — Modal Order Step 2 Form Sewa`, '/catalog', 'Order form fields', 'Step 2 Durasi/unit/waktu/lokasi', `${prefix}-order-modal-step2-form`);

    const tomorrow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    tomorrow.setHours(10, 0, 0, 0);
    const localDateTime = tomorrow.toISOString().slice(0, 16);
    await page.locator('input[type="number"]').first().fill('2');
    await page.locator('input[type="datetime-local"]').first().fill(localDateTime);
    await page.locator('input#out_of_town').check().catch(() => {});
    await page.waitForTimeout(500);
    await record(page, 'UC-05', `${loyalLabel} — Modal Order Step 2 Hitung Tarif`, '/catalog', 'Auto-quote panel', 'Estimasi total muncul setelah durasi diisi', `${prefix}-order-modal-step2-pricing`);

    await page.locator('button', { hasText: /Lanjutkan Pilih Pengemudi/i }).first().click();
    await page.waitForTimeout(900);
    await record(page, 'UC-06', `${loyalLabel} — Modal Order Step 3 Pilih Supir`, '/catalog', 'Driver selection in order modal', loyalLabel.includes('Non-loyal') ? 'Driver cards tetap tampil tapi disabled' : 'Driver cards selectable untuk loyal customer', `${prefix}-order-modal-step3-driver`);
  }

  try {
    const { ctx, page } = await newSession(browser);
    await captureVehicleOrderSteps(page, 'customer@urban8.com', 'uc03-nonloyal', 'Non-loyal customer');
    await ctx.close();
  } catch (e) { console.error('UC-03 non-loyal error', e?.message); }

  try {
    const { ctx, page } = await newSession(browser);
    await captureVehicleOrderSteps(page, 'loyal@urban8.com', 'uc03-loyal', 'Loyal customer');
    await page.goto(`${BASE_URL}/drivers`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await record(page, 'UC-06', 'Daftar Supir (loyal customer dapat memilih)', '/drivers', 'Driver list', 'Render', 'uc06-driver-list');

    await page.goto(`${BASE_URL}/shuttle`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await record(page, 'UC-08', 'Form Pesan Shuttle', '/shuttle', 'Form shuttle', 'Render form', 'uc08-shuttle-form');
    await ctx.close();
  } catch (e) { console.error('UC-03 loyal/UC-08 error', e?.message); }

  // ════════════════════════════════════════════════════════════
  // UC-09/UC-25/UC-24 — Customer order detail / upload bukti / receipt
  // ════════════════════════════════════════════════════════════
  try {
    const { ctx, page } = await newSession(browser);
    await login(page, 'customer@urban8.com');

    await page.goto(`${BASE_URL}/orders`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await record(page, 'UC-25', 'Riwayat Order Customer', '/orders', 'Orders list', 'Render list', 'uc25-orders-history');

    // Capture cancel-order modal trigger if any
    await captureModal(
      page,
      page.locator('button', { hasText: /^Batalkan$/ }),
      'UC-25', 'Modal Batalkan Order', '/orders',
      'Cancel-order dialog', 'Modal terbuka', 'uc25-cancel-modal',
    );

    const orderLink = page.locator('a[href^="/orders/"]').first();
    if (await orderLink.count()) {
      const href = await orderLink.getAttribute('href');
      if (href && /^\/orders\/\d+/.test(href)) {
        await page.goto(BASE_URL + href, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1500);
        await record(page, 'UC-09', 'Detail Order — Form Upload Bukti Transfer', href, 'Order detail + upload form', 'Order detail', 'uc09-order-detail-upload');
        await record(page, 'UC-24', 'Customer Receipt View (jika order Paid/Completed)', href, 'Receipt link/section', 'Order detail', 'uc24-receipt-view');

        // Attempt to open upload-bukti modal/section
        await captureModal(
          page,
          page.locator('button', { hasText: /Upload|Bukti/i }),
          'UC-09', 'Modal Upload Bukti Transfer', href,
          'Upload bukti dialog', 'Trigger upload bukti', 'uc09-upload-modal',
        );
      }
    }

    await ctx.close();
  } catch (e) { console.error('UC-09 error', e?.message); }

  // ════════════════════════════════════════════════════════════
  // UC-21/13/14/15/19/22/23/11/16/17/18/20/27 — Admin
  // ════════════════════════════════════════════════════════════
  try {
    const { ctx, page } = await newSession(browser);
    await login(page, 'admin@urban8.com');
    await record(page, 'UC-26', 'Role redirect Admin', page.url().replace(BASE_URL, ''), 'Auto-redirect', 'Admin login', 'uc26-admin-dashboard');

    await page.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await record(page, 'UC-21', 'Admin Dashboard Operasional', '/admin/dashboard', 'KPI cards + chart', 'Render dashboard', 'uc21-admin-dashboard');

    // ─── UC-13 Vehicles ───
    await page.goto(`${BASE_URL}/admin/vehicles`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    await record(page, 'UC-13', 'Kelola Kendaraan (List)', '/admin/vehicles', 'Vehicles index', 'List render', 'uc13-vehicles-index');
    await captureModal(
      page,
      page.locator('button', { hasText: /Tambah Kendaraan/i }),
      'UC-13', 'Modal Tambah Kendaraan', '/admin/vehicles',
      'Add vehicle dialog', 'Trigger tombol "+ Tambah Kendaraan"', 'uc13-vehicles-add-modal',
    );
    await captureModal(
      page,
      page.locator('tbody tr button', { hasText: /^Edit$/ }),
      'UC-13', 'Modal Edit Kendaraan', '/admin/vehicles',
      'Edit vehicle dialog', 'Trigger row "Edit"', 'uc13-vehicles-edit-modal',
    );

    // ─── UC-13 Categories ───
    await page.goto(`${BASE_URL}/admin/vehicle-categories`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    await record(page, 'UC-13', 'Kelola Kategori Kendaraan (List)', '/admin/vehicle-categories', 'Categories index', 'List render', 'uc13-categories-index');
    await captureModal(
      page,
      page.locator('button', { hasText: /Tambah Kategori|^\+ Tambah/i }).first(),
      'UC-13', 'Modal Tambah Kategori', '/admin/vehicle-categories',
      'Add category dialog', 'Trigger tombol Tambah', 'uc13-categories-add-modal',
    );

    // ─── UC-14 Pricing (inline form, no modal — form sudah visible di page) ───
    await page.goto(`${BASE_URL}/admin/pricing-rules`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await record(page, 'UC-14', 'Kelola Pricing Rule (List + Form Inline)', '/admin/pricing-rules', 'Pricing rule list + inline form', 'List render', 'uc14-pricing-rules');

    // Edit pricing rule (modal)
    await captureModal(
      page,
      page.locator('tbody tr button', { hasText: /^Edit$/ }),
      'UC-14', 'Modal Edit Pricing Rule', '/admin/pricing-rules',
      'Edit pricing dialog', 'Trigger row "Edit"', 'uc14-pricing-edit-modal',
    );

    // Switch to overtime tab
    const overtimeTab = page.locator('button', { hasText: /Overtime|Penalty/i }).first();
    if (await overtimeTab.count()) {
      await overtimeTab.click().catch(() => {});
      await page.waitForTimeout(800);
    }
    await record(page, 'UC-14', 'Kelola Overtime Penalty (List + Form Inline)', '/admin/pricing-rules', 'Overtime tab + inline form', 'Render', 'uc14-overtime');
    await captureModal(
      page,
      page.locator('tbody tr button', { hasText: /^Edit$/ }),
      'UC-14', 'Modal Edit Overtime Penalty', '/admin/pricing-rules',
      'Edit overtime dialog', 'Trigger row "Edit" di tab Overtime', 'uc14-overtime-edit-modal',
    );

    // ─── UC-15 Drivers ───
    await page.goto(`${BASE_URL}/admin/drivers`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    await record(page, 'UC-15', 'Kelola Data Supir (List)', '/admin/drivers', 'Drivers index', 'List render', 'uc15-drivers');
    await captureModal(
      page,
      page.locator('button', { hasText: /Tambah Pengemudi|Tambah Driver/i }),
      'UC-15', 'Modal Tambah Supir', '/admin/drivers',
      'Add driver dialog', 'Trigger "+ Tambah Pengemudi"', 'uc15-drivers-add-modal',
    );

    // ─── UC-19 Shuttle (inline form like pricing) ───
    await page.goto(`${BASE_URL}/admin/shuttle-tariffs`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await record(page, 'UC-19', 'Kelola Tarif Shuttle (List + Form Inline)', '/admin/shuttle-tariffs', 'Shuttle tariff list + inline form', 'List render', 'uc19-shuttle-tariffs');
    await captureModal(
      page,
      page.locator('tbody tr button', { hasText: /^Edit$/ }),
      'UC-19', 'Modal Edit Tarif Shuttle', '/admin/shuttle-tariffs',
      'Edit shuttle dialog', 'Trigger row "Edit"', 'uc19-shuttle-edit-modal',
    );

    // ─── UC-22 Reports ───
    await page.goto(`${BASE_URL}/admin/reports`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    await record(page, 'UC-22', 'Generate Laporan Transaksi & Revenue', '/admin/reports', 'Reports page', 'Render', 'uc22-reports');

    // ─── UC-23 Audit Log ───
    let auditOk = false;
    for (const candidate of ['/admin/audit-logs', '/admin/audits', '/admin/logs']) {
      const resp = await page.goto(`${BASE_URL}${candidate}`, { waitUntil: 'networkidle' }).catch(() => null);
      if (resp && resp.status() < 400) {
        await page.waitForTimeout(1000);
        await record(page, 'UC-23', 'View Audit Log', candidate, 'Audit log page', 'Akses route', 'uc23-audit-logs');
        auditOk = true;
        break;
      }
    }
    if (!auditOk) {
      await page.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: 'networkidle' });
      await record(page, 'UC-23', 'View Audit Log (route belum ter-expose)', '/admin/dashboard', 'Audit log surface', 'Tidak ada route admin/audit-logs', 'uc23-audit-logs-na', 'skip', 'Audit log via service AuditLogger; tidak ada UI list eksplisit');
    }

    // ─── UC-11 Verifikasi Pembayaran ───
    await page.goto(`${BASE_URL}/admin/payments/verification`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await record(page, 'UC-11', 'Halaman Verifikasi Transfer (Admin)', '/admin/payments/verification', 'Pending verification list', 'Render verifikasi list', 'uc11-admin-verification');
    await captureModal(
      page,
      page.locator('tbody tr button', { hasText: /^Setujui$/ }).first(),
      'UC-11', 'Modal Verifikasi Pembayaran (Setujui)', '/admin/payments/verification',
      'Approve payment dialog', 'Trigger row "Setujui"', 'uc11-verify-approve-modal',
    );
    await captureModal(
      page,
      page.locator('tbody tr button', { hasText: /^Tolak$/ }).first(),
      'UC-11', 'Modal Tolak Pembayaran', '/admin/payments/verification',
      'Reject payment dialog', 'Trigger row "Tolak"', 'uc11-verify-reject-modal',
    );

    // ─── UC-16/17/18/20 Admin Order Lifecycle ───
    // Strategy: pake order seeder dengan status spesifik (avoid relying on first
    // link in list, karena admin list ordered by date so could be any status):
    //   ORD-DEMO-0004 = ReadyToDispatch  → modal Dispatch & Cancel
    //   ORD-DEMO-0005 = Ongoing          → modal Return
    //   ORD-DEMO-0006 = WaitingOvertimePayment → modal Complete
    await page.goto(`${BASE_URL}/admin/orders`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    await record(page, 'UC-16', 'Admin Order Lifecycle — List', '/admin/orders', 'Orders index', 'List render', 'uc16-orders-list');

    // Detail (ReadyToDispatch) — Dispatch + Cancel
    {
      const href = '/admin/orders/ORD-DEMO-0004';
      await page.goto(BASE_URL + href, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
      await record(page, 'UC-16', 'Admin Order Lifecycle — Detail (ReadyToDispatch)', href, 'Action buttons', 'Detail render', 'uc16-order-detail');
      await record(page, 'UC-18', 'Hitung Overtime (panel di detail)', href, 'Overtime panel', 'Display', 'uc18-overtime-display');
      await captureModal(
        page,
        page.locator('button', { hasText: /Kirim Kendaraan/i }),
        'UC-16', 'Modal Kirim Kendaraan (Dispatch)', href,
        'Dispatch dialog', 'Trigger "Kirim Kendaraan"', 'uc16-dispatch-modal',
      );
      await captureModal(
        page,
        page.locator('button', { hasText: /Batalkan Pesanan/i }),
        'UC-16', 'Modal Cancel Order (Admin)', href,
        'Cancel order dialog', 'Trigger "Batalkan Pesanan"', 'uc16-cancel-modal',
      );
    }

    // Ongoing — Return form (inline)
    {
      const href = '/admin/orders/ORD-DEMO-0005';
      await page.goto(BASE_URL + href, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
      await record(page, 'UC-17', 'Admin Order — Form Catat Return (Ongoing)', href, 'Return form (inline)', 'Render form pengembalian', 'uc17-return-form');
    }

    // WaitingOvertimePayment — Complete
    {
      const href = '/admin/orders/ORD-DEMO-0006';
      await page.goto(BASE_URL + href, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
      await record(page, 'UC-20', 'Admin Order — Detail (WaitingOvertimePayment)', href, 'Complete button', 'Detail render dengan tombol Complete', 'uc20-complete-detail');
      await captureModal(
        page,
        page.locator('button', { hasText: /Selesaikan Pesanan|Selesaikan/i }),
        'UC-20', 'Modal Complete Order', href,
        'Complete dialog', 'Trigger "Selesaikan Pesanan"', 'uc20-complete-modal',
      );
    }

    // ─── UC-27 Refund ───
    await page.goto(`${BASE_URL}/admin/payments/verification?tab=paid`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await record(page, 'UC-27', 'Refund — Paid tab list', '/admin/payments/verification?tab=paid', 'Paid tab', 'List pembayaran Paid yang bisa di-refund', 'uc27-refund-list');
    await captureModal(
      page,
      page.locator('tbody tr button', { hasText: /^Refund$/ }).first(),
      'UC-27', 'Modal Refund Pembayaran', '/admin/payments/verification?tab=paid',
      'Refund dialog', 'Trigger row "Refund"', 'uc27-refund-modal',
    );

    // ─── UC-22 Settings ───
    await page.goto(`${BASE_URL}/admin/settings`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    await record(page, 'UC-22', 'Admin Settings', '/admin/settings', 'Settings page', 'Render', 'uc22-settings');

    await ctx.close();
  } catch (e) { console.error('Admin error', e?.message); }

  // ════════════════════════════════════════════════════════════
  // UC-10/11/12 — Kasir
  // ════════════════════════════════════════════════════════════
  try {
    const { ctx, page } = await newSession(browser);
    await login(page, 'kasir@urban8.com');
    await record(page, 'UC-26', 'Role redirect Kasir', page.url().replace(BASE_URL, ''), 'Auto-redirect', 'Kasir login', 'uc26-kasir-dashboard');

    await page.goto(`${BASE_URL}/admin/payments/verification`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await record(page, 'UC-11', 'Verifikasi Transfer (Kasir)', '/admin/payments/verification', 'Verifikasi tabs', 'Render', 'uc11-kasir-verification');

    // Cash record modal — typically a button "Catat Tunai" / "Bayar Tunai" / etc.
    await captureModal(
      page,
      page.locator('tbody tr button', { hasText: /Tunai|Cash|Catat Pembayaran/i }).first(),
      'UC-10', 'Modal Input Pembayaran Tunai', '/admin/payments/verification',
      'Cash record dialog', 'Trigger tombol Tunai', 'uc10-cash-modal',
    );

    // Receipt — kebanyakan flow buka file PDF/page baru (bukan modal). Kita capture
    // halaman list dgn highlight tombol Lihat Bukti
    const receiptLink = page.locator('tbody tr a, tbody tr button').filter({ hasText: /Kwitansi|Lihat Bukti/i }).first();
    if (await receiptLink.count()) {
      await record(page, 'UC-12', 'Generate Kwitansi (link receipt visible)', '/admin/payments/verification', 'Receipt link visible', 'List dengan tombol Lihat Bukti/Kwitansi', 'uc12-kasir-receipt-link');
    } else {
      await record(page, 'UC-12', 'Generate Kwitansi', '/admin/payments/verification', 'Receipt access', 'Tidak ada tombol kwitansi visible (mungkin perlu order Paid)', 'uc12-kasir-receipt-na', 'skip', 'Receipt link cuma muncul untuk payment status Paid');
    }

    await ctx.close();
  } catch (e) { console.error('Kasir error', e?.message); }

  // ════════════════════════════════════════════════════════════
  // Driver login (read-only)
  // ════════════════════════════════════════════════════════════
  try {
    const { ctx, page } = await newSession(browser);
    await login(page, 'driver@urban8.com');
    await record(page, 'UC-26', 'Role redirect Driver', page.url().replace(BASE_URL, ''), 'Auto-redirect', 'Driver login', 'uc26-driver-dashboard');
    await ctx.close();
  } catch (e) { console.error('Driver error', e?.message); }

  fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
  console.log(`\n✅ Selesai. Hasil disimpan ke ${RESULTS_FILE}`);
  console.log(`📸 Screenshot folder: ${SCREENSHOT_DIR}`);
  console.log(`📊 Total cases captured: ${results.length}`);
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const skipped = results.filter(r => r.status === 'skip').length;
  console.log(`   ✅ ${passed}  ❌ ${failed}  ⏭️ ${skipped}`);

  await browser.close();
})().catch((err) => {
  console.error('FATAL', err);
  fs.writeFileSync(RESULTS_FILE, JSON.stringify({ error: String(err), partial: results }, null, 2));
  process.exit(1);
});

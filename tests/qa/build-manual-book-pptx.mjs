/**
 * Build Manual Book PPT (Indonesian) — Rent-Car Urban8
 * Theme: Midnight Executive (navy + ice blue + amber gold)
 * Output: docs/qa-reports/Manual-Book-Rent-Car.pptx
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const pptxgen = require('pptxgenjs');

const ROOT = '/mnt/c/laragon/www/rent-car';
const RESULTS = path.join(ROOT, 'docs/qa-reports/.results.json');
const SHOTS = path.join(ROOT, 'docs/qa-reports/screenshots');
const OUT = path.join(ROOT, 'docs/qa-reports/Manual-Book-Rent-Car.pptx');

const NAVY = '1E2761';
const ICE = 'CADCFC';
const GOLD = 'F4B400';
const SLATE = '64748B';
const DARK = '0B1736';
const WHITE = 'FFFFFF';
const SUCCESS = '16A34A';
const WARN = 'F59E0B';

const results = JSON.parse(fs.readFileSync(RESULTS, 'utf8'));

// Group by UC code (preserve insertion order)
const groups = new Map();
for (const r of results) {
  const uc = r.uc || 'UC-??';
  if (!groups.has(uc)) groups.set(uc, []);
  groups.get(uc).push(r);
}

// Use case metadata: title + actor + module description
const UC_META = {
  'UC-01': { title: 'Registrasi & Login', actor: 'Customer', module: 'Authentication',
    desc: 'Customer baru dapat membuat akun dan masuk ke sistem. Akun terverifikasi via email + password yang di-hash bcrypt.' },
  'UC-02': { title: 'Browse Katalog & Detail Kendaraan', actor: 'Public / Customer', module: 'Catalog',
    desc: 'Pengunjung dan customer dapat melihat seluruh kendaraan yang tersedia, filter per kategori, dan lihat detail spesifikasi.' },
  'UC-03': { title: 'Mulai Buat Order Kendaraan', actor: 'Customer', module: 'Rental Order',
    desc: 'Customer memilih kendaraan dari katalog, modal order step-by-step terbuka. Step 1: detail kendaraan + spesifikasi.' },
  'UC-04': { title: 'Form Order — Durasi & Lokasi', actor: 'Customer', module: 'Rental Order',
    desc: 'Step 2: customer mengisi durasi sewa, satuan (jam/hari), waktu mulai, opsi pickup, dan alamat pengantaran.' },
  'UC-05': { title: 'Hitung Tarif Otomatis', actor: 'Customer / System', module: 'Pricing Engine',
    desc: 'Sistem otomatis menghitung total tarif berdasarkan PricingRule (per kategori + unit) + biaya luar kota +20%. Updated real-time.' },
  'UC-06': { title: 'Pilih Pengemudi (Loyal Privilege)', actor: 'Customer Loyal', module: 'Driver Selection',
    desc: 'Step 3: customer pilih driver. Loyal customer dapat memilih driver spesifik. Non-loyal melihat list tapi disabled (auto-assign oleh admin).' },
  'UC-07': { title: 'Upgrade Kendaraan (Free)', actor: 'Customer / Admin', module: 'Upgrade Offer',
    desc: 'Jika kendaraan dipesan tidak tersedia, sistem menawarkan upgrade gratis ke kelas lebih tinggi. Manual approval di v1.0 (TODO auto v1.1).' },
  'UC-08': { title: 'Pesan Shuttle Bandara/Stasiun', actor: 'Customer', module: 'Shuttle Order',
    desc: 'Form pesan shuttle dengan ShuttleTariff fixed price. Pickup point + destinasi + jadwal jemput.' },
  'UC-09': { title: 'Lihat Detail Order & Upload Bukti Transfer', actor: 'Customer', module: 'Order Detail',
    desc: 'Customer akses detail order (by order_number). Bisa upload bukti transfer untuk metode BankTransfer, lihat status payment.' },
  'UC-10': { title: 'Catat Pembayaran Tunai (Kasir)', actor: 'Kasir', module: 'Payment',
    desc: 'Kasir mencatat pembayaran cash dengan validasi amount = payment.amount (anti-fraud). Status payment Unpaid → Paid.' },
  'UC-11': { title: 'Verifikasi Pembayaran Transfer', actor: 'Admin / Kasir', module: 'Payment Verification',
    desc: 'Admin/Kasir verifikasi bukti transfer. Approve → status WaitingVerification → Paid. Reject → kembali Unpaid + alasan.' },
  'UC-12': { title: 'Generate & Cetak Kuitansi', actor: 'System / Kasir', module: 'Receipt',
    desc: 'Setelah Paid, sistem auto-generate Receipt dengan kode KWT-DEMO-####. Kasir bisa preview dan cetak.' },
  'UC-13': { title: 'Kelola Kendaraan & Kategori', actor: 'Admin', module: 'Vehicle Master',
    desc: 'CRUD penuh atas Vehicle (plate, brand, model, kapasitas, tarif harian, status) dan VehicleCategory.' },
  'UC-14': { title: 'Kelola Pricing Rule & Overtime Penalty', actor: 'Admin', module: 'Pricing',
    desc: 'Set tarif per kategori per RentalUnit (Hour/Day) dan denda overtime per jam keterlambatan.' },
  'UC-15': { title: 'Kelola Data Pengemudi', actor: 'Admin', module: 'Driver Master',
    desc: 'CRUD driver: nama, SIM, nomor HP, status (aktif/nonaktif). Driver dapat di-assign ke order.' },
  'UC-16': { title: 'Lifecycle Order — Dispatch & Cancel', actor: 'Admin', module: 'Order Lifecycle',
    desc: 'Admin kirim kendaraan (Paid → ReadyToDispatch → Ongoing) atau batalkan order. Cancel after Paid trigger refund flow.' },
  'UC-17': { title: 'Catat Pengembalian Kendaraan', actor: 'Admin', module: 'Order Return',
    desc: 'Admin catat actual_return_at saat customer kembalikan kendaraan. Sistem deteksi overtime jika > scheduled return.' },
  'UC-18': { title: 'Hitung Overtime Penalty', actor: 'System', module: 'Pricing Engine',
    desc: 'Auto-hitung denda overtime: ceil(menit_terlambat / 60) * tarif_per_jam dari OvertimePenalty. Status order → WaitingOvertimePayment.' },
  'UC-19': { title: 'Kelola Tarif Shuttle', actor: 'Admin', module: 'Shuttle Master',
    desc: 'CRUD ShuttleTariff: pickup point, destinasi, jarak (km), durasi estimasi, tarif fixed.' },
  'UC-20': { title: 'Selesaikan Order (Complete)', actor: 'Admin', module: 'Order Lifecycle',
    desc: 'Admin tandai order Completed setelah seluruh pembayaran (incl overtime) sudah verified. Order tertutup.' },
  'UC-21': { title: 'Dashboard Operasional Admin', actor: 'Admin', module: 'Dashboard',
    desc: 'Ringkasan operasional: order hari ini, pembayaran pending, kendaraan tersedia, revenue periode.' },
  'UC-22': { title: 'Generate Laporan & Settings', actor: 'Admin', module: 'Reports',
    desc: 'Generate laporan transaksi & revenue per periode. Konfigurasi setting global (PPN, biaya admin, dll).' },
  'UC-23': { title: 'View Audit Log', actor: 'Admin', module: 'Audit',
    desc: 'AuditLogger backend service mencatat seluruh perubahan kritis (login, payment, dispatch, refund). UI viewer optional.' },
  'UC-24': { title: 'Notifikasi Order ke Customer', actor: 'System', module: 'Notification',
    desc: 'Customer mendapat notifikasi (via Notification model + telegram bot) untuk perubahan status order.' },
  'UC-25': { title: 'Riwayat Order & Cancel Customer-side', actor: 'Customer', module: 'Order History',
    desc: 'Customer lihat riwayat seluruh order (Paid, Ongoing, Completed, Cancelled). Bisa cancel order dengan status PendingPayment/WaitingVerification.' },
  'UC-26': { title: 'Role-based Dashboard Redirect', actor: 'All', module: 'Auth Routing',
    desc: 'Setelah login, sistem redirect berdasarkan role: Customer → /dashboard, Admin → /admin, Kasir → /kasir, Driver → /driver.' },
  'UC-27': { title: 'Refund Pembayaran (Admin)', actor: 'Admin', module: 'Payment Refund',
    desc: 'Admin refund payment Paid via tab Refund. Modal isi alasan (min 5 char). Payment Paid → Refunded, order terkait di-cancel + audit log.' },
};

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';   // 13.3 x 7.5
pres.author = 'Engineer Urban8';
pres.title = 'Manual Book — Rent-Car (Urban8)';
pres.subject = 'Panduan Pemakaian Aplikasi & Demo Modul';
pres.company = 'Urban8 Rent-Car';

const W = 13.3, H = 7.5;

// ============ helpers ============
function footer(slide, page) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: H - 0.35, w: W, h: 0.35,
    fill: { color: NAVY }, line: { color: NAVY, width: 0 },
  });
  slide.addText('Manual Book · Rent-Car Urban8', {
    x: 0.5, y: H - 0.32, w: 6, h: 0.3, fontSize: 9, color: ICE, fontFace: 'Calibri',
    valign: 'middle',
  });
  slide.addText(String(page), {
    x: W - 0.9, y: H - 0.32, w: 0.4, h: 0.3, fontSize: 9, color: ICE, fontFace: 'Calibri',
    valign: 'middle', align: 'right', bold: true,
  });
}

function pageHeader(slide, eyebrow, title) {
  slide.addText(eyebrow, {
    x: 0.5, y: 0.4, w: 12.3, h: 0.4,
    fontSize: 12, color: GOLD, fontFace: 'Calibri', bold: true, charSpacing: 4,
    margin: 0, valign: 'top',
  });
  slide.addText(title, {
    x: 0.5, y: 0.75, w: 12.3, h: 0.85,
    fontSize: 32, color: NAVY, fontFace: 'Georgia', bold: true,
    margin: 0, valign: 'top',
  });
}

function statusBadge(slide, x, y, status) {
  const palette = status === 'pass' ? { bg: SUCCESS, fg: WHITE, label: 'PASS' }
                : status === 'skip' ? { bg: WARN, fg: WHITE, label: 'SKIP' }
                : { bg: 'DC2626', fg: WHITE, label: 'FAIL' };
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w: 0.7, h: 0.32,
    fill: { color: palette.bg }, line: { color: palette.bg, width: 0 }, rectRadius: 0.05,
  });
  slide.addText(palette.label, {
    x, y, w: 0.7, h: 0.32,
    fontSize: 10, bold: true, color: palette.fg, align: 'center', valign: 'middle',
    fontFace: 'Calibri', margin: 0,
  });
}

// ============ Cover slide ============
{
  const s = pres.addSlide();
  s.background = { color: DARK };

  // Diagonal accent block
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.35, h: H,
    fill: { color: GOLD }, line: { color: GOLD, width: 0 },
  });

  s.addText('URBAN8 RENT-CAR', {
    x: 1, y: 1.0, w: 11, h: 0.5,
    fontSize: 14, bold: true, color: GOLD, fontFace: 'Calibri', charSpacing: 8, margin: 0,
  });

  s.addText('Manual Book', {
    x: 1, y: 1.6, w: 11, h: 1.5,
    fontSize: 72, bold: true, color: WHITE, fontFace: 'Georgia', margin: 0,
  });

  s.addText('Panduan Pemakaian Aplikasi + Demo Setiap Modul', {
    x: 1, y: 3.3, w: 11, h: 0.6,
    fontSize: 22, italic: true, color: ICE, fontFace: 'Georgia', margin: 0,
  });

  s.addText([
    { text: 'Stack: ', options: { color: SLATE, fontFace: 'Calibri' } },
    { text: 'Laravel 13 · Inertia · React 19 · Tailwind 4 · Postgres 15', options: { color: WHITE, bold: true, fontFace: 'Calibri' } },
  ], {
    x: 1, y: 4.1, w: 11, h: 0.4, fontSize: 14, margin: 0,
  });

  s.addText([
    { text: 'Coverage: ', options: { color: SLATE, fontFace: 'Calibri' } },
    { text: '27 Use Case · 55 Test Case · 54 PASS / 1 SKIP / 0 FAIL', options: { color: WHITE, bold: true, fontFace: 'Calibri' } },
  ], {
    x: 1, y: 4.5, w: 11, h: 0.4, fontSize: 14, margin: 0,
  });

  s.addText([
    { text: 'Tanggal: ', options: { color: SLATE, fontFace: 'Calibri' } },
    { text: new Date().toISOString().slice(0, 10), options: { color: WHITE, bold: true, fontFace: 'Calibri' } },
    { text: '   ·   ', options: { color: SLATE, fontFace: 'Calibri' } },
    { text: 'Versi: ', options: { color: SLATE, fontFace: 'Calibri' } },
    { text: '1.0 · UML AS-BUILT', options: { color: WHITE, bold: true, fontFace: 'Calibri' } },
  ], {
    x: 1, y: 4.9, w: 11, h: 0.4, fontSize: 14, margin: 0,
  });

  // Bottom bar
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: H - 0.6, w: W, h: 0.6,
    fill: { color: NAVY }, line: { color: NAVY, width: 0 },
  });
  s.addText('Disusun oleh tim Engineering Urban8 · Internal Documentation', {
    x: 1, y: H - 0.55, w: 11, h: 0.5,
    fontSize: 11, color: ICE, fontFace: 'Calibri', italic: true, valign: 'middle', margin: 0,
  });
}

// ============ Daftar Isi ============
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  pageHeader(s, 'DAFTAR ISI', 'Apa yang dibahas');

  const items = [
    ['1', 'Tentang Aplikasi', 'Stack, modul, dan ringkasan domain'],
    ['2', 'Akun & Akses', 'Role, kredensial seeder, redirect dashboard'],
    ['3', 'Coverage E2E Test', '55 case Playwright headless 1920×1080'],
    ['4', 'Demo Modul Customer', 'UC-01..UC-09, UC-25 (registrasi → order → bukti)'],
    ['5', 'Demo Modul Admin', 'UC-11..UC-22, UC-27 (verifikasi, lifecycle, refund)'],
    ['6', 'Demo Modul Kasir & Driver', 'UC-10, UC-12, UC-26'],
    ['7', 'Lampiran', 'Log audit, settings, dan ringkasan UC'],
  ];

  let y = 1.9;
  for (const [num, title, sub] of items) {
    s.addShape(pres.shapes.OVAL, {
      x: 0.6, y: y + 0.05, w: 0.6, h: 0.6,
      fill: { color: NAVY }, line: { color: NAVY, width: 0 },
    });
    s.addText(num, { x: 0.6, y: y + 0.05, w: 0.6, h: 0.6, fontSize: 20, bold: true, color: GOLD, fontFace: 'Georgia', align: 'center', valign: 'middle', margin: 0 });
    s.addText(title, { x: 1.5, y: y, w: 9, h: 0.4, fontSize: 18, bold: true, color: NAVY, fontFace: 'Georgia', margin: 0 });
    s.addText(sub, { x: 1.5, y: y + 0.4, w: 11, h: 0.35, fontSize: 13, color: SLATE, fontFace: 'Calibri', italic: true, margin: 0 });
    y += 0.72;
  }

  footer(s, 2);
}

// ============ Tentang Aplikasi ============
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  pageHeader(s, 'BAB 1', 'Tentang Aplikasi');

  // Left column — narrative
  s.addText('Apa itu Urban8 Rent-Car?', { x: 0.5, y: 1.7, w: 6.3, h: 0.5, fontSize: 20, bold: true, color: NAVY, fontFace: 'Georgia', margin: 0 });
  s.addText(
    'Aplikasi rental kendaraan + shuttle service untuk customer retail dan korporat. Mendukung pemesanan kendaraan harian/jam, layanan jemput-antar bandara/stasiun, manajemen driver, sistem refund, dan audit-log untuk seluruh transaksi.',
    { x: 0.5, y: 2.2, w: 6.3, h: 1.6, fontSize: 13, color: '1F2937', fontFace: 'Calibri', valign: 'top', margin: 0 }
  );

  s.addText('Modul utama', { x: 0.5, y: 3.85, w: 6.3, h: 0.4, fontSize: 18, bold: true, color: NAVY, fontFace: 'Georgia', margin: 0 });
  s.addText([
    { text: 'Customer Portal', options: { bold: true, breakLine: true } },
    { text: '   Registrasi, katalog, pemesanan, riwayat, upload bukti', options: { color: SLATE, breakLine: true } },
    { text: 'Admin Console', options: { bold: true, breakLine: true } },
    { text: '   CRUD master data, verifikasi, lifecycle, laporan, refund', options: { color: SLATE, breakLine: true } },
    { text: 'Kasir Console', options: { bold: true, breakLine: true } },
    { text: '   Catat tunai, cetak kuitansi, verifikasi transfer', options: { color: SLATE, breakLine: true } },
    { text: 'Driver Portal', options: { bold: true, breakLine: true } },
    { text: '   Lihat order assigned, status keberangkatan', options: { color: SLATE } },
  ], { x: 0.5, y: 4.3, w: 6.3, h: 2.7, fontSize: 12, color: '1F2937', fontFace: 'Calibri', valign: 'top', margin: 0 });

  // Right column — stack stats
  const cardX = 7.2, cardW = 5.6;
  s.addShape(pres.shapes.RECTANGLE, { x: cardX, y: 1.7, w: cardW, h: 5.3, fill: { color: NAVY }, line: { color: NAVY, width: 0 } });
  s.addText('TECH STACK', { x: cardX + 0.4, y: 1.9, w: cardW - 0.8, h: 0.4, fontSize: 12, bold: true, color: GOLD, fontFace: 'Calibri', charSpacing: 4, margin: 0 });

  const stack = [
    ['Backend', 'Laravel 13 · PHP 8.3 · Postgres 15'],
    ['Frontend', 'Inertia v3 · React 19 · TypeScript · Tailwind 4'],
    ['Auth', 'Fortify + Spatie Permission (4 role)'],
    ['Routing', 'Wayfinder typed routes'],
    ['Testing', 'Pest 3 · Playwright 1920×1080'],
    ['Deploy', 'Docker Compose · Nginx · Vite build'],
  ];
  let yy = 2.4;
  for (const [k, v] of stack) {
    s.addText(k.toUpperCase(), { x: cardX + 0.4, y: yy, w: cardW - 0.8, h: 0.3, fontSize: 9, color: ICE, charSpacing: 3, fontFace: 'Calibri', margin: 0 });
    s.addText(v, { x: cardX + 0.4, y: yy + 0.28, w: cardW - 0.8, h: 0.4, fontSize: 14, bold: true, color: WHITE, fontFace: 'Calibri', margin: 0 });
    yy += 0.74;
  }

  footer(s, 3);
}

// ============ Akun & Akses ============
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  pageHeader(s, 'BAB 2', 'Akun & Akses');

  s.addText('Role yang didukung sistem', { x: 0.5, y: 1.7, w: 12.3, h: 0.4, fontSize: 18, bold: true, color: NAVY, fontFace: 'Georgia', margin: 0 });

  // 4 role cards
  const roles = [
    { code: 'CUSTOMER', email: 'customer@urban8.com', desc: 'Akun publik. Registrasi mandiri. Akses katalog, pemesanan, riwayat, upload bukti, cancel order pending.', color: '0891B2' },
    { code: 'ADMIN', email: 'admin@urban8.com', desc: 'Hak penuh: master data, lifecycle order, verifikasi, refund, laporan, settings.', color: '7C3AED' },
    { code: 'KASIR', email: 'kasir@urban8.com', desc: 'Catat pembayaran tunai, cetak kuitansi, verifikasi transfer (limited).', color: 'F59E0B' },
    { code: 'DRIVER', email: 'driver@urban8.com', desc: 'Lihat order yang ditugaskan, status keberangkatan kendaraan.', color: 'EF4444' },
  ];

  let cx = 0.5;
  const cw = (W - 1 - 0.45) / 4;
  for (const r of roles) {
    s.addShape(pres.shapes.RECTANGLE, { x: cx, y: 2.25, w: 0.12, h: 4.5, fill: { color: r.color }, line: { color: r.color, width: 0 } });
    s.addShape(pres.shapes.RECTANGLE, { x: cx + 0.12, y: 2.25, w: cw - 0.12, h: 4.5, fill: { color: 'F8FAFC' }, line: { color: 'E2E8F0', width: 1 } });

    s.addText(r.code, { x: cx + 0.35, y: 2.45, w: cw - 0.6, h: 0.4, fontSize: 14, bold: true, color: r.color, fontFace: 'Calibri', charSpacing: 4, margin: 0 });
    s.addText('Login email', { x: cx + 0.35, y: 2.95, w: cw - 0.6, h: 0.3, fontSize: 9, color: SLATE, charSpacing: 2, fontFace: 'Calibri', margin: 0 });
    s.addText(r.email, { x: cx + 0.35, y: 3.18, w: cw - 0.6, h: 0.4, fontSize: 12, bold: true, color: NAVY, fontFace: 'Consolas', margin: 0 });
    s.addText('Password', { x: cx + 0.35, y: 3.7, w: cw - 0.6, h: 0.3, fontSize: 9, color: SLATE, charSpacing: 2, fontFace: 'Calibri', margin: 0 });
    s.addText('password', { x: cx + 0.35, y: 3.93, w: cw - 0.6, h: 0.4, fontSize: 12, bold: true, color: NAVY, fontFace: 'Consolas', margin: 0 });
    s.addText('Akses', { x: cx + 0.35, y: 4.45, w: cw - 0.6, h: 0.3, fontSize: 9, color: SLATE, charSpacing: 2, fontFace: 'Calibri', margin: 0 });
    s.addText(r.desc, { x: cx + 0.35, y: 4.68, w: cw - 0.6, h: 2, fontSize: 10.5, color: '1F2937', fontFace: 'Calibri', valign: 'top', margin: 0 });
    cx += cw + 0.15;
  }

  footer(s, 4);
}

// ============ Coverage stats ============
{
  const s = pres.addSlide();
  s.background = { color: DARK };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.35, h: H, fill: { color: GOLD }, line: { color: GOLD, width: 0 } });

  s.addText('BAB 3', { x: 1, y: 0.6, w: 12, h: 0.4, fontSize: 12, bold: true, color: GOLD, fontFace: 'Calibri', charSpacing: 4, margin: 0 });
  s.addText('Coverage E2E Test', { x: 1, y: 1.0, w: 12, h: 0.9, fontSize: 36, bold: true, color: WHITE, fontFace: 'Georgia', margin: 0 });
  s.addText('Playwright headless Chromium · viewport 1920×1080 · full-page screenshots', { x: 1, y: 1.95, w: 12, h: 0.4, fontSize: 14, italic: true, color: ICE, fontFace: 'Georgia', margin: 0 });

  // Big stat callouts
  const pass = results.filter(r => r.status === 'pass').length;
  const skip = results.filter(r => r.status === 'skip').length;
  const fail = results.filter(r => r.status === 'fail').length;
  const ucCount = new Set(results.map(r => r.uc)).size;
  const stats = [
    { num: String(results.length), label: 'TOTAL CASES', color: WHITE },
    { num: String(pass), label: 'PASS', color: SUCCESS },
    { num: String(skip), label: 'SKIP', color: WARN },
    { num: String(fail), label: 'FAIL', color: 'DC2626' },
  ];
  let cx = 1.0;
  const sw = (W - 2) / 4;
  for (const st of stats) {
    s.addText(st.num, { x: cx, y: 2.9, w: sw, h: 1.7, fontSize: 96, bold: true, color: st.color, fontFace: 'Georgia', align: 'center', valign: 'middle', margin: 0 });
    s.addText(st.label, { x: cx, y: 4.65, w: sw, h: 0.4, fontSize: 12, color: ICE, charSpacing: 4, align: 'center', fontFace: 'Calibri', margin: 0 });
    cx += sw;
  }

  // Coverage bar
  s.addText(`${ucCount} use case ter-cover dari 27 yang dipetakan di UML AS-BUILT`, {
    x: 1, y: 5.5, w: 11.3, h: 0.4, fontSize: 14, italic: true, color: ICE, fontFace: 'Georgia', align: 'center', margin: 0,
  });
  // simple progress
  s.addShape(pres.shapes.RECTANGLE, { x: 3, y: 6.05, w: 7.3, h: 0.3, fill: { color: '1A2845' }, line: { color: '1A2845', width: 0 } });
  s.addShape(pres.shapes.RECTANGLE, { x: 3, y: 6.05, w: 7.3 * (ucCount / 27), h: 0.3, fill: { color: GOLD }, line: { color: GOLD, width: 0 } });
  s.addText(`${ucCount}/27 (${Math.round(ucCount / 27 * 100)}%)`, { x: 3, y: 6.4, w: 7.3, h: 0.4, fontSize: 11, bold: true, color: GOLD, fontFace: 'Calibri', align: 'center', margin: 0 });
}

// ============ Per-UC slides ============
let pageNum = 5;

const sortedUC = [...groups.keys()].sort((a, b) => {
  const na = parseInt(a.replace(/\D/g, ''), 10);
  const nb = parseInt(b.replace(/\D/g, ''), 10);
  return na - nb;
});

for (const uc of sortedUC) {
  const meta = UC_META[uc] || { title: uc, actor: '-', module: '-', desc: '' };
  const cases = groups.get(uc);

  // Section divider for the UC
  {
    const s = pres.addSlide();
    s.background = { color: NAVY };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.35, h: H, fill: { color: GOLD }, line: { color: GOLD, width: 0 } });
    s.addText(uc, { x: 1, y: 1.3, w: 12, h: 0.6, fontSize: 22, bold: true, color: GOLD, fontFace: 'Calibri', charSpacing: 6, margin: 0 });
    s.addText(meta.title, { x: 1, y: 1.95, w: 12, h: 1.5, fontSize: 56, bold: true, color: WHITE, fontFace: 'Georgia', margin: 0 });

    // 3 chips: actor, module, cases
    const chips = [
      { label: 'AKTOR', val: meta.actor },
      { label: 'MODUL', val: meta.module },
      { label: 'TEST CASES', val: `${cases.length} step` },
    ];
    let cx2 = 1;
    for (const c of chips) {
      s.addShape(pres.shapes.RECTANGLE, { x: cx2, y: 4.0, w: 3.7, h: 1.2, fill: { color: '152355' }, line: { color: GOLD, width: 1 } });
      s.addText(c.label, { x: cx2 + 0.25, y: 4.15, w: 3.4, h: 0.3, fontSize: 10, color: GOLD, charSpacing: 3, fontFace: 'Calibri', margin: 0 });
      s.addText(c.val, { x: cx2 + 0.25, y: 4.45, w: 3.4, h: 0.7, fontSize: 18, bold: true, color: WHITE, fontFace: 'Georgia', margin: 0 });
      cx2 += 3.95;
    }

    s.addText(meta.desc, { x: 1, y: 5.5, w: 11, h: 1.5, fontSize: 14, color: ICE, fontFace: 'Calibri', italic: true, valign: 'top', margin: 0 });

    pageNum++;
  }

  // Each test case → its own screenshot slide
  for (const c of cases) {
    const shotName = c.screenshot.startsWith('screenshots/')
      ? c.screenshot.replace('screenshots/', '')
      : `${c.screenshot}.png`;
    const shotPath = path.join(SHOTS, shotName);
    if (!fs.existsSync(shotPath)) {
      console.warn(`  ⚠ skip missing: ${shotPath}`);
      continue;
    }

    const s = pres.addSlide();
    s.background = { color: WHITE };

    // Top bar
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.55, fill: { color: NAVY }, line: { color: NAVY, width: 0 } });
    s.addText(`${uc} · ${meta.title}`, { x: 0.4, y: 0.05, w: 9, h: 0.45, fontSize: 12, bold: true, color: ICE, fontFace: 'Calibri', valign: 'middle', margin: 0 });
    statusBadge(s, W - 1.2, 0.12, c.status);

    // Caption
    s.addText(c.name, { x: 0.5, y: 0.75, w: 12.3, h: 0.55, fontSize: 22, bold: true, color: NAVY, fontFace: 'Georgia', margin: 0 });
    const meta2 = [];
    if (c.url) meta2.push(`URL: ${c.url}`);
    if (c.component) meta2.push(`Component: ${c.component}`);
    if (c.condition) meta2.push(`Kondisi: ${c.condition}`);
    s.addText(meta2.join('   ·   '), { x: 0.5, y: 1.3, w: 12.3, h: 0.35, fontSize: 11, color: SLATE, fontFace: 'Calibri', italic: true, margin: 0 });

    // Screenshot — fit
    const imgW = 11.5, imgH = 5.4;
    const imgX = (W - imgW) / 2;
    s.addImage({
      path: shotPath, x: imgX, y: 1.75, w: imgW, h: imgH,
      sizing: { type: 'contain', w: imgW, h: imgH },
    });

    if (c.notes) {
      s.addText(`📝 ${c.notes}`, { x: 0.5, y: H - 0.7, w: 12.3, h: 0.3, fontSize: 10, color: SLATE, italic: true, fontFace: 'Calibri', margin: 0 });
    }

    footer(s, pageNum++);
  }
}

// ============ Closing ============
{
  const s = pres.addSlide();
  s.background = { color: DARK };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.35, h: H, fill: { color: GOLD }, line: { color: GOLD, width: 0 } });

  s.addText('SELESAI', { x: 1, y: 1.5, w: 12, h: 0.5, fontSize: 14, bold: true, color: GOLD, fontFace: 'Calibri', charSpacing: 8, margin: 0 });
  s.addText('Manual Book selesai.', { x: 1, y: 2.1, w: 12, h: 1.5, fontSize: 56, bold: true, color: WHITE, fontFace: 'Georgia', margin: 0 });
  s.addText('Dokumen ini disusun otomatis dari hasil E2E walkthrough Playwright + screenshot 1920×1080. Setiap step diverifikasi headless lawan rent-car-dev docker stack.', {
    x: 1, y: 4.0, w: 11, h: 1.5, fontSize: 16, italic: true, color: ICE, fontFace: 'Georgia', valign: 'top', margin: 0,
  });

  s.addText([
    { text: 'Reproduce: ', options: { color: GOLD, bold: true, fontFace: 'Calibri' } },
    { text: 'node tests/qa/run-e2e-walkthrough.mjs && node tests/qa/render-report.mjs', options: { color: WHITE, fontFace: 'Consolas' } },
  ], { x: 1, y: 5.5, w: 11, h: 0.4, fontSize: 12, margin: 0 });
  s.addText([
    { text: 'Sumber screenshot: ', options: { color: GOLD, bold: true, fontFace: 'Calibri' } },
    { text: 'docs/qa-reports/screenshots/', options: { color: WHITE, fontFace: 'Consolas' } },
  ], { x: 1, y: 5.95, w: 11, h: 0.4, fontSize: 12, margin: 0 });

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: H - 0.6, w: W, h: 0.6, fill: { color: NAVY }, line: { color: NAVY, width: 0 } });
  s.addText('Urban8 Engineering · Internal Documentation', { x: 1, y: H - 0.55, w: 11, h: 0.5, fontSize: 11, color: ICE, italic: true, valign: 'middle', fontFace: 'Calibri', margin: 0 });
}

pres.writeFile({ fileName: OUT }).then(name => {
  console.log(`✅ Manual Book written: ${name}`);
}).catch(err => {
  console.error('❌ Failed:', err);
  process.exit(1);
});

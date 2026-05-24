/**
 * Generate manual-book markdown report from .results.json
 *
 * Output: docs/qa-reports/2026-05-24-uml-e2e.md
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('docs/qa-reports');
const RESULTS = path.join(ROOT, '.results.json');
const OUT = path.join(ROOT, '2026-05-24-uml-e2e.md');

const results = JSON.parse(fs.readFileSync(RESULTS, 'utf8'));

// Group by UC
const groups = {};
for (const r of results) {
  if (!groups[r.uc]) groups[r.uc] = [];
  groups[r.uc].push(r);
}

// UC labels (from UML use case diagram)
const ucLabels = {
  'UC-01': 'Registrasi / Login',
  'UC-02': 'Browse Katalog & Lihat Detail',
  'UC-03': 'Buat Order Sewa Kendaraan',
  'UC-04': 'Pilih Durasi, Unit, Wilayah, Lokasi',
  'UC-05': 'Hitung Tarif Otomatis',
  'UC-06': 'Pilih Supir',
  'UC-07': 'Free Upgrade (manual accept/reject)',
  'UC-08': 'Pesan Layanan Antar-Jemput',
  'UC-09': 'Upload Bukti Transfer',
  'UC-10': 'Input Pembayaran Tunai',
  'UC-11': 'Verifikasi Transfer',
  'UC-12': 'Generate Kwitansi (digital)',
  'UC-13': 'Kelola Kendaraan & Kategori',
  'UC-14': 'Kelola Pricing Rule & Overtime Penalty',
  'UC-15': 'Kelola Data Supir',
  'UC-16': 'Dispatch Order (payment-locked)',
  'UC-17': 'Catat Return & Aktual Time',
  'UC-18': 'Hitung Overtime (kelipatan jam)',
  'UC-19': 'Kelola Tarif Shuttle',
  'UC-20': 'Complete Order',
  'UC-21': 'Lihat Dashboard Operasional',
  'UC-22': 'Generate Laporan Transaksi & Revenue',
  'UC-23': 'View Audit Log (internal)',
  'UC-24': 'Lihat Receipt (customer + staff)',
  'UC-25': 'Lihat Riwayat Order',
  'UC-26': 'Pilih Role Dashboard (role-based redirect)',
  'UC-27': 'Refund Payment (admin only)',
};

const totalCount = results.length;
const passCount = results.filter(r => r.status === 'pass').length;
const skipCount = results.filter(r => r.status === 'skip').length;
const failCount = results.filter(r => r.status === 'fail').length;

let md = `# Manual Book — Rent-Car (Urban8) UML AS-BUILT E2E Walkthrough

> **Generated**: ${new Date().toISOString().slice(0, 19).replace('T', ' ')}
> **Source**: \`tests/qa/run-e2e-walkthrough.mjs\` — Playwright headless Chromium, viewport **1920×1080**, full-page screenshots
> **Coverage**: 27 use case (UC-01 ... UC-27) sesuai \`docs/UML_FINAL/02_use_case_diagram_as_built.puml\`
> **Test target**: \`http://localhost:8080\` (rent-car-dev docker stack)
> **Seeder accounts** (password = \`password\`):
> - Admin: \`admin@urban8.com\`
> - Kasir: \`kasir@urban8.com\`
> - Customer (existing): \`customer@urban8.com\`, \`loyal@urban8.com\`
> - Driver: \`driver@urban8.com\`
> - Customer baru di-register otomatis di tiap run

## Ringkasan

| Metric | Value |
|---|---|
| Total cases | ${totalCount} |
| ✅ Pass | ${passCount} |
| ⏭️ Skip | ${skipCount} |
| ❌ Fail | ${failCount} |

`;

const ucs = Object.keys(groups).sort();
for (const uc of ucs) {
  const label = ucLabels[uc] || uc;
  md += `\n## ${uc} — ${label}\n\n`;

  for (const r of groups[uc]) {
    const statusBadge = r.status === 'pass' ? '✅ PASS' : r.status === 'skip' ? '⏭️ SKIP' : '❌ FAIL';
    md += `### ${r.name}\n\n`;
    md += `- **Status**: ${statusBadge}\n`;
    md += `- **URL/Menu**: \`${r.url}\`\n`;
    md += `- **Component**: ${r.component}\n`;
    md += `- **Kondisi**: ${r.condition}\n`;
    if (r.notes) md += `- **Notes**: ${r.notes}\n`;
    md += `- **Screenshot**:\n\n`;
    md += `  ![${r.name}](${r.screenshot})\n\n`;
  }
}

md += `\n---\n\n## Catatan untuk Manual Book\n\n`;
md += `1. Setiap UC ada minimal 1 screenshot dengan kondisi entry-state (form kosong / list awal). Kalau perlu screenshot interaksi (form ter-fill, after-submit), tinggal extend script di \`tests/qa/run-e2e-walkthrough.mjs\`.\n`;
md += `2. Audit log (UC-23) belum ada UI list explicit — sekarang via service \`AuditLogger\` saja. Roadmap: bikin \`/admin/audit-logs\` page untuk Admin.\n`;
md += `3. Customer order detail pakai numeric \`id\`, bukan \`order_number\` yang kelihatan di UI. Kalau mau pakai \`order_number\` sebagai route binding, ubah di \`routes/web.php\` (\`/orders/{order:order_number}\`).\n`;
md += `4. Re-run: \`node tests/qa/run-e2e-walkthrough.mjs\` (membutuhkan app running di \`localhost:8080\`).\n`;
md += `5. Re-render report: \`node tests/qa/render-report.mjs\` (script ini).\n`;

fs.writeFileSync(OUT, md);
console.log(`✅ Report ditulis: ${OUT}`);
console.log(`📊 ${totalCount} cases (${passCount} pass / ${skipCount} skip / ${failCount} fail)`);
console.log(`📦 ${ucs.length} use case ter-cover`);

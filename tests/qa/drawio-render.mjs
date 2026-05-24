/**
 * Render setiap page drawio jadi PNG via Playwright + diagrams.net viewer.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const DRAWIO = '/tmp/drawio/urban8.drawio';
const OUT = '/tmp/drawio/png';
fs.mkdirSync(OUT, { recursive: true });

const xml = fs.readFileSync(DRAWIO, 'utf8');

// Extract page name+id list
// Extract page name+id list — drawio has 2 attribute orders: name-first or id-first
const pages = [];
for (const m of xml.matchAll(/<diagram\s+([^>]+)>/g)) {
  const attrs = m[1];
  const nm = /name="([^"]+)"/.exec(attrs);
  const idm = /id="([^"]+)"/.exec(attrs);
  if (nm && idm) pages.push({ name: nm[1].trim(), id: idm[1] });
}
console.log(`📄 Found ${pages.length} pages`);
console.log(pages.map((p, i) => `   ${String(i + 1).padStart(2, '0')}. ${p.name}`).join('\n'));

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 2400, height: 1600 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();

// Encode the drawio XML to use in viewer
const encoded = encodeURIComponent(xml);
const xmlData = `data:text/xml;charset=utf-8;base64,${Buffer.from(xml, 'utf8').toString('base64')}`;

for (let i = 0; i < pages.length; i++) {
  const p = pages[i];
  const safeName = `${String(i + 1).padStart(2, '0')}_${p.name.replace(/[^a-zA-Z0-9]+/g, '_')}`;
  console.log(`  → page ${i + 1}/${pages.length}: ${p.name}`);

  // Use viewer.diagrams.net with embedded xml — uses #R prefix for raw XML
  const url = `https://viewer.diagrams.net/?lightbox=1&edit=_blank&layers=1&nav=0&page-id=${p.id}#R${encodeURIComponent(xml)}`;

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForSelector('.geDiagramContainer, svg, .geCanvas', { timeout: 30000 });
    await page.waitForTimeout(2000);

    // Find the rendered SVG/canvas area
    const target = await page.locator('.geDiagramContainer, .geCanvas, svg').first();
    const png = path.join(OUT, `${safeName}.png`);
    await target.screenshot({ path: png });
    console.log(`     ✓ ${png}`);
  } catch (e) {
    console.error(`     ✗ ${p.name}: ${e?.message?.slice(0, 80)}`);
  }
}

await browser.close();
console.log(`\n✅ Done. Output di ${OUT}`);

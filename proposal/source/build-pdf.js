// Prints pdf/proposal.html to the final PDF and renders page previews for QA
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const out = path.resolve(__dirname, '../Infinitia_Links_Enterprise_Digital_Identity_Proposal.pdf');
  const b = await chromium.launch();
  const p = await b.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('requestfailed', r => errs.push('failed: ' + r.url()));
  await p.goto('file://' + path.resolve(__dirname, 'pdf/proposal.html'), { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  // overflow check: content running past the footer area
  const over = await p.$$eval('.page', pages => pages.map((pg, i) => {
    const r = pg.getBoundingClientRect(); let max = 0;
    pg.querySelectorAll(':scope > *:not(.pf):not(.ph):not(.hero):not([style*="absolute"])').forEach(el => { max = Math.max(max, el.getBoundingClientRect().bottom - r.top); });
    return [i + 1, Math.round(max), Math.round(r.height - 20 * 3.78)];
  }).filter(x => x[1] > x[2]));
  console.log('overflowing pages [page, contentBottom, limit]:', JSON.stringify(over));
  await p.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
  console.log('wrote', out, errs);
  await b.close();
})();

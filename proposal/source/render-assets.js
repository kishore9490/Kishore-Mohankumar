// Renders every mockup in mockups/mockups.html to a PNG in ../visual-assets
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const out = path.resolve(__dirname, '../visual-assets');
  const only = process.argv[2];
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: 2.5 })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto('file://' + path.resolve(__dirname, 'mockups/mockups.html'));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  const ids = await p.$$eval('.asset', els => els.map(e => e.id));
  for (const id of ids) {
    if (only && !id.includes(only)) continue;
    await p.locator('#' + id + ' > *').first().screenshot({ path: path.join(out, id + '.png'), omitBackground: true });
  }
  console.log(ids.length + ' assets', errs);
  await b.close();
})();

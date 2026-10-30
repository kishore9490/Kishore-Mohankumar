// Downsizes visual assets for embedding and rasterizes brand-coloured icons.
const sharp = require('sharp');
const fs = require('fs'), path = require('path');
const A = path.resolve(__dirname, '../visual-assets');
(async () => {
  for (const f of fs.readdirSync(A).filter(f => f.endsWith('.png'))) {
    await sharp(path.join(A, f)).resize({ width: 1800, height: 1800, fit: 'inside', withoutEnlargement: true }).png({ compressionLevel: 9, palette: false }).toFile(path.join(__dirname, 'build/embed', f));
  }
  const src = fs.readFileSync(path.join(__dirname, 'mockups/mockups.js'), 'utf8');
  const P = eval('(' + src.slice(src.indexOf('var P = {') + 8, src.indexOf('};', src.indexOf('var P = {')) + 1) + ')');
  const colors = { blue: '#1463FF', white: '#FFFFFF', violet: '#7B2CF5', green: '#12B76A', red: '#E5484D', amber: '#F59E0B', navy: '#0B1433' };
  for (const [name, d] of Object.entries(P)) for (const [cn, hex] of Object.entries(colors)) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 24 24" fill="none" stroke="${hex}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
    await sharp(Buffer.from(svg)).png().toFile(path.join(__dirname, 'build/icons', `${name}-${cn}.png`));
  }
  console.log('embeds + icons done', Object.keys(P).length);
})();

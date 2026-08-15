/**
 * Builds the explorer into ONE self-contained HTML fragment.
 *
 *   node scripts/build-singlefile.mjs
 *
 * Why: for sharing a live, clickable build where there is no server to serve
 * chunks or rewrite routes (a static host, a file:// open, or an embedded
 * viewer with a strict CSP that blocks external requests).
 *
 * What it does:
 *   1. Builds with VITE_HASH_ROUTER=1 and dynamic imports inlined, so the whole
 *      app is a single JS file and routing works without a server.
 *   2. Inlines that JS and the CSS into the HTML.
 *   3. Emits a body-level fragment (no <html>/<head>/<body>), which is what
 *      embeddable viewers expect. Standalone use still renders fine.
 *
 * Output: dist-singlefile/bid-trust-architecture-explorer.html
 */
import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const outDir = join(root, 'dist-singlefile')
const tmpDir = join(root, '.singlefile-tmp')

rmSync(tmpDir, { recursive: true, force: true })
rmSync(outDir, { recursive: true, force: true })
mkdirSync(outDir, { recursive: true })

console.log('› building (hash router, inlined chunks)…')
execSync(
  `npx vite build --outDir ${JSON.stringify(tmpDir)} --emptyOutDir ` +
    `--config vite.config.singlefile.ts`,
  { cwd: root, stdio: 'inherit', env: { ...process.env, VITE_HASH_ROUTER: '1' } },
)

const assetsDir = join(tmpDir, 'assets')
const files = readdirSync(assetsDir)
const jsFiles = files.filter((f) => f.endsWith('.js'))
const cssFiles = files.filter((f) => f.endsWith('.css'))

if (jsFiles.length !== 1) {
  console.error(`✗ expected exactly 1 JS chunk, got ${jsFiles.length}: ${jsFiles.join(', ')}`)
  console.error('  inlineDynamicImports is not taking effect — check vite.config.singlefile.ts')
  process.exit(1)
}

const js = readFileSync(join(assetsDir, jsFiles[0]), 'utf8')
const css = cssFiles.map((f) => readFileSync(join(assetsDir, f), 'utf8')).join('\n')

// Guard: a stray absolute asset reference would 404 in a sandboxed viewer.
const badRef = js.match(/["'`]\/assets\/[^"'`]+["'`]/)
if (badRef) {
  console.warn(`⚠ found an absolute /assets reference in the bundle: ${badRef[0]}`)
}

const html = `<title>BID Trust Architecture Explorer</title>
<style>
${css}
</style>
<div id="root"></div>
<script type="module">
${js}
</script>
`

const outFile = join(outDir, 'bid-trust-architecture-explorer.html')
writeFileSync(outFile, html)
rmSync(tmpDir, { recursive: true, force: true })

const kb = (Buffer.byteLength(html) / 1024).toFixed(0)
console.log(`✓ ${outFile}`)
console.log(`  ${kb} kB — 1 JS chunk inlined, ${cssFiles.length} CSS file(s) inlined`)

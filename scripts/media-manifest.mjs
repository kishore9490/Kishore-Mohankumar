// Scans /public/bikes/<slug>/ for licensed photography and writes
// data/media-manifest.json, which data/bikes.ts merges into the inventory.
//
//   public/bikes/<slug>/hero.(webp|png|avif|jpg)      → bike.heroImage
//   public/bikes/<slug>/<colour-id>.(webp|png|avif|jpg) → colors[].image
//
// Use transparent-background (cut-out) side profiles facing right for the best
// result on the dark studio backgrounds. Runs automatically before dev/build.
import { readdirSync, statSync, writeFileSync, existsSync } from "node:fs";
import { join, parse } from "node:path";

const root = join(process.cwd(), "public", "bikes");
const exts = new Set([".webp", ".png", ".avif", ".jpg", ".jpeg"]);
const manifest = {};

if (existsSync(root)) {
  for (const slug of readdirSync(root)) {
    const dir = join(root, slug);
    if (!statSync(dir).isDirectory()) continue;
    const entry = { colors: {} };
    for (const file of readdirSync(dir)) {
      const { name, ext } = parse(file);
      if (!exts.has(ext.toLowerCase())) continue;
      const url = `/bikes/${slug}/${file}`;
      if (name === "hero") entry.hero = url;
      else entry.colors[name] = url;
    }
    if (entry.hero || Object.keys(entry.colors).length) manifest[slug] = entry;
  }
}

writeFileSync(join(process.cwd(), "data", "media-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(`[media] ${Object.keys(manifest).length} bike(s) with photography`);

// Dev helper: sign in and screenshot app routes. Usage: tsx scripts/shot.ts outDir width route1 route2 ...
import puppeteer from "puppeteer-core";

async function main() {
  const [out, width, ...routes] = process.argv.slice(2);
  const base = process.env.APP_URL || "http://127.0.0.1:3000";
  const browser = await puppeteer.launch({ executablePath: process.env.CHROMIUM_PATH, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: Number(width), height: 900 });
  page.on("pageerror", (e) => console.log("PAGEERROR", String(e).slice(0, 300)));
  page.on("console", (m) => { if (m.type() === "error") console.log("CONSOLE", m.text().slice(0, 300)); });
  await page.goto(`${base}/login`, { waitUntil: "networkidle0", timeout: 120000 });
  await page.type("#email", process.env.SEED_ADMIN_EMAIL!);
  await page.type("#password", process.env.SEED_ADMIN_PASSWORD!);
  await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0", timeout: 120000 }), page.click("button[type=submit]")]);
  for (const r of routes) {
    const res = await page.goto(`${base}${r}`, { waitUntil: "networkidle0", timeout: 120000 });
    const name = r.replace(/[^a-z0-9]+/gi, "_") || "root";
    await page.screenshot({ path: `${out}/${name}_${width}.png`, fullPage: true });
    console.log(r, res?.status());
  }
  await browser.close();
}
main().catch((e) => { console.error(e); process.exit(1); });

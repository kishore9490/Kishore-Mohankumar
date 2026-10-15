// Dev helper: sign in via the real login form, then download PDFs of documents via the authenticated API.
// Usage: tsx scripts/fetch-pdf.ts outDir
import puppeteer from "puppeteer-core";
import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "node:fs";

async function main() {
  const [out] = process.argv.slice(2);
  const base = process.env.APP_URL || "http://127.0.0.1:3000";
  const db = new PrismaClient();
  const docs = await db.document.findMany({ select: { id: true, type: true, number: true, template: true } });
  const browser = await puppeteer.launch({ executablePath: process.env.CHROMIUM_PATH, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.goto(`${base}/login`, { waitUntil: "networkidle0" });
  await page.type("#email", process.env.SEED_ADMIN_EMAIL!);
  await page.type("#password", process.env.SEED_ADMIN_PASSWORD!);
  await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0" }), page.click("button[type=submit]")]);
  const cookies = await page.cookies();
  const cookie = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
  for (const d of docs) {
    const t0 = Date.now();
    const res = await fetch(`${base}/api/documents/${d.id}/pdf`, { headers: { cookie } });
    const buf = Buffer.from(await res.arrayBuffer());
    const name = `${d.type}-${(d.number ?? "draft").replace(/\//g, "_")}-${d.template}.pdf`;
    writeFileSync(`${out}/${name}`, buf);
    console.log(res.status, res.headers.get("content-type"), buf.length, `${Date.now() - t0}ms`, name);
  }
  await browser.close();
  await db.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });

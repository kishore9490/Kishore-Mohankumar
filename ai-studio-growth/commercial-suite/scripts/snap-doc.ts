// Dev helper: screenshot + PDF a document's print view using a signed render token.
// Usage: tsx scripts/snap-doc.ts <type|id> <outDir>
import { PrismaClient } from "@prisma/client";
import puppeteer from "puppeteer-core";
import { signRenderToken } from "../src/lib/auth/tokens";

async function main() {
  const [sel, out] = process.argv.slice(2);
  const db = new PrismaClient();
  const doc = sel.length > 15 ? await db.document.findUnique({ where: { id: sel } }) : await db.document.findFirst({ where: { type: sel as never }, orderBy: { createdAt: "asc" } });
  if (!doc) throw new Error("no doc");
  const browser = await puppeteer.launch({ executablePath: process.env.CHROMIUM_PATH, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  const url = `http://127.0.0.1:3000/print/documents/${doc.id}?t=${signRenderToken(doc.id, 600)}`;
  const res = await page.goto(url, { waitUntil: "networkidle0", timeout: 120000 });
  console.log("status", res?.status());
  await page.screenshot({ path: `${out}/${sel}.png`, fullPage: true });
  await browser.close();
  await db.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });

/**
 * One-time local setup.
 *   npm run setup -- "mysql://USER:PASSWORD@localhost:3306/DATABASE" [admin@email] ["Admin Name"]
 * - writes .env (keeps an existing SESSION_SECRET — it must stay the same, it protects MFA and integration secrets)
 * - detects Chrome / Edge for PDF generation
 * - applies database migrations and seeds base data + sample data
 * - prints the one-time invitation link for the first administrator
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

const [dbUrlArg, adminEmail = "admin@aistudiocraft.local", adminName = "Administrator"] = process.argv.slice(2);
const envPath = ".env";
const current: Record<string, string> = {};
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) current[m[1]] = m[2].replace(/^"|"$/g, "");
  }
}
const dbUrl = dbUrlArg || current.DATABASE_URL;
if (!dbUrl) {
  console.error('Usage: npm run setup -- "mysql://USER:PASSWORD@localhost:3306/DATABASE" [admin@email] ["Admin Name"]');
  process.exit(1);
}
const browsers = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
];
const env = {
  DATABASE_URL: dbUrl,
  SESSION_SECRET: current.SESSION_SECRET && current.SESSION_SECRET.length >= 32 ? current.SESSION_SECRET : randomBytes(32).toString("hex"),
  SEED_ADMIN_EMAIL: current.SEED_ADMIN_EMAIL || adminEmail,
  SEED_ADMIN_NAME: current.SEED_ADMIN_NAME || adminName,
  CHROMIUM_PATH: current.CHROMIUM_PATH || browsers.find((b) => existsSync(b)) || "",
  APP_URL: current.APP_URL || "http://localhost:3000",
};
const extra = Object.entries(current).filter(([k]) => !(k in env));
writeFileSync(
  envPath,
  [
    "# Local configuration — never commit this file.",
    "# SESSION_SECRET must never change: it encrypts MFA secrets and integration credentials.",
    ...Object.entries(env).map(([k, v]) => `${k}="${v}"`),
    ...extra.map(([k, v]) => `${k}="${v}"`),
    "",
  ].join("\n"),
);
console.log("✔ .env written" + (env.CHROMIUM_PATH ? ` (PDF browser: ${env.CHROMIUM_PATH})` : " — WARNING: no Chrome/Edge found; set CHROMIUM_PATH for PDFs"));
const run = (cmd: string) => execSync(cmd, { stdio: "inherit", env: { ...process.env, ...env } });
run("npx prisma migrate deploy");
run("npx prisma db seed");
console.log("\n✔ Setup complete. Start the app with:  npm run dev   (Windows PowerShell: npm.cmd run dev)");
console.log("  If no invitation link was printed above, an administrator already exists. Create one with: npm run invite -- you@company.com \"Your Name\" ADMIN");

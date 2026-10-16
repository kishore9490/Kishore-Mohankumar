// Production start: apply pending database migrations (safe, idempotent), then start Next.js.
// The server starts even if migrations fail, so /setup can show a clear diagnosis.
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const bin = (name) => path.join(process.cwd(), "node_modules", ".bin", process.platform === "win32" ? `${name}.cmd` : name);

if (process.env.SKIP_MIGRATIONS !== "true" && existsSync(bin("prisma"))) {
  console.log("[start] Applying database migrations…");
  const r = spawnSync(bin("prisma"), ["migrate", "deploy"], { stdio: "inherit", shell: process.platform === "win32" });
  if (r.status !== 0) console.error("[start] Migrations failed — check DATABASE_URL. Starting the app anyway; open /setup for details.");
}

const child = spawn(bin("next"), ["start", "-H", "0.0.0.0", ...(process.env.PORT ? ["-p", process.env.PORT] : [])], { stdio: "inherit", shell: process.platform === "win32" });
child.on("exit", (code) => process.exit(code ?? 0));
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => child.kill(sig));

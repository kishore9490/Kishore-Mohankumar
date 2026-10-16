import type { NextConfig } from "next";
import { execSync } from "node:child_process";

function buildId() {
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return "unknown";
  }
}

const nextConfig: NextConfig = {
  // Loaded from node_modules at runtime (native binaries / large assets must not be bundled)
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  poweredByHeader: false,
  // Shown in the sidebar and on /api/health so it is easy to confirm which version is deployed
  env: { NEXT_PUBLIC_BUILD_ID: buildId(), NEXT_PUBLIC_BUILD_TIME: new Date().toISOString() },
};

export default nextConfig;

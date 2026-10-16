import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Loaded from node_modules at runtime (native binaries / large assets must not be bundled)
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  poweredByHeader: false,
};

export default nextConfig;

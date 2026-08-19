import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // libSQL loads a prebuilt native binding; keep it out of the bundler.
  serverExternalPackages: ['@libsql/client'],
  // Next 16 writes AGENTS.md/CLAUDE.md on dev start; we don't want them committed.
  agentRules: false,
}

export default nextConfig

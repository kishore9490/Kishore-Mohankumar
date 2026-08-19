import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['postgres'],
  // Next 16 writes AGENTS.md/CLAUDE.md on dev start; we don't want them committed.
  agentRules: false,
}

export default nextConfig

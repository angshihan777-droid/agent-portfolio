import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // l2d-widget uses browser APIs — exclude from SSR bundling
  serverExternalPackages: ['l2d-widget', 'l2d'],
}

export default nextConfig

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // l2d-widget uses browser APIs — exclude from SSR bundling
  serverExternalPackages: ['l2d-widget', 'l2d'],

  // 上传文件通过专属 API 路由服务，绕过 Next.js 静态文件层
  // 确保 Docker volume 挂载的文件可被正确读取和响应
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/uploads/:path*',
          destination: '/api/uploads/:path*',
        },
      ],
      afterFiles: [],
      fallback: [],
    }
  },
}

export default nextConfig

import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Background } from '@/components/layout/Background'
import { ClientShell } from '@/components/layout/ClientShell'
import { FirstVisitModal, DEFAULT_WELCOME } from '@/components/modals/FirstVisitModal'
import type { WelcomeConfig } from '@/components/modals/FirstVisitModal'
import nextDynamic from 'next/dynamic'
import { StoreHydrator } from '@/components/layout/StoreHydrator'
import { PageViewTracker } from '@/components/analytics/PageViewTracker'
import { getAllConfigs } from '@/lib/db/config'
import { getLive2DConfig } from '@/lib/db/live2d'
import type { Live2DModel } from '@/store'

const Live2DWidget = nextDynamic(
  () => import('@/components/live2d/Live2DWidget').then((m) => m.Live2DWidget),
  { ssr: false }
)

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

// 确保 layout 每次请求都读最新 DB 配置（壁纸、透明度等）
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Ashia's Portfolio",
  description: 'AI Agent / Web 开发 / 工具型产品 — Ashia 的个人展示站',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [configs, live2d] = await Promise.all([getAllConfigs(), getLive2DConfig()])

  // 欢迎弹窗配置（fallback 到默认值）
  let welcomeConfig: WelcomeConfig = DEFAULT_WELCOME
  if (configs.welcomeConfig) {
    try { welcomeConfig = { ...DEFAULT_WELCOME, ...JSON.parse(configs.welcomeConfig) } } catch { /* ignore */ }
  }

  return (
    <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="h-full flex flex-col overflow-hidden">
        {/* 从 DB 注入初始配置到 Zustand store */}
        <StoreHydrator
          wallpaper={configs.wallpaper ?? '/wallpaper/default.jpg'}
          live2dModel={(configs.live2dModel as Live2DModel) ?? live2d.model}
          live2dSize={live2d.size}
          agentName={configs.agentName ?? '塞塞'}
          suggestedQuestions={
            configs.suggestedQuestions
              ? (() => { try { return JSON.parse(configs.suggestedQuestions) } catch { return [] } })()
              : []
          }
          overlayOpacity={configs.overlayOpacity !== undefined ? Number(configs.overlayOpacity) : 30}
          chatOpacity={configs.chatOpacity !== undefined ? Number(configs.chatOpacity) : 10}
          panelOpacity={configs.panelOpacity !== undefined ? Number(configs.panelOpacity) : 10}
          navOpacity={configs.navOpacity !== undefined ? Number(configs.navOpacity) : 45}
        />

        {/* PV 打点 */}
        <PageViewTracker />

        {/* 动漫壁纸背景 */}
        <Background />

        {/* 首次访问弹窗 */}
        <FirstVisitModal config={welcomeConfig} />

        {/* Live2D 角色 */}
        <Live2DWidget />

        {/* 顶部导航 + 页面内容（后台路由不渲染导航和留白） */}
        <ClientShell>
          {children}
        </ClientShell>
      </body>
    </html>
  )
}

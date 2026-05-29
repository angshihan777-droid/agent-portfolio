import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Background } from '@/components/layout/Background'
import { ClientShell } from '@/components/layout/ClientShell'
import { FirstVisitModal, DEFAULT_WELCOME } from '@/components/modals/FirstVisitModal'
import type { WelcomeConfig } from '@/components/modals/FirstVisitModal'
import { Live2DWidgetLoader } from '@/components/live2d/Live2DWidgetLoader'
import { StoreHydrator } from '@/components/layout/StoreHydrator'
import { PageViewTracker } from '@/components/analytics/PageViewTracker'
import { getAllConfigs } from '@/lib/db/config'
import { getLive2DConfig } from '@/lib/db/live2d'
import type { Live2DModel } from '@/store'

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
  title: "Ashia's Portfolio — AI Agent · Web 开发",
  description:
    'Hi，我是 Ashia，专注 AI Agent 开发、Web 工程与工具型产品。这里有我的项目作品、技术栈，以及 AI 秘书塞塞，欢迎与她聊聊～',
  keywords: ['AI Agent', 'Web开发', '前端', 'Next.js', 'Python', '个人作品集', 'Portfolio'],
  authors: [{ name: 'Ashia' }],
  openGraph: {
    title: "Ashia's Portfolio",
    description: 'AI Agent / Web 开发 / 工具型产品 — 与 AI 秘书塞塞聊聊 Ashia 吧 (◕‿◕✿)',
    type: 'website',
    locale: 'zh_CN',
    images: [
      {
        url: '/wallpaper/default.jpg',
        width: 1200,
        height: 630,
        alt: "Ashia's Portfolio",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Ashia's Portfolio",
    description: 'AI Agent / Web 开发 / 工具型产品',
    images: ['/wallpaper/default.jpg'],
  },
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

        {/* Live2D 角色 — 直接从 DB 传入初始值，跳过 store 默认值造成的双重初始化 */}
        <Live2DWidgetLoader
          initialModel={(configs.live2dModel as Live2DModel) ?? live2d.model}
          initialSize={live2d.size}
        />

        {/* 顶部导航 + 页面内容（后台路由不渲染导航和留白） */}
        <ClientShell>
          {children}
        </ClientShell>
      </body>
    </html>
  )
}

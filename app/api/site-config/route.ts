import { NextResponse } from 'next/server'
import { getAllConfigs } from '@/lib/db/config'

/**
 * 公开 API —— 前台组件可以客户端 fetch 拿到最新配置
 * 只返回前台需要的非敏感字段（透明度、agent 名称等）
 */
export async function GET() {
  const configs = await getAllConfigs()
  return NextResponse.json({
    overlayOpacity: configs.overlayOpacity !== undefined ? Number(configs.overlayOpacity) : 30,
    chatOpacity:    configs.chatOpacity    !== undefined ? Number(configs.chatOpacity)    : 10,
    panelOpacity:   configs.panelOpacity   !== undefined ? Number(configs.panelOpacity)   : 10,
    navOpacity:     configs.navOpacity     !== undefined ? Number(configs.navOpacity)      : 45,
    agentName:      configs.agentName ?? '塞塞',
    wallpaper:      configs.wallpaper ?? '/wallpaper/default.jpg',
  })
}

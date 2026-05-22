import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getConfig, setConfig } from '@/lib/db/config'

export async function GET() {
  const [overlay, chat, panel, nav] = await Promise.all([
    getConfig('overlayOpacity'),
    getConfig('chatOpacity'),
    getConfig('panelOpacity'),
    getConfig('navOpacity'),
  ])
  return NextResponse.json({
    overlayOpacity: overlay !== null ? Number(overlay) : 30,
    chatOpacity:    chat    !== null ? Number(chat)    : 10,
    panelOpacity:   panel   !== null ? Number(panel)   : 10,
    navOpacity:     nav     !== null ? Number(nav)      : 45,
  })
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const updates: Promise<void>[] = []

  if (typeof body.overlayOpacity === 'number') {
    updates.push(setConfig('overlayOpacity', String(Math.round(body.overlayOpacity))))
  }
  if (typeof body.panelOpacity === 'number') {
    updates.push(setConfig('panelOpacity', String(Math.round(body.panelOpacity))))
  }
  if (typeof body.chatOpacity === 'number') {
    updates.push(setConfig('chatOpacity', String(Math.round(body.chatOpacity))))
  }
  if (typeof body.navOpacity === 'number') {
    updates.push(setConfig('navOpacity', String(Math.round(body.navOpacity))))
  }

  await Promise.all(updates)

  // 通知 Next.js 刷新 root layout 缓存，前台下次请求即可拿到新值
  revalidatePath('/', 'layout')

  return NextResponse.json({ ok: true })
}

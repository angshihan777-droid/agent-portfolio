import { NextRequest, NextResponse } from 'next/server'
import { chat } from '@/lib/agent/chat'
import { createChatLog } from '@/lib/db/chatLog'

/** 从请求头提取真实 IP */
function getClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  const xri = req.headers.get('x-real-ip')
  if (xri) return xri.trim()
  return ''
}

/** 查询 IP 归属地（ip-api.com，免费，结果为中文） */
async function getLocation(ip: string): Promise<string> {
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return '本地访问'
  }
  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?lang=zh-CN&fields=status,city,regionName,country`,
      { signal: AbortSignal.timeout(3000) },
    )
    if (!res.ok) return ''
    const data = await res.json()
    if (data.status !== 'success') return ''
    return [data.city, data.regionName, data.country].filter(Boolean).join(', ')
  } catch {
    return ''
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { question, history, currentPage } = body

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Missing question' }, { status: 400 })
    }

    const ip = getClientIp(req)
    const result = await chat({ question: question.trim(), history, currentPage })

    // 异步记录日志，不阻塞响应
    ;(async () => {
      try {
        const location = await getLocation(ip)
        await createChatLog({
          ip,
          location,
          question: question.trim(),
          answer: result.answer,
        })
      } catch {
        // 日志写入失败不影响主流程
      }
    })()

    return NextResponse.json(result)
  } catch (err) {
    console.error('[POST /api/chat]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { getLLMClient } from '@/lib/agent/chat'
import { buildSystemPrompt } from '@/lib/agent/knowledge'
import { createChatLog } from '@/lib/db/chatLog'

// ── 限流：每 IP 每分钟最多 20 次请求 ──────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 20
const RATE_WINDOW_MS = 60 * 1000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || entry.resetAt <= now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

// ── 工具函数 ─────────────────────────────────────────────────────────────────

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  const xri = req.headers.get('x-real-ip')
  if (xri) return xri.trim()
  return 'unknown'
}

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

// ── 主路由 ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)

  // 限流检查
  if (!checkRateLimit(ip)) {
    return new Response(
      JSON.stringify({ error: '请求过于频繁，请稍后再试 (｡•́︿•̀｡)' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } },
    )
  }

  let body: { question?: string; history?: { role: string; content: string }[]; currentPage?: string }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { question, history, currentPage: _currentPage } = body
  if (!question || typeof question !== 'string') {
    return new Response(JSON.stringify({ error: 'Missing question' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const trimmedQuestion = question.trim()

  try {
    const [{ client, model }, systemPrompt] = await Promise.all([
      getLLMClient(),
      buildSystemPrompt(),
    ])

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...(history ?? []).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: trimmedQuestion },
    ]

    const llmStream = await client.chat.completions.create({
      model,
      messages,
      max_tokens: 600,
      temperature: 0.7,
      stream: true,
    })

    let fullAnswer = ''

    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        try {
          for await (const chunk of llmStream) {
            const text = chunk.choices[0]?.delta?.content ?? ''
            if (text) {
              fullAnswer += text
              controller.enqueue(encoder.encode(text))
            }
          }
        } catch (err) {
          console.error('[stream] LLM error:', err)
        } finally {
          controller.close()
          // 流结束后异步写入日志
          ;(async () => {
            try {
              const location = await getLocation(ip)
              await createChatLog({ ip, location, question: trimmedQuestion, answer: fullAnswer })
            } catch {
              // 日志写入失败不影响主流程
            }
          })()
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Accel-Buffering': 'no',
        'Cache-Control': 'no-cache',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (err) {
    console.error('[POST /api/chat]', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

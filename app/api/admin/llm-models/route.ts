import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/admin/llm-models
 * 代理请求 Provider 的 /models 接口，返回可用模型列表
 * body: { baseUrl: string, apiKey: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { baseUrl, apiKey } = await req.json()
    if (!baseUrl || !apiKey) {
      return NextResponse.json({ error: '缺少 baseUrl 或 apiKey' }, { status: 400 })
    }

    const url = `${baseUrl.replace(/\/+$/, '')}/models`
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return NextResponse.json(
        { error: `Provider 返回 ${res.status}：${text.slice(0, 200)}` },
        { status: 502 },
      )
    }

    const data = await res.json()
    // OpenAI 兼容格式：{ data: [{ id: '...', ... }] }
    const models: string[] = Array.isArray(data.data)
      ? data.data
          .map((m: { id?: string }) => m.id)
          .filter((id: unknown): id is string => typeof id === 'string' && id.length > 0)
          .sort()
      : []

    return NextResponse.json({ models })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 })
  }
}

import { NextResponse } from 'next/server'
import { buildSystemPrompt } from '@/lib/agent/knowledge'

/**
 * GET /api/admin/debug-prompt
 * 返回当前实际传给 LLM 的系统提示词，用于排查"AI 不知道我的信息"的问题。
 * 已由 proxy.ts 保护，仅管理员可访问。
 */
export async function GET() {
  try {
    const prompt = await buildSystemPrompt()

    // 统计各板块的字数，方便快速判断哪块是空的
    const sections: Record<string, number> = {}
    const lines = prompt.split('\n')
    let currentSection = '(header)'
    let sectionStart = 0

    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(/^## (.+)$/)
      if (m) {
        sections[currentSection] = lines.slice(sectionStart, i).join('\n').length
        currentSection = m[1]
        sectionStart = i + 1
      }
    }
    sections[currentSection] = lines.slice(sectionStart).join('\n').length

    return NextResponse.json({
      ok: true,
      totalChars: prompt.length,
      sections,
      prompt,
    })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}

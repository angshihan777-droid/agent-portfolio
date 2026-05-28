import type OpenAI from 'openai'
import { getConfig, setConfig } from '@/lib/db/config'

const MEMORY_KEY = 'agentMemories'
const MAX_MEMORIES = 20   // 最多保留 20 条记忆

/** 读取所有记忆 */
export async function loadMemories(): Promise<string[]> {
  const json = await getConfig(MEMORY_KEY)
  if (!json) return []
  try {
    const parsed = JSON.parse(json)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * 从一轮对话中提取关键事实，与现有记忆合并后写回 DB。
 * 设计为"即发即忘"，不 await，失败静默。
 */
export async function updateMemories(
  userMsg: string,
  aiAnswer: string,
  client: OpenAI,
  model: string,
): Promise<void> {
  const existing = await loadMemories()

  const prompt = `你是一个对话信息提取助手。请从下面这轮对话中提取访客透露的有价值的新信息（如姓名、公司、职位、招聘意向、对哪些技术/项目感兴趣、具体诉求等）。
如果没有新的值得记忆的信息，返回空数组 []。

### 本轮对话
用户：${userMsg}
AI：${aiAnswer}

### 已有记忆（勿重复）
${existing.length > 0 ? existing.map((m, i) => `${i + 1}. ${m}`).join('\n') : '（暂无）'}

### 要求
- 每条记忆不超过 40 字，简洁陈述事实
- 只提取有意义的新事实，忽略泛泛问候
- 返回纯 JSON 字符串数组，不加任何额外说明

示例：["HR来自字节跳动，寻找前端工程师", "访客对 self-blog 项目的 AI 秘书功能很感兴趣"]`

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.2,
    })

    const raw = completion.choices[0]?.message?.content ?? '[]'
    // 容错：截取第一个 JSON 数组
    const match = raw.match(/\[[\s\S]*?\]/)
    if (!match) return

    const newFacts: unknown = JSON.parse(match[0])
    if (!Array.isArray(newFacts) || newFacts.length === 0) return

    const validFacts = newFacts.filter((f): f is string => typeof f === 'string' && f.trim().length > 0)
    if (validFacts.length === 0) return

    // 新记忆放前面，旧记忆往后，去重，截断
    const merged = [...validFacts, ...existing]
      .filter((f, i, arr) => arr.indexOf(f) === i)
      .slice(0, MAX_MEMORIES)

    await setConfig(MEMORY_KEY, JSON.stringify(merged))
  } catch {
    // 记忆提取失败不影响主流程，静默跳过
  }
}

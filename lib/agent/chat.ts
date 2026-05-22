import OpenAI from 'openai'
import { buildSystemPrompt } from './knowledge'
import { getConfig } from '@/lib/db/config'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  question: string
  history?: ChatMessage[]
  currentPage?: string
}

export interface ChatResponse {
  answer: string
  error?: string
}

async function getLLMClient(): Promise<{ client: OpenAI; model: string }> {
  const [configsJson, activeId] = await Promise.all([
    getConfig('llmConfigs'),
    getConfig('llmActiveId'),
  ])

  // 优先读多配置中的激活项
  let active: { provider?: string; apiKey?: string; baseUrl?: string; model?: string } | null = null
  if (configsJson && activeId) {
    try {
      const configs: { id: string; provider: string; apiKey: string; baseUrl: string; model: string }[] =
        JSON.parse(configsJson)
      active = configs.find((c) => c.id === activeId) ?? null
    } catch { /* ignore */ }
  }

  // 兼容旧版单套配置
  if (!active) {
    const [dbProvider, dbApiKey, dbBaseUrl, dbModel] = await Promise.all([
      getConfig('llmProvider'),
      getConfig('llmApiKey'),
      getConfig('llmBaseUrl'),
      getConfig('llmModel'),
    ])
    if (dbProvider || dbApiKey || dbModel) {
      active = { provider: dbProvider ?? undefined, apiKey: dbApiKey ?? undefined, baseUrl: dbBaseUrl ?? undefined, model: dbModel ?? undefined }
    }
  }

  const provider = active?.provider || process.env.LLM_PROVIDER || 'deepseek'
  const apiKey = active?.apiKey ||
    (provider === 'openai' ? process.env.OPENAI_API_KEY : process.env.DEEPSEEK_API_KEY) || ''
  const defaultBaseUrl = provider === 'deepseek' ? 'https://api.deepseek.com' : undefined
  const baseURL = active?.baseUrl || process.env.LLM_BASE_URL || defaultBaseUrl
  const defaultModel = provider === 'deepseek' ? 'deepseek-chat' : 'gpt-4o-mini'
  const model = active?.model || process.env.LLM_MODEL || defaultModel

  const client = new OpenAI({ apiKey, baseURL })
  return { client, model }
}

export async function chat(req: ChatRequest): Promise<ChatResponse> {
  const [{ client, model }, systemPrompt] = await Promise.all([
    getLLMClient(),
    buildSystemPrompt(),
  ])

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...(req.history ?? []).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: req.question },
  ]

  try {
    const completion = await client.chat.completions.create({
      model,
      messages,
      max_tokens: 600,
      temperature: 0.7,
    })
    return { answer: completion.choices[0]?.message?.content ?? '抱歉，我暂时无法回答这个问题。' }
  } catch (err) {
    console.error('[chat] LLM error:', err)
    return { answer: '抱歉，AI 服务暂时不可用，请稍后再试。', error: String(err) }
  }
}

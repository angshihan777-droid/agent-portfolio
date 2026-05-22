import { getConfig, setConfig } from '@/lib/db/config'
import { AgentClient } from './AgentClient'
import type { LLMConfig } from './AgentClient'

const DEFAULT_QUESTIONS = [
  'Ashia 是谁？',
  'Ashia 适合什么岗位？',
  'Ashia 做过哪些 Agent 项目？',
  'Ashia 的技术栈是什么？',
  '有哪些项目可以在线体验？',
  'Ashia 的简历在哪里？',
]

export default async function AdminAgentPage() {
  const [agentName, questionsJson, configsJson, activeId, oldProvider, oldApiKey, oldBaseUrl, oldModel] =
    await Promise.all([
      getConfig('agentName'),
      getConfig('suggestedQuestions'),
      getConfig('llmConfigs'),
      getConfig('llmActiveId'),
      getConfig('llmProvider'),
      getConfig('llmApiKey'),
      getConfig('llmBaseUrl'),
      getConfig('llmModel'),
    ])

  // 推荐问题（fallback 到默认）
  let suggestedQuestions: string[] = DEFAULT_QUESTIONS
  if (questionsJson) {
    try { suggestedQuestions = JSON.parse(questionsJson) } catch { /* ignore */ }
  }

  // LLM 配置（含旧版迁移）
  let llmConfigs: LLMConfig[] = []
  let llmActiveId = activeId ?? ''

  if (configsJson) {
    llmConfigs = JSON.parse(configsJson)
  } else if (oldProvider || oldApiKey || oldModel) {
    const migrated: LLMConfig = {
      id: 'migrated-v1',
      name: `${oldProvider ?? 'deepseek'} 配置（已迁移）`,
      provider: oldProvider ?? 'deepseek',
      model: oldModel ?? '',
      apiKey: oldApiKey ?? '',
      baseUrl: oldBaseUrl ?? '',
    }
    llmConfigs = [migrated]
    llmActiveId = 'migrated-v1'
    await Promise.all([
      setConfig('llmConfigs', JSON.stringify(llmConfigs)),
      setConfig('llmActiveId', llmActiveId),
    ])
  }

  return (
    <AgentClient
      initAgentName={agentName ?? '塞塞'}
      initQuestions={suggestedQuestions}
      llmConfigs={llmConfigs}
      llmActiveId={llmActiveId}
    />
  )
}

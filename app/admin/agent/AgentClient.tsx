'use client'

import { useState } from 'react'

const inputCls = 'border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 bg-white'

// ── LLM 配置类型（公共导出，供 settings/page.tsx 等复用） ────────────────────────

export interface LLMConfig {
  id: string
  name: string
  provider: string  // 'deepseek' | 'openai' | 'custom'
  model: string
  apiKey: string
  baseUrl: string
}

const PROVIDER_OPTIONS = [
  { value: 'deepseek', label: 'DeepSeek', defaultBase: 'https://api.deepseek.com', defaultModel: 'deepseek-chat' },
  { value: 'openai', label: 'OpenAI', defaultBase: 'https://api.openai.com/v1', defaultModel: 'gpt-4o-mini' },
  { value: 'custom', label: '自定义 / 中转站', defaultBase: '', defaultModel: '' },
]

// 各 provider 的预设模型列表（选"其他"时允许手填）
const PRESET_MODELS: Record<string, string[]> = {
  deepseek: ['deepseek-chat', 'deepseek-reasoner', 'deepseek-coder'],
  openai:   ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo', 'o1', 'o1-mini', 'o3-mini'],
  custom:   [],
}
const CUSTOM_VALUE = '__custom__'

const PROVIDER_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  deepseek: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'DS' },
  openai:   { bg: 'bg-green-100', text: 'text-green-700', label: 'OA' },
  custom:   { bg: 'bg-gray-100', text: 'text-gray-600', label: '自' },
}

function ProviderBadge({ provider }: { provider: string }) {
  const b = PROVIDER_BADGE[provider] ?? { bg: 'bg-gray-100', text: 'text-gray-600', label: provider.slice(0, 2).toUpperCase() }
  return (
    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold flex-shrink-0 ${b.bg} ${b.text}`}>
      {b.label}
    </span>
  )
}

function maskKey(key: string): string {
  if (!key) return '未设置'
  if (key.length <= 8) return '••••••••'
  return key.slice(0, 5) + '••••••••'
}

// ── 推荐问题编辑器 ─────────────────────────────────────────────────────────────

function QuestionsEditor({
  questions,
  onChange,
}: {
  questions: string[]
  onChange: (qs: string[]) => void
}) {
  const [draft, setDraft] = useState('')
  const [showForm, setShowForm] = useState(false)

  function add() {
    const q = draft.trim()
    if (!q) return
    onChange([...questions, q])
    setDraft('')
    setShowForm(false)
  }

  function remove(i: number) {
    onChange(questions.filter((_, idx) => idx !== i))
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= questions.length) return
    const next = [...questions];
    [next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  return (
    <div className="space-y-2">
      {questions.length === 0 && !showForm && (
        <p className="text-sm text-gray-400 py-1">暂无推荐问题</p>
      )}
      {questions.map((q, i) => (
        <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl">
          <span className="flex-1 text-sm text-gray-700 min-w-0 truncate" title={q}>{q}</span>
          <button
            onClick={() => move(i, -1)} disabled={i === 0}
            className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs border border-gray-200 rounded-lg bg-white flex-shrink-0"
            title="上移"
          >▲</button>
          <button
            onClick={() => move(i, 1)} disabled={i === questions.length - 1}
            className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs border border-gray-200 rounded-lg bg-white flex-shrink-0"
            title="下移"
          >▼</button>
          <button
            onClick={() => remove(i)}
            className="p-1.5 text-red-400 hover:text-red-600 text-xs border border-red-100 rounded-lg bg-white hover:bg-red-50 flex-shrink-0"
            title="删除"
          >✕</button>
        </div>
      ))}

      {showForm && (
        <div className="p-3 border border-gray-200 rounded-xl bg-gray-50 space-y-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder="输入问题，如：Ashia 有哪些技术栈？"
            className={inputCls + ' w-full'}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={add}
              disabled={!draft.trim()}
              className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-40"
            >
              确认添加
            </button>
            <button
              onClick={() => { setShowForm(false); setDraft('') }}
              className="px-4 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
        >
          + 添加推荐问题
        </button>
      )}
    </div>
  )
}

// ── LLM 多配置区块 ─────────────────────────────────────────────────────────────

function LLMConfigSection({
  initConfigs,
  initActiveId,
}: {
  initConfigs: LLMConfig[]
  initActiveId: string
}) {
  const [configs, setConfigs] = useState<LLMConfig[]>(initConfigs)
  const [activeId, setActiveId] = useState(initActiveId)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)
  const EMPTY_DRAFT = { name: '', provider: 'deepseek', model: 'deepseek-chat', apiKey: '', baseUrl: 'https://api.deepseek.com' }
  const [draft, setDraft] = useState(EMPTY_DRAFT)

  async function activate(id: string) {
    setSaving(id)
    await fetch('/api/admin/llm-config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activeId: id }),
    })
    setActiveId(id)
    setSaving(null)
  }

  async function deleteConfig(id: string) {
    if (!confirm('确认删除此配置？')) return
    const next = configs.filter((c) => c.id !== id)
    const newActiveId = activeId === id ? (next[0]?.id ?? '') : activeId
    await fetch('/api/admin/llm-config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ configs: next, activeId: newActiveId }),
    })
    setConfigs(next)
    setActiveId(newActiveId)
  }

  async function addConfig() {
    if (!draft.name.trim() || !draft.apiKey.trim()) return
    const newConfig: LLMConfig = { ...draft, id: `cfg-${Date.now()}` }
    const next = [...configs, newConfig]
    const newActiveId = configs.length === 0 ? newConfig.id : activeId
    await fetch('/api/admin/llm-config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ configs: next, activeId: newActiveId }),
    })
    setConfigs(next)
    if (configs.length === 0) setActiveId(newActiveId)
    setDraft(EMPTY_DRAFT)
    setShowForm(false)
  }

  function handleProviderChange(p: string) {
    const opt = PROVIDER_OPTIONS.find((o) => o.value === p)
    setDraft((d) => ({
      ...d,
      provider: p,
      model: d.model || opt?.defaultModel || '',
      baseUrl: d.baseUrl || opt?.defaultBase || '',
    }))
  }

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div>
        <h2 className="font-medium text-gray-800">AI 大模型配置</h2>
        <p className="text-xs text-gray-400 mt-0.5">保存多套配置，随时一键切换激活的模型</p>
      </div>

      <div className="space-y-2">
        {configs.length === 0 && !showForm && (
          <p className="text-sm text-gray-400 py-1">暂无配置，点击下方按钮添加第一套</p>
        )}
        {configs.map((cfg) => {
          const isActive = cfg.id === activeId
          return (
            <div
              key={cfg.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                isActive ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <ProviderBadge provider={cfg.provider} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{cfg.name}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  {cfg.model} · {maskKey(cfg.apiKey)}
                  {cfg.baseUrl && ` · ${cfg.baseUrl}`}
                </p>
              </div>
              {isActive ? (
                <span className="flex-shrink-0 text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                  ✓ 已激活
                </span>
              ) : (
                <button
                  onClick={() => activate(cfg.id)}
                  disabled={saving === cfg.id}
                  className="flex-shrink-0 text-xs bg-white border border-gray-300 text-gray-600 px-3 py-1 rounded-full hover:border-blue-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                >
                  {saving === cfg.id ? '切换中…' : '激活'}
                </button>
              )}
              <button
                onClick={() => deleteConfig(cfg.id)}
                className="flex-shrink-0 text-gray-300 hover:text-red-500 transition-colors text-lg leading-none"
                title="删除"
              >
                ×
              </button>
            </div>
          )
        })}
      </div>

      {showForm && (
        <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
          <p className="text-sm font-medium text-gray-700">添加新配置</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">配置名称 <span className="text-red-400">*</span></label>
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="如：DeepSeek 闪电版"
                className={inputCls + ' w-full'}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Provider</label>
              <select
                value={draft.provider}
                onChange={(e) => handleProviderChange(e.target.value)}
                className={inputCls + ' w-full'}
              >
                {PROVIDER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">模型</label>
              {(() => {
                const presets = PRESET_MODELS[draft.provider] ?? []
                const isCustomInput = presets.length > 0 && !presets.includes(draft.model)
                const selectVal = isCustomInput ? CUSTOM_VALUE : draft.model
                return presets.length > 0 ? (
                  <div className="space-y-1.5">
                    <select
                      value={selectVal}
                      onChange={(e) => {
                        if (e.target.value === CUSTOM_VALUE) {
                          setDraft({ ...draft, model: '' })
                        } else {
                          setDraft({ ...draft, model: e.target.value })
                        }
                      }}
                      className={inputCls + ' w-full'}
                    >
                      {presets.map((m) => <option key={m} value={m}>{m}</option>)}
                      <option value={CUSTOM_VALUE}>其他（手动输入）</option>
                    </select>
                    {(selectVal === CUSTOM_VALUE) && (
                      <input
                        value={draft.model}
                        onChange={(e) => setDraft({ ...draft, model: e.target.value })}
                        placeholder="输入模型名称"
                        className={inputCls + ' w-full'}
                        autoFocus
                      />
                    )}
                  </div>
                ) : (
                  <input
                    value={draft.model}
                    onChange={(e) => setDraft({ ...draft, model: e.target.value })}
                    placeholder="模型名称"
                    className={inputCls + ' w-full'}
                  />
                )
              })()}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Base URL（可选）</label>
              <input
                value={draft.baseUrl}
                onChange={(e) => setDraft({ ...draft, baseUrl: e.target.value })}
                placeholder="https://api.deepseek.com"
                className={inputCls + ' w-full'}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">API Key <span className="text-red-400">*</span></label>
            <input
              type="password"
              value={draft.apiKey}
              onChange={(e) => setDraft({ ...draft, apiKey: e.target.value })}
              placeholder="sk-..."
              className={inputCls + ' w-full'}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={addConfig}
              disabled={!draft.name.trim() || !draft.apiKey.trim()}
              className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {configs.length === 0 ? '添加并激活' : '添加'}
            </button>
            <button
              onClick={() => { setShowForm(false); setDraft(EMPTY_DRAFT) }}
              className="px-4 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
        >
          + 添加配置
        </button>
      )}
    </section>
  )
}

// ── 主组件 ─────────────────────────────────────────────────────────────────────

export function AgentClient({
  initAgentName,
  initQuestions,
  llmConfigs,
  llmActiveId,
}: {
  initAgentName: string
  initQuestions: string[]
  llmConfigs: LLMConfig[]
  llmActiveId: string
}) {
  const [agentName, setAgentName] = useState(initAgentName)
  const [questions, setQuestions] = useState<string[]>(initQuestions)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    setSaving(true)
    await fetch('/api/admin/agent-config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentName, suggestedQuestions: questions }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-8 max-w-2xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Agent 管理</h1>
        <button
          onClick={save}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saved ? '已保存 ✓' : saving ? '保存中…' : '保存'}
        </button>
      </div>

      {/* Agent 名称 */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <h2 className="font-medium text-gray-800">Agent 名称</h2>
          <p className="text-xs text-gray-400 mt-0.5">显示在聊天窗口标题栏</p>
        </div>
        <input
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          placeholder="如：塞塞"
          className={inputCls + ' w-full max-w-xs'}
        />
      </section>

      {/* 推荐问题 */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <h2 className="font-medium text-gray-800">推荐问题</h2>
          <p className="text-xs text-gray-400 mt-0.5">首页聊天框下方展示的快捷问题，最多建议 6 条</p>
        </div>
        <QuestionsEditor questions={questions} onChange={setQuestions} />
      </section>

      {/* LLM 配置 */}
      <LLMConfigSection initConfigs={llmConfigs} initActiveId={llmActiveId} />
    </div>
  )
}

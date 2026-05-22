'use client'

import { useState, useMemo } from 'react'
import type { Live2DLineRow } from '@/lib/db/live2d'

// ── 场景分组配置 ─────────────────────────────────────────────────────────────

const SCENE_GROUPS = [
  {
    key:   'idle',
    label: '平时台词',
    desc:  '角色空闲时随机播放，按当前页面区分',
    color: 'blue',
    scenes: [
      { key: 'idle',          label: '通用（各页兜底）' },
      { key: 'idle-home',     label: '首页' },
      { key: 'idle-projects', label: '项目页' },
      { key: 'idle-tools',    label: '工具页' },
      { key: 'idle-about',    label: '有关页' },
      { key: 'idle-admin',    label: '后台' },
    ],
  },
  {
    key:   'enter',
    label: '进入页面',
    desc:  '切换到对应页面时触发一次',
    color: 'green',
    scenes: [
      { key: 'enter-home',     label: '进入首页' },
      { key: 'enter-projects', label: '进入项目页' },
      { key: 'enter-tools',    label: '进入工具页' },
      { key: 'enter-about',    label: '进入有关页' },
      { key: 'enter-admin',    label: '进入后台' },
    ],
  },
  {
    key:   'interact',
    label: '互动触发',
    desc:  '点击角色、悬停卡片等交互行为触发',
    color: 'purple',
    scenes: [
      { key: 'click',         label: '点击角色（害羞反应）' },
      { key: 'hover-project', label: '悬停项目卡片' },
      { key: 'hover-tool',    label: '悬停工具卡片' },
      { key: 'long-stay',     label: '长时间停留' },
    ],
  },
] as const

type GroupKey = (typeof SCENE_GROUPS)[number]['key']

const ALL_SCENES = SCENE_GROUPS.flatMap(g => g.scenes.map(s => s.key))

const COLOR = {
  blue:   { tab: 'bg-blue-600',   badge: 'bg-blue-50 text-blue-700 border-blue-200',   btn: 'bg-blue-600 hover:bg-blue-700' },
  green:  { tab: 'bg-green-600',  badge: 'bg-green-50 text-green-700 border-green-200', btn: 'bg-green-600 hover:bg-green-700' },
  purple: { tab: 'bg-purple-600', badge: 'bg-purple-50 text-purple-700 border-purple-200', btn: 'bg-purple-600 hover:bg-purple-700' },
} as const

const inputCls = 'border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 bg-white'

const emptyLine = (scene: string): Omit<Live2DLineRow, 'id'> => ({
  text: '', scene, weight: 1, enabled: true,
})

// ── 主组件 ────────────────────────────────────────────────────────────────────

export function Live2DLinesClient({ lines: initLines }: { lines: Live2DLineRow[] }) {
  const [lines, setLines]           = useState(initLines)
  const [activeGroup, setActiveGroup] = useState<GroupKey>('idle')
  const [expanded, setExpanded]     = useState<Set<string>>(new Set(['idle-home']))
  const [editing, setEditing]       = useState<Live2DLineRow | null>(null)
  // adding: scene key → form state
  const [addingScene, setAddingScene] = useState<string | null>(null)
  const [addForm, setAddForm]         = useState<Omit<Live2DLineRow, 'id'>>(emptyLine('idle'))
  const [saving, setSaving]           = useState(false)

  // 按 scene 分组
  const byScene = useMemo(() => {
    const map: Record<string, Live2DLineRow[]> = {}
    lines.forEach(l => {
      if (!map[l.scene]) map[l.scene] = []
      map[l.scene].push(l)
    })
    return map
  }, [lines])

  const currentGroup = SCENE_GROUPS.find(g => g.key === activeGroup)!
  const colors = COLOR[currentGroup.color]

  // ── CRUD ──────────────────────────────────────────────────────────────────

  async function handleAdd() {
    if (!addForm.text.trim()) return
    setSaving(true)
    const res = await fetch('/api/admin/live2d/lines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addForm),
    })
    const newLine = await res.json()
    setLines(prev => [...prev, newLine])
    setAddingScene(null)
    setSaving(false)
  }

  async function handleUpdate() {
    if (!editing?.text.trim()) return
    setSaving(true)
    await fetch(`/api/admin/live2d/lines/${editing.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: editing.text, scene: editing.scene, weight: editing.weight, enabled: editing.enabled }),
    })
    setLines(prev => prev.map(l => l.id === editing.id ? editing : l))
    setEditing(null)
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('确认删除这条台词？')) return
    await fetch(`/api/admin/live2d/lines/${id}`, { method: 'DELETE' })
    setLines(prev => prev.filter(l => l.id !== id))
  }

  async function toggleEnabled(line: Live2DLineRow) {
    await fetch(`/api/admin/live2d/lines/${line.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !line.enabled }),
    })
    setLines(prev => prev.map(l => l.id === line.id ? { ...l, enabled: !l.enabled } : l))
  }

  function toggleExpand(scene: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(scene) ? next.delete(scene) : next.add(scene)
      return next
    })
  }

  function startAdding(scene: string) {
    setAddingScene(scene)
    setAddForm(emptyLine(scene))
    // 展开该 section
    setExpanded(prev => new Set([...prev, scene]))
  }

  // ── 渲染 ──────────────────────────────────────────────────────────────────

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      {/* 标题 */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Live2D 台词管理</h1>
        <p className="text-sm text-gray-500 mt-1">按场景分类管理塞塞的台词，支持增删改和启用/禁用</p>
      </div>

      {/* 大模块 Tab */}
      <div className="flex gap-2 border-b border-gray-200 pb-0">
        {SCENE_GROUPS.map(g => {
          const total   = g.scenes.reduce((n, s) => n + (byScene[s.key]?.length ?? 0), 0)
          const enabled = g.scenes.reduce((n, s) => n + (byScene[s.key]?.filter(l => l.enabled).length ?? 0), 0)
          const isActive = activeGroup === g.key
          const c = COLOR[g.color]
          return (
            <button
              key={g.key}
              onClick={() => setActiveGroup(g.key)}
              className={`px-5 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                isActive
                  ? `border-current text-white ${c.tab} -mb-px`
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {g.label}
              <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${
                isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {enabled}/{total}
              </span>
            </button>
          )
        })}
      </div>

      {/* 当前大模块说明 */}
      <p className="text-sm text-gray-500 -mt-2">{currentGroup.desc}</p>

      {/* 小模块（scene）列表 */}
      <div className="space-y-3">
        {currentGroup.scenes.map(scene => {
          const sceneLines = byScene[scene.key] ?? []
          const isOpen     = expanded.has(scene.key)
          const isAdding   = addingScene === scene.key

          return (
            <div key={scene.key} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Scene 标题栏 */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors select-none"
                onClick={() => toggleExpand(scene.key)}
              >
                <span className="text-gray-400 text-xs w-4">{isOpen ? '▾' : '▸'}</span>
                <span className="font-medium text-gray-800 text-sm flex-1">{scene.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${colors.badge}`}>
                  {scene.key}
                </span>
                <span className="text-xs text-gray-400">
                  {sceneLines.filter(l => l.enabled).length}/{sceneLines.length} 条启用
                </span>
                <button
                  onClick={e => { e.stopPropagation(); startAdding(scene.key) }}
                  className={`text-xs text-white px-2.5 py-1 rounded-lg ${colors.btn} transition-colors`}
                >
                  + 添加
                </button>
              </div>

              {/* 展开内容 */}
              {isOpen && (
                <div className="border-t border-gray-100">
                  {/* 新增表单 */}
                  {isAdding && (
                    <div className="bg-blue-50 border-b border-blue-100 px-4 py-3 space-y-2">
                      <textarea
                        value={addForm.text}
                        onChange={e => setAddForm(f => ({ ...f, text: e.target.value }))}
                        placeholder="输入台词内容，可包含颜文字和 emoji"
                        rows={2}
                        className={`${inputCls} w-full resize-none`}
                        autoFocus
                      />
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <span className="text-xs text-gray-500">权重</span>
                          <input
                            type="number" value={addForm.weight} min={0.1} max={10} step={0.1}
                            onChange={e => setAddForm(f => ({ ...f, weight: parseFloat(e.target.value) }))}
                            className={`${inputCls} w-20`}
                          />
                        </div>
                        <label className="flex items-center gap-1.5 text-sm text-gray-600">
                          <input type="checkbox" checked={addForm.enabled}
                            onChange={e => setAddForm(f => ({ ...f, enabled: e.target.checked }))} />
                          启用
                        </label>
                        <div className="flex gap-2 ml-auto">
                          <button onClick={handleAdd} disabled={saving}
                            className={`text-sm text-white px-3 py-1.5 rounded-lg ${colors.btn} disabled:opacity-50`}>
                            保存
                          </button>
                          <button onClick={() => setAddingScene(null)}
                            className="text-sm border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50">
                            取消
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 台词列表 */}
                  {sceneLines.length === 0 && !isAdding ? (
                    <p className="text-center text-gray-400 py-6 text-sm">暂无台词，点击「+ 添加」新增</p>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {sceneLines.map(line => (
                        <div key={line.id} className="px-4 py-2.5">
                          {editing?.id === line.id ? (
                            /* 行内编辑 */
                            <div className="space-y-2">
                              <textarea
                                value={editing.text}
                                onChange={e => setEditing({ ...editing, text: e.target.value })}
                                rows={2}
                                className={`${inputCls} w-full resize-none`}
                                autoFocus
                              />
                              <div className="flex items-center gap-3 flex-wrap">
                                <select
                                  value={editing.scene}
                                  onChange={e => setEditing({ ...editing, scene: e.target.value })}
                                  className={`${inputCls} text-xs`}
                                >
                                  {ALL_SCENES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <input type="number" value={editing.weight} min={0.1} max={10} step={0.1}
                                  onChange={e => setEditing({ ...editing, weight: parseFloat(e.target.value) })}
                                  className={`${inputCls} w-20`} />
                                <label className="flex items-center gap-1.5 text-sm text-gray-600">
                                  <input type="checkbox" checked={editing.enabled}
                                    onChange={e => setEditing({ ...editing, enabled: e.target.checked })} />
                                  启用
                                </label>
                                <div className="flex gap-2 ml-auto">
                                  <button onClick={handleUpdate} disabled={saving}
                                    className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                    保存
                                  </button>
                                  <button onClick={() => setEditing(null)}
                                    className="text-xs border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50">
                                    取消
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* 展示行 */
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => toggleEnabled(line)}
                                className={`flex-shrink-0 w-2 h-2 rounded-full transition-colors ${line.enabled ? 'bg-green-400' : 'bg-gray-300'}`}
                                title={line.enabled ? '已启用，点击禁用' : '已禁用，点击启用'}
                              />
                              <p className={`flex-1 text-sm leading-relaxed ${line.enabled ? 'text-gray-800' : 'text-gray-400 line-through'}`}>
                                {line.text}
                              </p>
                              <span className="text-[10px] text-gray-400 flex-shrink-0">×{line.weight}</span>
                              <div className="flex gap-2 flex-shrink-0">
                                <button onClick={() => setEditing(line)}
                                  className="text-xs text-blue-600 hover:underline">编辑</button>
                                <button onClick={() => handleDelete(line.id)}
                                  className="text-xs text-red-500 hover:underline">删除</button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

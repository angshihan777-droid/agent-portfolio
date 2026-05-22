'use client'

import { useState } from 'react'
import type { WelcomeConfig } from '@/components/modals/FirstVisitModal'

const inputCls = 'border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 bg-white w-full'

export function WelcomeClient({ initialConfig }: { initialConfig: WelcomeConfig }) {
  const [cfg, setCfg] = useState<WelcomeConfig>(initialConfig)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [linkDraft, setLinkDraft] = useState({ label: '', path: '' })
  const [showLinkForm, setShowLinkForm] = useState(false)

  async function save() {
    setSaving(true)
    await fetch('/api/admin/welcome', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cfg),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function updateLink(i: number, field: 'label' | 'path', val: string) {
    setCfg({ ...cfg, btnLinks: cfg.btnLinks.map((b, idx) => idx === i ? { ...b, [field]: val } : b) })
  }
  function removeLink(i: number) {
    setCfg({ ...cfg, btnLinks: cfg.btnLinks.filter((_, idx) => idx !== i) })
  }
  function moveLink(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= cfg.btnLinks.length) return
    const next = [...cfg.btnLinks]; [next[i], next[j]] = [next[j], next[i]]
    setCfg({ ...cfg, btnLinks: next })
  }
  function addLink() {
    if (!linkDraft.label.trim() || !linkDraft.path.trim()) return
    setCfg({ ...cfg, btnLinks: [...cfg.btnLinks, linkDraft] })
    setLinkDraft({ label: '', path: '' })
    setShowLinkForm(false)
  }

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">欢迎弹窗</h1>
        <button
          onClick={save}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saved ? '已保存 ✓' : saving ? '保存中…' : '保存'}
        </button>
      </div>

      {/* 内容配置 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">弹窗内容</h2>

        <div>
          <label className="block text-xs text-gray-500 mb-1">标题</label>
          <input
            value={cfg.title}
            onChange={(e) => setCfg({ ...cfg, title: e.target.value })}
            placeholder="欢迎来到 Ashia 的频道"
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">自我介绍</label>
          <textarea
            value={cfg.intro}
            onChange={(e) => setCfg({ ...cfg, intro: e.target.value })}
            rows={4}
            placeholder="在这里写自我介绍..."
            className={inputCls + ' resize-y'}
          />
        </div>
      </div>

      {/* 按钮配置 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">按钮配置</h2>

        {/* 主按钮 */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">主按钮文字（跳转到首页 /）</label>
          <input
            value={cfg.btnChat}
            onChange={(e) => setCfg({ ...cfg, btnChat: e.target.value })}
            placeholder="和 Agent 聊聊"
            className={inputCls}
          />
        </div>

        {/* 快捷链接按钮 */}
        <div>
          <label className="block text-xs text-gray-500 mb-2">快捷链接按钮（主按钮下方一排）</label>
          <div className="space-y-2">
            {cfg.btnLinks.map((btn, i) => (
              <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <input
                  value={btn.label}
                  onChange={(e) => updateLink(i, 'label', e.target.value)}
                  placeholder="按钮文字"
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 bg-white w-32 flex-shrink-0"
                />
                <input
                  value={btn.path}
                  onChange={(e) => updateLink(i, 'path', e.target.value)}
                  placeholder="/projects"
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 bg-white flex-1"
                />
                <button onClick={() => moveLink(i, -1)} disabled={i === 0}
                  className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs border border-gray-200 rounded-lg bg-white flex-shrink-0"
                  title="上移">▲</button>
                <button onClick={() => moveLink(i, 1)} disabled={i === cfg.btnLinks.length - 1}
                  className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs border border-gray-200 rounded-lg bg-white flex-shrink-0"
                  title="下移">▼</button>
                <button onClick={() => removeLink(i)}
                  className="p-1.5 text-red-400 hover:text-red-600 text-xs border border-red-100 rounded-lg bg-white hover:bg-red-50 flex-shrink-0"
                  title="删除">✕</button>
              </div>
            ))}
            {cfg.btnLinks.length === 0 && !showLinkForm && (
              <p className="text-sm text-gray-400 py-1">暂无快捷按钮</p>
            )}
          </div>

          {/* 添加新链接 */}
          {showLinkForm && (
            <div className="mt-2 p-3 border border-gray-200 rounded-xl bg-gray-50 space-y-2">
              <div className="flex gap-2">
                <input
                  value={linkDraft.label}
                  onChange={(e) => setLinkDraft({ ...linkDraft, label: e.target.value })}
                  placeholder="按钮文字，如：查看项目"
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 bg-white flex-1"
                />
                <input
                  value={linkDraft.path}
                  onChange={(e) => setLinkDraft({ ...linkDraft, path: e.target.value })}
                  placeholder="路径，如：/projects"
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 bg-white flex-1"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={addLink} disabled={!linkDraft.label.trim() || !linkDraft.path.trim()}
                  className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-40">
                  确认添加
                </button>
                <button onClick={() => { setShowLinkForm(false); setLinkDraft({ label: '', path: '' }) }}
                  className="px-4 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200">
                  取消
                </button>
              </div>
            </div>
          )}

          {!showLinkForm && (
            <button
              onClick={() => setShowLinkForm(true)}
              className="mt-2 w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
            >
              + 添加快捷按钮
            </button>
          )}
        </div>
      </div>

      {/* 预览 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-800 mb-4">预览</h2>
        <div className="bg-gray-900 rounded-2xl p-6 text-white max-w-xs">
          <h3 className="text-xl font-bold mb-3 leading-snug">{cfg.title || '（标题为空）'}</h3>
          <p className="text-sm text-white/70 leading-relaxed mb-5">{cfg.intro || '（介绍为空）'}</p>
          <div className="flex flex-col gap-2">
            <div className="w-full text-center py-2 bg-blue-500/80 rounded-xl text-sm font-medium">
              {cfg.btnChat || '（主按钮文字为空）'}
            </div>
            {cfg.btnLinks.length > 0 && (
              <div className="flex gap-2">
                {cfg.btnLinks.map((btn, i) => (
                  <div key={i} className="flex-1 text-center py-1.5 border border-white/20 rounded-xl text-xs text-white/70">
                    {btn.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

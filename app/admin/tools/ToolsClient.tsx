'use client'

import { useState } from 'react'
import type { ToolRow } from '@/lib/db/tools'

const EMPTY: Omit<ToolRow, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '', category: 'Agent', type: '网站', description: '',
  url: null, fileUrl: null, tags: [], isRecommended: false, order: 0,
}

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500'

function TagEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string[]
  onChange: (v: string[]) => void
  placeholder?: string
}) {
  const [draft, setDraft] = useState('')

  function add() {
    const v = draft.trim()
    if (!v || value.includes(v)) return
    onChange([...value, v])
    setDraft('')
  }

  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i))
  }

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1.5 min-h-[2.25rem] p-2 border border-gray-200 rounded-lg bg-gray-50">
        {value.map((tag, i) => (
          <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-200 rounded-full text-xs text-gray-700 shadow-sm">
            {tag}
            <button type="button" onClick={() => remove(i)} className="text-gray-400 hover:text-gray-700 leading-none font-medium">×</button>
          </span>
        ))}
        {value.length === 0 && <span className="text-gray-400 text-xs self-center">暂无，在下方添加</span>}
      </div>
      <div className="flex gap-1.5">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder={placeholder ?? '输入后按 Enter 添加'}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500"
        />
        <button
          type="button"
          onClick={add}
          disabled={!draft.trim()}
          className="px-3 py-1.5 bg-gray-800 text-white text-xs rounded-lg hover:bg-gray-900 disabled:opacity-40"
        >+</button>
      </div>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  )
}

export function ToolsClient({ initialTools }: { initialTools: ToolRow[] }) {
  const [tools, setTools] = useState(initialTools)
  const [editing, setEditing] = useState<ToolRow | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [form, setForm] = useState<Omit<ToolRow, 'id' | 'createdAt' | 'updatedAt'>>(EMPTY)

  function openNew() { setForm(EMPTY); setEditing(null); setIsNew(true) }
  function openEdit(t: ToolRow) {
    setForm({ name: t.name, category: t.category, type: t.type, description: t.description, url: t.url, fileUrl: t.fileUrl, tags: t.tags, isRecommended: t.isRecommended, order: t.order })
    setEditing(t); setIsNew(false)
  }
  function closeForm() { setEditing(null); setIsNew(false) }

  async function save() {
    if (isNew) {
      const res = await fetch('/api/admin/tools', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const created = await res.json()
      setTools([...tools, { ...created, tags: form.tags }])
    } else if (editing) {
      await fetch(`/api/admin/tools/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      setTools(tools.map((t) => t.id === editing.id ? { ...editing, ...form } : t))
    }
    closeForm()
  }

  async function remove(id: string) {
    if (!confirm('确认删除？')) return
    await fetch(`/api/admin/tools/${id}`, { method: 'DELETE' })
    setTools(tools.filter((t) => t.id !== id))
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">工具管理</h1>
        <button onClick={openNew} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">+ 新增工具</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['名称', '分类', '类型', '推荐', '操作'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tools.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-800 font-medium">{t.name}</td>
                <td className="px-4 py-3 text-gray-500">{t.category}</td>
                <td className="px-4 py-3 text-gray-500">{t.type}</td>
                <td className="px-4 py-3">{t.isRecommended ? '✅' : '—'}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => openEdit(t)} className="text-blue-600 hover:underline">编辑</button>
                  <button onClick={() => remove(t.id)} className="text-red-500 hover:underline">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(isNew || editing) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-3">
            <h2 className="text-lg font-semibold text-gray-800">{isNew ? '新增工具' : '编辑工具'}</h2>
            <FormField label="名称"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} /></FormField>
            <FormField label="分类">
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
                {['Agent', 'LLM', 'RAG', '开发工具', '前端', '后端', '设计资源', '学习资料', '视频网站'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </FormField>
            <FormField label="类型">
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputCls}>
                {['网站', 'GitHub', '文件', '视频', '文档'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField label="简介"><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className={inputCls} /></FormField>
            <FormField label="URL"><input value={form.url ?? ''} onChange={(e) => setForm({ ...form, url: e.target.value || null })} className={inputCls} /></FormField>
            <FormField label="文件 URL（下载类）"><input value={form.fileUrl ?? ''} onChange={(e) => setForm({ ...form, fileUrl: e.target.value || null })} className={inputCls} /></FormField>
            <FormField label="标签">
              <TagEditor value={form.tags} onChange={(v) => setForm({ ...form, tags: v })} placeholder="输入一个标签，按 Enter 添加" />
            </FormField>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="rec" checked={form.isRecommended} onChange={(e) => setForm({ ...form, isRecommended: e.target.checked })} />
              <label htmlFor="rec" className="text-sm text-gray-600">显示在 Agent 推荐中</label>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={save} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700">保存</button>
              <button onClick={closeForm} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-200">取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import type { ProjectRow } from '@/lib/db/projects'

const EMPTY: Omit<ProjectRow, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '', type: '我的项目', category: 'Agent', description: '',
  techStack: [], highlights: [], githubUrl: null, demoUrl: null,
  coverUrl: null, isFeatured: false, order: 0,
}

export function ProjectsClient({ initialProjects }: { initialProjects: ProjectRow[] }) {
  const [projects, setProjects] = useState(initialProjects)
  const [editing, setEditing] = useState<ProjectRow | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [form, setForm] = useState<Omit<ProjectRow, 'id' | 'createdAt' | 'updatedAt'>>(EMPTY)

  function openNew() {
    setForm(EMPTY)
    setEditing(null)
    setIsNew(true)
  }

  function openEdit(p: ProjectRow) {
    setForm({
      title: p.title, type: p.type, category: p.category, description: p.description,
      techStack: p.techStack, highlights: p.highlights, githubUrl: p.githubUrl,
      demoUrl: p.demoUrl, coverUrl: p.coverUrl, isFeatured: p.isFeatured, order: p.order,
    })
    setEditing(p)
    setIsNew(false)
  }

  function closeForm() { setEditing(null); setIsNew(false) }

  async function save() {
    if (isNew) {
      const res = await fetch('/api/admin/projects', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const created = await res.json()
      setProjects([...projects, { ...created, techStack: form.techStack, highlights: form.highlights }])
    } else if (editing) {
      await fetch(`/api/admin/projects/${editing.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setProjects(projects.map((p) => p.id === editing.id ? { ...editing, ...form } : p))
    }
    closeForm()
  }

  async function remove(id: string) {
    if (!confirm('确认删除？')) return
    await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' })
    setProjects(projects.filter((p) => p.id !== id))
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">项目管理</h1>
        <button onClick={openNew} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          + 新增项目
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['标题', '类型', '分类', '是否精选', '操作'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {projects.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-800 font-medium">{p.title}</td>
                <td className="px-4 py-3 text-gray-500">{p.type}</td>
                <td className="px-4 py-3 text-gray-500">{p.category}</td>
                <td className="px-4 py-3">{p.isFeatured ? '✅' : '—'}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => openEdit(p)} className="text-blue-600 hover:underline">编辑</button>
                  <button onClick={() => remove(p.id)} className="text-red-500 hover:underline">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 编辑/新增表单 */}
      {(isNew || editing) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-3">
            <h2 className="text-lg font-semibold text-gray-800">{isNew ? '新增项目' : '编辑项目'}</h2>
            <FormField label="标题">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} />
            </FormField>
            <FormField label="类型">
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputCls}>
                <option>我的项目</option><option>收藏的项目</option>
              </select>
            </FormField>
            <FormField label="分类">
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
                {['Agent', 'Web', '工具', '学习'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </FormField>
            <FormField label="简介">
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={inputCls} />
            </FormField>
            <FormField label="技术栈">
              <TagEditor value={form.techStack} onChange={(v) => setForm({ ...form, techStack: v })} placeholder="输入一项技术，按 Enter 添加" />
            </FormField>
            <FormField label="亮点">
              <TagEditor value={form.highlights} onChange={(v) => setForm({ ...form, highlights: v })} placeholder="输入一条亮点，按 Enter 添加" />
            </FormField>
            <FormField label="GitHub URL">
              <input value={form.githubUrl ?? ''} onChange={(e) => setForm({ ...form, githubUrl: e.target.value || null })} className={inputCls} />
            </FormField>
            <FormField label="Demo URL">
              <input value={form.demoUrl ?? ''} onChange={(e) => setForm({ ...form, demoUrl: e.target.value || null })} className={inputCls} />
            </FormField>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="featured" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
              <label htmlFor="featured" className="text-sm text-gray-600">精选项目</label>
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

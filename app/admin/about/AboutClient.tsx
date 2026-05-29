'use client'

import { useState, useRef } from 'react'
import type { AboutData } from '@/lib/db/about'

const inputCls = 'border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 bg-white'

// ── 头像上传 ───────────────────────────────────────────────────────────────────

function AvatarUploader({
  avatarUrl,
  onChange,
}: {
  avatarUrl: string
  onChange: (url: string) => void
}) {
  const [uploading, setUploading] = useState(false)

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    form.append('type', 'avatar')
    const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
    const data = await res.json()
    if (data.url) onChange(data.url)
    setUploading(false)
    e.target.value = ''
  }

  return (
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-200 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow">
        {avatarUrl ? (
          <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
        ) : (
          <span className="text-white text-2xl font-bold">?</span>
        )}
      </div>
      <div className="space-y-1.5">
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-sm text-gray-700 transition-colors">
            {uploading ? '上传中…' : '上传头像'}
          </span>
          <input type="file" accept="image/*" onChange={upload} className="hidden" disabled={uploading} />
        </label>
        {avatarUrl ? (
          <p className="text-xs text-gray-400 truncate max-w-[200px]">{avatarUrl}</p>
        ) : (
          <p className="text-xs text-gray-400">建议正方形图片，支持 JPG / PNG / WebP</p>
        )}
      </div>
    </div>
  )
}

// ── 求职方向 Tag 编辑器 ────────────────────────────────────────────────────────

function DirectionEditor({
  directions,
  onChange,
}: {
  directions: string[]
  onChange: (dirs: string[]) => void
}) {
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function add() {
    const v = draft.trim()
    if (!v || directions.includes(v)) return
    onChange([...directions, v])
    setDraft('')
    inputRef.current?.focus()
  }

  function remove(i: number) {
    onChange(directions.filter((_, idx) => idx !== i))
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 min-h-[2rem]">
        {directions.map((d, i) => (
          <span
            key={i}
            className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-sm text-blue-700"
          >
            {d}
            <button
              onClick={() => remove(i)}
              className="text-blue-400 hover:text-blue-700 leading-none text-base font-medium"
              title="移除"
            >×</button>
          </span>
        ))}
        {directions.length === 0 && (
          <span className="text-gray-400 text-sm">暂无方向，在下方输入后添加</span>
        )}
      </div>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="输入一个求职方向，按 Enter 或点击添加"
          className={inputCls + ' flex-1'}
        />
        <button
          onClick={add}
          disabled={!draft.trim()}
          className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          添加
        </button>
      </div>
    </div>
  )
}

// ── 技术栈分类编辑器 ───────────────────────────────────────────────────────────

type TechGroup = { category: string; items: string[] }

function TechStackEditor({
  stack,
  onChange,
}: {
  stack: TechGroup[]
  onChange: (s: TechGroup[]) => void
}) {
  const [drafts, setDrafts] = useState<Record<number, string>>({})
  const draftRefs = useRef<Record<number, HTMLInputElement | null>>({})

  function updateCategory(i: number, category: string) {
    onChange(stack.map((g, idx) => idx === i ? { ...g, category } : g))
  }

  function addItem(i: number) {
    const v = drafts[i]?.trim()
    if (!v || stack[i].items.includes(v)) return
    onChange(stack.map((g, idx) => idx === i ? { ...g, items: [...g.items, v] } : g))
    setDrafts(d => ({ ...d, [i]: '' }))
    draftRefs.current[i]?.focus()
  }

  function removeItem(gi: number, ii: number) {
    onChange(stack.map((g, idx) =>
      idx === gi ? { ...g, items: g.items.filter((_, j) => j !== ii) } : g
    ))
  }

  function removeGroup(i: number) {
    if (!confirm(`确认删除分类「${stack[i].category}」及其所有技术？`)) return
    onChange(stack.filter((_, idx) => idx !== i))
  }

  function addGroup() {
    onChange([...stack, { category: '', items: [] }])
  }

  function moveGroup(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= stack.length) return
    const next = [...stack]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {stack.map((group, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
          <div className="flex items-center gap-2">
            <input
              value={group.category}
              onChange={(e) => updateCategory(i, e.target.value)}
              placeholder="分类名称，如：前端"
              className={inputCls + ' flex-1 font-medium'}
            />
            <button onClick={() => moveGroup(i, -1)} disabled={i === 0}
              className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs border border-gray-200 rounded-lg bg-white"
              title="上移">▲</button>
            <button onClick={() => moveGroup(i, 1)} disabled={i === stack.length - 1}
              className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs border border-gray-200 rounded-lg bg-white"
              title="下移">▼</button>
            <button onClick={() => removeGroup(i)}
              className="p-1.5 text-red-400 hover:text-red-600 text-xs border border-red-100 rounded-lg bg-white hover:bg-red-50"
              title="删除分类">✕</button>
          </div>
          <div className="flex flex-wrap gap-1.5 min-h-[2rem]">
            {group.items.map((item, j) => (
              <span
                key={j}
                className="flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-700 shadow-sm"
              >
                {item}
                <button
                  onClick={() => removeItem(i, j)}
                  className="text-gray-400 hover:text-gray-700 leading-none font-medium"
                  title="移除"
                >×</button>
              </span>
            ))}
            {group.items.length === 0 && (
              <span className="text-gray-400 text-xs">暂无技术，在下方输入后添加</span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              ref={(el) => { draftRefs.current[i] = el }}
              value={drafts[i] ?? ''}
              onChange={(e) => setDrafts(d => ({ ...d, [i]: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && addItem(i)}
              placeholder="输入一项技术，按 Enter 或点击 +"
              className={inputCls + ' flex-1 text-xs'}
            />
            <button
              onClick={() => addItem(i)}
              disabled={!drafts[i]?.trim()}
              className="px-3 py-1.5 bg-gray-800 text-white text-xs rounded-lg hover:bg-gray-900 disabled:opacity-40"
            >+</button>
          </div>
        </div>
      ))}
      <button
        onClick={addGroup}
        className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
      >
        + 新增技术栈分类
      </button>
    </div>
  )
}

// ── 工作经历编辑器 ─────────────────────────────────────────────────────────────

type WorkExp = { company: string; position: string; period: string; highlights: string[] }

function WorkExperienceEditor({
  experiences,
  onChange,
}: {
  experiences: WorkExp[]
  onChange: (exps: WorkExp[]) => void
}) {
  const [drafts, setDrafts] = useState<Record<number, string>>({})

  function update(i: number, field: keyof Omit<WorkExp, 'highlights'>, value: string) {
    onChange(experiences.map((e, idx) => idx === i ? { ...e, [field]: value } : e))
  }

  function addHighlight(i: number) {
    const v = drafts[i]?.trim()
    if (!v) return
    onChange(experiences.map((e, idx) =>
      idx === i ? { ...e, highlights: [...e.highlights, v] } : e
    ))
    setDrafts(d => ({ ...d, [i]: '' }))
  }

  function removeHighlight(ei: number, hi: number) {
    onChange(experiences.map((e, idx) =>
      idx === ei ? { ...e, highlights: e.highlights.filter((_, j) => j !== hi) } : e
    ))
  }

  function remove(i: number) {
    if (!confirm(`确认删除「${experiences[i].company || '该条'}」的工作经历？`)) return
    onChange(experiences.filter((_, idx) => idx !== i))
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= experiences.length) return
    const next = [...experiences]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  function add() {
    onChange([...experiences, { company: '', position: '', period: '', highlights: [] }])
  }

  return (
    <div className="space-y-3">
      {experiences.map((exp, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
          {/* 基本信息 */}
          <div className="flex items-center gap-2 flex-wrap">
            <input
              value={exp.company}
              onChange={(e) => update(i, 'company', e.target.value)}
              placeholder="公司名称"
              className={inputCls + ' flex-1 min-w-[120px] font-medium'}
            />
            <input
              value={exp.position}
              onChange={(e) => update(i, 'position', e.target.value)}
              placeholder="职位"
              className={inputCls + ' flex-1 min-w-[100px]'}
            />
            <input
              value={exp.period}
              onChange={(e) => update(i, 'period', e.target.value)}
              placeholder="如：2024.06 — 至今"
              className={inputCls + ' flex-1 min-w-[140px]'}
            />
            <button onClick={() => move(i, -1)} disabled={i === 0}
              className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs border border-gray-200 rounded-lg bg-white"
              title="上移">▲</button>
            <button onClick={() => move(i, 1)} disabled={i === experiences.length - 1}
              className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs border border-gray-200 rounded-lg bg-white"
              title="下移">▼</button>
            <button onClick={() => remove(i)}
              className="p-1.5 text-red-400 hover:text-red-600 text-xs border border-red-100 rounded-lg bg-white hover:bg-red-50"
              title="删除">✕</button>
          </div>

          {/* 工作亮点 */}
          <div>
            <p className="text-xs text-gray-400 mb-2">工作亮点</p>
            <div className="space-y-1.5">
              {exp.highlights.map((h, j) => (
                <div key={j} className="flex items-start gap-2">
                  <span className="text-blue-400 text-xs mt-2 flex-shrink-0">▸</span>
                  <span className="flex-1 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-1.5 leading-relaxed">
                    {h}
                  </span>
                  <button
                    onClick={() => removeHighlight(i, j)}
                    className="text-gray-400 hover:text-red-500 text-sm mt-1.5 flex-shrink-0 leading-none"
                  >×</button>
                </div>
              ))}
              {exp.highlights.length === 0 && (
                <p className="text-gray-400 text-xs pl-5">暂无亮点，在下方输入后添加</p>
              )}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                value={drafts[i] ?? ''}
                onChange={(e) => setDrafts(d => ({ ...d, [i]: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && addHighlight(i)}
                placeholder="输入一条工作亮点，按 Enter 或点击 +"
                className={inputCls + ' flex-1 text-sm'}
              />
              <button
                onClick={() => addHighlight(i)}
                disabled={!drafts[i]?.trim()}
                className="px-3 py-1.5 bg-gray-800 text-white text-xs rounded-lg hover:bg-gray-900 disabled:opacity-40"
              >+</button>
            </div>
          </div>
        </div>
      ))}
      <button
        onClick={add}
        className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
      >
        + 新增工作经历
      </button>
    </div>
  )
}

// ── 教育经历编辑器 ─────────────────────────────────────────────────────────────

type Education = { school: string; degree: string; period: string }

function EducationEditor({
  education,
  onChange,
}: {
  education: Education[]
  onChange: (edu: Education[]) => void
}) {
  function update(i: number, field: keyof Education, value: string) {
    onChange(education.map((e, idx) => idx === i ? { ...e, [field]: value } : e))
  }

  function remove(i: number) {
    if (!confirm(`确认删除「${education[i].school || '该条'}」的教育经历？`)) return
    onChange(education.filter((_, idx) => idx !== i))
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= education.length) return
    const next = [...education]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  function add() {
    onChange([...education, { school: '', degree: '', period: '' }])
  }

  return (
    <div className="space-y-3">
      {education.map((edu, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
          <div className="flex items-center gap-2 flex-wrap">
            <input
              value={edu.school}
              onChange={(e) => update(i, 'school', e.target.value)}
              placeholder="院校名称"
              className={inputCls + ' flex-1 min-w-[140px] font-medium'}
            />
            <input
              value={edu.degree}
              onChange={(e) => update(i, 'degree', e.target.value)}
              placeholder="学位，如：计算机科学与技术 本科"
              className={inputCls + ' flex-1 min-w-[200px]'}
            />
            <input
              value={edu.period}
              onChange={(e) => update(i, 'period', e.target.value)}
              placeholder="如：2018 — 2022"
              className={inputCls + ' min-w-[120px]'}
            />
            <button onClick={() => move(i, -1)} disabled={i === 0}
              className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs border border-gray-200 rounded-lg bg-white"
              title="上移">▲</button>
            <button onClick={() => move(i, 1)} disabled={i === education.length - 1}
              className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs border border-gray-200 rounded-lg bg-white"
              title="下移">▼</button>
            <button onClick={() => remove(i)}
              className="p-1.5 text-red-400 hover:text-red-600 text-xs border border-red-100 rounded-lg bg-white hover:bg-red-50"
              title="删除">✕</button>
          </div>
        </div>
      ))}
      <button
        onClick={add}
        className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
      >
        + 新增教育经历
      </button>
    </div>
  )
}

// ── 联系方式编辑器 ─────────────────────────────────────────────────────────────

const ICON_OPTIONS = [
  { value: 'github',   label: 'GitHub',       emoji: 'GH' },
  { value: 'email',    label: 'Email',         emoji: '📧' },
  { value: 'wechat',   label: '微信',          emoji: '💬' },
  { value: 'qq',       label: 'QQ',            emoji: '🐧' },
  { value: 'phone',    label: '电话',          emoji: '📱' },
  { value: 'twitter',  label: 'Twitter / X',   emoji: '🐦' },
  { value: 'linkedin', label: 'LinkedIn',      emoji: '💼' },
  { value: 'blog',     label: '博客',          emoji: '📝' },
  { value: 'link',     label: '其他链接',      emoji: '🔗' },
]
const ICON_EMOJI = Object.fromEntries(ICON_OPTIONS.map((o) => [o.value, o.emoji]))

type ContactRaw = { label: string; type: 'link' | 'copy'; href: string; value: string; icon: string }

function toRaw(item: any): ContactRaw {
  return { label: item.label ?? '', type: item.type ?? 'link', href: item.href ?? '', value: item.value ?? '', icon: item.icon ?? 'link' }
}
function fromRaw(raw: ContactRaw) {
  return raw.type === 'link'
    ? { type: 'link' as const, label: raw.label, href: raw.href, icon: raw.icon }
    : { type: 'copy' as const, label: raw.label, value: raw.value, icon: raw.icon }
}

const EMPTY_CONTACT: ContactRaw = { label: '', type: 'link', href: '', value: '', icon: 'link' }

function ContactEditor({ contact, onChange }: { contact: any[]; onChange: (c: any[]) => void }) {
  const raws = contact.map(toRaw)
  const [showForm, setShowForm] = useState(false)
  const [draft, setDraft] = useState<ContactRaw>(EMPTY_CONTACT)

  function update(i: number, patch: Partial<ContactRaw>) {
    onChange(raws.map((r, idx) => idx === i ? fromRaw({ ...r, ...patch }) : fromRaw(r)))
  }
  function remove(i: number) {
    if (!confirm(`确认删除「${raws[i].label || '该联系方式'}」？`)) return
    onChange(raws.filter((_, idx) => idx !== i).map(fromRaw))
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= raws.length) return
    const next = [...raws]; [next[i], next[j]] = [next[j], next[i]]
    onChange(next.map(fromRaw))
  }
  function add() {
    if (!draft.label.trim()) return
    onChange([...raws, draft].map(fromRaw))
    setDraft(EMPTY_CONTACT)
    setShowForm(false)
  }

  return (
    <div className="space-y-2">
      {raws.map((item, i) => (
        <div key={i} className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl bg-gray-50 flex-wrap">
          <span className="text-sm w-6 text-center flex-shrink-0 font-bold text-gray-500">
            {ICON_EMOJI[item.icon] ?? '🔗'}
          </span>
          <input value={item.label} onChange={(e) => update(i, { label: e.target.value })}
            placeholder="名称" className={inputCls + ' w-24 flex-shrink-0'} />
          <select value={item.type} onChange={(e) => update(i, { type: e.target.value as 'link' | 'copy' })}
            className={inputCls + ' flex-shrink-0'}>
            <option value="link">跳转 ↗</option>
            <option value="copy">复制 📋</option>
          </select>
          <select value={item.icon} onChange={(e) => update(i, { icon: e.target.value })}
            className={inputCls + ' flex-shrink-0'}>
            {ICON_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.emoji} {o.label}</option>)}
          </select>
          {item.type === 'link'
            ? <input value={item.href} onChange={(e) => update(i, { href: e.target.value })}
                placeholder="https://..." className={inputCls + ' flex-1 min-w-[140px]'} />
            : <input value={item.value} onChange={(e) => update(i, { value: e.target.value })}
                placeholder="要复制的内容（如微信号）" className={inputCls + ' flex-1 min-w-[140px]'} />}
          <button onClick={() => move(i, -1)} disabled={i === 0}
            className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs border border-gray-200 rounded-lg bg-white"
            title="上移">▲</button>
          <button onClick={() => move(i, 1)} disabled={i === raws.length - 1}
            className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs border border-gray-200 rounded-lg bg-white"
            title="下移">▼</button>
          <button onClick={() => remove(i)}
            className="p-1.5 text-red-400 hover:text-red-600 text-xs border border-red-100 rounded-lg bg-white hover:bg-red-50"
            title="删除">✕</button>
        </div>
      ))}

      {showForm && (
        <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
          <p className="text-xs font-medium text-gray-600">添加联系方式</p>
          <div className="flex gap-3 flex-wrap">
            <div>
              <label className="block text-xs text-gray-400 mb-1">名称</label>
              <input value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                placeholder="GitHub" className={inputCls + ' w-28'} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">图标</label>
              <select value={draft.icon} onChange={(e) => setDraft({ ...draft, icon: e.target.value })} className={inputCls}>
                {ICON_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.emoji} {o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">交互方式</label>
              <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as 'link' | 'copy' })} className={inputCls}>
                <option value="link">跳转链接 ↗</option>
                <option value="copy">复制 📋</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              {draft.type === 'link' ? 'URL（跳转目标）' : '复制内容（微信号 / QQ 号等）'}
            </label>
            {draft.type === 'link'
              ? <input value={draft.href} onChange={(e) => setDraft({ ...draft, href: e.target.value })}
                  placeholder="https://github.com/your-username" className={inputCls + ' w-full'} />
              : <input value={draft.value} onChange={(e) => setDraft({ ...draft, value: e.target.value })}
                  placeholder="your-wechat-id" className={inputCls + ' w-full'} />}
          </div>
          <div className="flex gap-2">
            <button onClick={add} disabled={!draft.label.trim()}
              className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-40">
              确认添加
            </button>
            <button onClick={() => { setShowForm(false); setDraft(EMPTY_CONTACT) }}
              className="px-4 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200">
              取消
            </button>
          </div>
        </div>
      )}

      {!showForm && (
        <button onClick={() => setShowForm(true)}
          className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors">
          + 添加联系方式
        </button>
      )}
    </div>
  )
}

// ── 主组件 ─────────────────────────────────────────────────────────────────────

const EMPTY_ABOUT: AboutData = {
  name: '',
  nickname: '',
  avatarUrl: '',
  jobDirection: [],
  summary: '',
  contact: [],
  resumeUrl: '',
  techStack: [],
  workExperience: [],
  education: [],
}

export function AboutClient({ initialAbout }: { initialAbout: AboutData | null }) {
  const [about, setAbout] = useState<AboutData>(initialAbout ?? EMPTY_ABOUT)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const directions: string[] = Array.isArray(about.jobDirection)
    ? about.jobDirection
    : (about.jobDirection as string).split(/[/、,]/).map(s => s.trim()).filter(Boolean)

  async function save() {
    setSaving(true)
    await fetch('/api/admin/about', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(about),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">个人信息</h1>
        <button
          onClick={save}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saved ? '已保存 ✓' : saving ? '保存中…' : '保存'}
        </button>
      </div>

      {/* 基本信息 */}
      <Section title="基本信息">
        <Field label="头像">
          <AvatarUploader
            avatarUrl={(about as any).avatarUrl ?? ''}
            onChange={(url) => setAbout({ ...about, avatarUrl: url } as any)}
          />
        </Field>
        <Field label="姓名">
          <input
            value={about.name}
            onChange={(e) => setAbout({ ...about, name: e.target.value })}
            className={inputCls + ' w-full'}
          />
        </Field>
        <Field label="个人简介">
          <textarea
            value={about.summary}
            onChange={(e) => setAbout({ ...about, summary: e.target.value })}
            rows={4}
            className={inputCls + ' w-full resize-y'}
          />
        </Field>
      </Section>

      {/* 求职方向 */}
      <Section title="求职方向" desc="每个方向独立添加，前台将用「/」连接展示">
        <DirectionEditor
          directions={directions}
          onChange={(dirs) => setAbout({ ...about, jobDirection: dirs })}
        />
      </Section>

      {/* 技术栈 */}
      <Section title="技术栈分类" desc="每个分类独立管理，技术单独添加为标签">
        <TechStackEditor
          stack={about.techStack}
          onChange={(stack) => setAbout({ ...about, techStack: stack })}
        />
      </Section>

      {/* 工作经历 */}
      <Section title="工作经历" desc="按时间倒序排列，最近的在上方">
        <WorkExperienceEditor
          experiences={about.workExperience}
          onChange={(exps) => setAbout({ ...about, workExperience: exps })}
        />
      </Section>

      {/* 教育经历 */}
      <Section title="教育经历">
        <EducationEditor
          education={about.education}
          onChange={(edu) => setAbout({ ...about, education: edu })}
        />
      </Section>

      {/* 联系方式 */}
      <Section title="联系方式" desc="展示在有关页和主页对话框下方，可选跳转链接或点击复制，拖动 ▲▼ 调整顺序">
        <ContactEditor
          contact={about.contact}
          onChange={(c) => setAbout({ ...about, contact: c as any })}
        />
      </Section>
    </div>
  )
}

function Section({
  title,
  desc,
  children,
}: {
  title: string
  desc?: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div>
        <h2 className="font-semibold text-gray-800">{title}</h2>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  )
}

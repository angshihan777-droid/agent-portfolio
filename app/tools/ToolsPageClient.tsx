'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ToolCard } from '@/components/tools/ToolCard'
import { ToolDetailModal } from '@/components/tools/ToolDetailModal'
import { GlassPanel } from '@/components/layout/GlassPanel'
import type { ToolRow } from '@/lib/db/tools'

type TypeTab = '全部' | '网站' | '文件下载'
const typeTabs: TypeTab[] = ['全部', '网站', '文件下载']
const categories = ['全部', 'Agent', 'LLM', 'RAG', '开发工具', '前端', '后端', '设计资源', '学习资料']

const matchType = (tool: ToolRow, tab: TypeTab) => {
  if (tab === '全部') return true
  if (tab === '文件下载') return tool.type === '文件'
  return tool.type !== '文件'
}

export function ToolsPageClient({ tools }: { tools: ToolRow[] }) {
  const [typeTab, setTypeTab] = useState<TypeTab>('全部')
  const [activeCategory, setActiveCategory] = useState('全部')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<ToolRow | null>(null)

  const filtered = useMemo(() => tools.filter((t) => {
    const q = search.toLowerCase()
    return (
      matchType(t, typeTab) &&
      (activeCategory === '全部' || t.category === activeCategory) &&
      (!q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.tags.some((tag) => tag.toLowerCase().includes(q)))
    )
  }), [typeTab, activeCategory, search, tools])

  return (
    <>
      <main className="flex-1 overflow-y-auto p-4 pb-6">
        <div className="max-w-3xl mx-auto space-y-3">
          <div>
            <h1 className="text-white text-xl font-bold">工具</h1>
            <p className="text-white/50 text-xs mt-0.5">收藏的工具、网站和学习资源</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {typeTabs.map((t) => (
              <button key={t} onClick={() => setTypeTab(t)}
                className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all border ${
                  typeTab === t
                    ? t === '文件下载'
                      ? 'bg-amber-500/80 text-white border-amber-400/50 shadow-md shadow-amber-500/20'
                      : 'bg-blue-500/85 text-white border-blue-400/50 shadow-md shadow-blue-500/20'
                    : 'text-white/60 hover:text-white border-white/15 bg-white/5 hover:bg-white/12'
                }`}
              >
                {t === '网站' ? '↗ 网站' : t === '文件下载' ? '↓ 文件下载' : t}
              </button>
            ))}
          </div>

          <div className="flex gap-1.5 flex-wrap">
            {categories.map((c) => (
              <button key={c} onClick={() => setActiveCategory(c)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeCategory === c ? 'bg-white/20 text-white' : 'text-white/45 hover:text-white/80 hover:bg-white/10'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <GlassPanel className="px-3 py-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索工具名称或标签…"
              className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
            />
          </GlassPanel>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((tool, i) => (
              <motion.div key={tool.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }} whileHover={{ scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
              >
                <ToolCard tool={tool} onClick={() => setSelected(tool)} />
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && <div className="text-center text-white/40 py-12">没有找到匹配的工具</div>}
        </div>
      </main>

      <ToolDetailModal tool={selected} onClose={() => setSelected(null)} />
    </>
  )
}

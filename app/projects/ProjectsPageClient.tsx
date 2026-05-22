'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { ProjectDetailModal } from '@/components/projects/ProjectDetailModal'
import type { ProjectRow } from '@/lib/db/projects'

type TypeFilter = '全部' | '我的项目' | '收藏的项目'
type CatFilter = '全部' | 'Agent' | 'Web' | '工具' | '学习'

const typeFilters: TypeFilter[] = ['全部', '我的项目', '收藏的项目']
const catFilters: CatFilter[] = ['全部', 'Agent', 'Web', '工具', '学习']

export function ProjectsPageClient({ projects }: { projects: ProjectRow[] }) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('全部')
  const [catFilter, setCatFilter] = useState<CatFilter>('全部')
  const [selected, setSelected] = useState<ProjectRow | null>(null)

  const filtered = projects.filter(
    (p) =>
      (typeFilter === '全部' || p.type === typeFilter) &&
      (catFilter === '全部' || p.category === catFilter),
  )

  return (
    <>
      <main className="flex-1 overflow-y-auto p-4 pb-6">
        <div className="max-w-3xl mx-auto space-y-3">
          <div>
            <h1 className="text-white text-xl font-bold">项目</h1>
            <p className="text-white/50 text-xs mt-0.5">我做过的和收藏的优秀项目</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {typeFilters.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all border ${
                  typeFilter === t
                    ? 'bg-blue-500/85 text-white border-blue-400/50 shadow-md shadow-blue-500/20'
                    : 'text-white/60 hover:text-white border-white/15 bg-white/5 hover:bg-white/12'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex gap-1.5 flex-wrap">
            {catFilters.map((c) => (
              <button
                key={c}
                onClick={() => setCatFilter(c)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  catFilter === c
                    ? 'bg-white/20 text-white'
                    : 'text-white/45 hover:text-white/80 hover:bg-white/10'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
              >
                <ProjectCard project={project} onClick={() => setSelected(project)} />
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center text-white/40 py-12">该筛选条件下暂无项目</div>
          )}
        </div>
      </main>

      <ProjectDetailModal project={selected} onClose={() => setSelected(null)} />
    </>
  )
}

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import type { ProjectRow } from '@/lib/db/projects'

interface ProjectDetailModalProps {
  project: ProjectRow | null
  onClose: () => void
}

export function ProjectDetailModal({ project, onClose }: ProjectDetailModalProps) {
  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 遮罩 */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl p-6 shadow-2xl text-white"
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          >
            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-white/40 hover:text-white transition-colors text-lg leading-none"
            >
              ✕
            </button>

            {/* 标题 + 类型 */}
            <div className="flex items-start gap-3 mb-4 pr-6">
              <div>
                <h2 className="text-lg font-bold text-white">{project.title}</h2>
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  <Badge
                    className={
                      project.type === '我的项目'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/30 text-[10px]'
                        : 'bg-white/10 text-white/50 border-white/20 text-[10px]'
                    }
                  >
                    {project.type}
                  </Badge>
                  <Badge variant="outline" className="border-white/20 text-white/50 text-[10px]">
                    {project.category}
                  </Badge>
                  {project.isFeatured && (
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-[10px]">
                      精选
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* 简介 */}
            <p className="text-white/75 text-sm leading-relaxed mb-4">{project.description}</p>

            {/* 技术栈 */}
            <div className="mb-4">
              <p className="text-white/40 text-xs mb-2 font-medium">技术栈</p>
              <div className="flex flex-wrap gap-1.5">
                {project.techStack.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-md text-xs bg-blue-500/15 text-blue-200 border border-blue-500/20"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* 项目亮点 */}
            {project.highlights.length > 0 && (
              <div className="mb-5">
                <p className="text-white/40 text-xs mb-2 font-medium">项目亮点</p>
                <ul className="space-y-1.5">
                  {project.highlights.map((h) => (
                    <li key={h} className="text-white/70 text-sm flex gap-2">
                      <span className="text-blue-400 flex-shrink-0 mt-0.5">▸</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 链接区 */}
            <div className="flex gap-3 pt-4 border-t border-white/10">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 hover:text-white text-sm transition-colors"
                >
                  <GithubIcon className="h-4 w-4" />
                  GitHub
                </a>
              )}
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/70 hover:bg-blue-500 text-white text-sm transition-colors"
                >
                  ↗ 在线 Demo
                </a>
              )}
              {!project.githubUrl && !project.demoUrl && (
                <span className="text-white/30 text-xs">暂无外部链接</span>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

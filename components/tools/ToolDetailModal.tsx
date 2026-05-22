'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import type { ToolRow } from '@/lib/db/tools'

interface ToolDetailModalProps {
  tool: ToolRow | null
  onClose: () => void
}

const isDownload = (tool: ToolRow) => tool.type === '文件'

export function ToolDetailModal({ tool, onClose }: ToolDetailModalProps) {
  return (
    <AnimatePresence>
      {tool && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 遮罩 */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            className="relative w-full max-w-md rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl p-6 shadow-2xl text-white"
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          >
            {/* 关闭 */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-white/40 hover:text-white transition-colors text-lg leading-none"
            >
              ✕
            </button>

            {/* 标题 + 类型徽章 */}
            <div className="mb-4 pr-6">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border leading-none ${
                    isDownload(tool)
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  }`}
                >
                  {isDownload(tool) ? '↓ 下载' : '↗ 网页'}
                </span>
                <Badge variant="outline" className="border-white/20 text-white/50 text-[10px]">
                  {tool.category}
                </Badge>
                {tool.isRecommended && (
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-[10px]">
                    推荐
                  </Badge>
                )}
              </div>
              <h2 className="text-lg font-bold text-white">{tool.name}</h2>
            </div>

            {/* 简介 */}
            <p className="text-white/75 text-sm leading-relaxed mb-4">{tool.description}</p>

            {/* 标签 */}
            {tool.tags.length > 0 && (
              <div className="mb-5">
                <p className="text-white/40 text-xs mb-2 font-medium">标签</p>
                <div className="flex flex-wrap gap-1.5">
                  {tool.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md text-xs bg-white/10 text-white/60 border border-white/15"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="pt-4 border-t border-white/10">
              {(tool.url || tool.fileUrl) ? (
                <a
                  href={tool.url ?? tool.fileUrl ?? ''}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={isDownload(tool) || undefined}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isDownload(tool)
                      ? 'bg-amber-500/70 hover:bg-amber-500 text-white'
                      : 'bg-blue-500/70 hover:bg-blue-500 text-white'
                  }`}
                >
                  {isDownload(tool) ? '↓ 下载文件' : '↗ 打开网站'}
                </a>
              ) : (
                <span className="text-white/30 text-xs">暂无外部链接</span>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

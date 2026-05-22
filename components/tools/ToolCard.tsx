'use client'

import { useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { GlassPanel } from '@/components/layout/GlassPanel'
import { useAppStore } from '@/store'
import type { ToolRow } from '@/lib/db/tools'

interface ToolCardProps {
  tool: ToolRow
  onClick?: () => void
}

const isDownload = (tool: ToolRow) => tool.type === '文件'

export function ToolCard({ tool, onClick }: ToolCardProps) {
  const download = isDownload(tool)
  const href = tool.url || tool.fileUrl
  const setLive2dTriggerScene = useAppStore((s) => s.setLive2dTriggerScene)

  const handleHover = useCallback(() => {
    setLive2dTriggerScene('hover-tool')
  }, [setLive2dTriggerScene])

  return (
    <GlassPanel
      onClick={onClick}
      onMouseEnter={handleHover}
      className={`flex flex-col gap-2.5 p-4 transition-colors cursor-pointer ${
        download
          ? 'hover:bg-amber-500/10 border-amber-500/15'
          : 'hover:bg-white/15'
      }`}
    >
      {/* 标题行 */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* 类型图标徽章 */}
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border leading-none ${
              download
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
            }`}
          >
            {download ? '↓ 下载' : '↗ 网页'}
          </span>
          <h3 className="text-white font-semibold text-sm">{tool.name}</h3>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {tool.isRecommended && (
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-[10px]">
              推荐
            </Badge>
          )}
          <Badge variant="outline" className="border-white/20 text-white/50 text-[10px]">
            {tool.category}
          </Badge>
        </div>
      </div>

      {/* 简介 */}
      <p className="text-white/70 text-xs leading-relaxed line-clamp-3">{tool.description}</p>

      {/* 标签 */}
      <div className="flex flex-wrap gap-1">
        {tool.tags.map((t) => (
          <span
            key={t}
            className="px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-white/50 border border-white/10"
          >
            {t}
          </span>
        ))}
      </div>

      {/* CTA 按钮 */}
      {href && (
        <div className="mt-auto pt-2 border-t border-white/10">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            download={download || undefined}
            onClick={(e) => e.stopPropagation()}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              download
                ? 'bg-amber-500/70 hover:bg-amber-500 text-white'
                : 'bg-blue-500/70 hover:bg-blue-500 text-white'
            }`}
          >
            {download ? (
              <>
                <DownloadIcon className="h-3.5 w-3.5" />
                下载文件
              </>
            ) : (
              <>
                <ExternalIcon className="h-3.5 w-3.5" />
                打开网站
              </>
            )}
          </a>
        </div>
      )}
    </GlassPanel>
  )
}

function ExternalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
    </svg>
  )
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  )
}

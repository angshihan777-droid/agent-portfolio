'use client'

import { useState } from 'react'
import type { ChatLogRow } from '@/lib/db/chatLog'

const PAGE_SIZE = 20

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return '刚刚'
  if (min < 60) return `${min} 分钟前`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h} 小时前`
  const d = Math.floor(h / 24)
  return `${d} 天前`
}

export function VisitorsClient({ initialLogs }: { initialLogs: ChatLogRow[] }) {
  const [logs, setLogs] = useState<ChatLogRow[]>(initialLogs)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [clearing, setClearing] = useState(false)
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(logs.length / PAGE_SIZE))
  const pagedLogs = logs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function deleteOne(id: string) {
    await fetch(`/api/admin/chat-logs?id=${id}`, { method: 'DELETE' })
    setLogs((prev) => {
      const next = prev.filter((l) => l.id !== id)
      // 删除后如果当前页空了就回退一页
      const newTotalPages = Math.max(1, Math.ceil(next.length / PAGE_SIZE))
      if (page > newTotalPages) setPage(newTotalPages)
      return next
    })
  }

  async function clearAll() {
    if (!confirm('确认清空所有访客记录？此操作不可撤销。')) return
    setClearing(true)
    await fetch('/api/admin/chat-logs?all=true', { method: 'DELETE' })
    setLogs([])
    setPage(1)
    setClearing(false)
  }

  return (
    <div className="p-8 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">访客记录</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            共 {logs.length} 条记录
            {totalPages > 1 && `，第 ${page} / ${totalPages} 页`}
          </p>
        </div>
        {logs.length > 0 && (
          <button
            onClick={clearAll}
            disabled={clearing}
            className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm hover:bg-red-100 disabled:opacity-50 transition-colors"
          >
            {clearing ? '清空中…' : '清空全部'}
          </button>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">暂无访客记录</p>
          <p className="text-gray-300 text-xs mt-1">有人和 AI 秘书对话后，记录会显示在这里</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {pagedLogs.map((log) => {
              const isExpanded = expanded.has(log.id)
              return (
                <div
                  key={log.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  {/* 头部：IP / 地址 / 时间 / 操作 */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-sm">
                      📍
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-800 font-mono">
                          {log.ip || '未知 IP'}
                        </span>
                        {log.location && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {log.location}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {timeAgo(log.createdAt)} · {new Date(log.createdAt).toLocaleString('zh-CN')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleExpand(log.id)}
                        className="text-xs text-blue-500 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        {isExpanded ? '收起' : '查看对话'}
                      </button>
                      <button
                        onClick={() => deleteOne(log.id)}
                        className="text-xs text-gray-300 hover:text-red-500 transition-colors text-lg leading-none px-1"
                        title="删除"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  {/* 问题预览 */}
                  <div className="px-4 pb-3 border-t border-gray-50">
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      <span className="text-gray-400 text-xs mr-1">问：</span>
                      {log.question}
                    </p>
                  </div>

                  {/* 展开：完整问答 */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 space-y-3">
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">问题</p>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {log.question}
                        </p>
                      </div>
                      {log.answer && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">AI 回答</p>
                          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {log.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* 分页控制 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← 上一页
              </button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                  .reduce<(number | '...')[]>((acc, p, i, arr) => {
                    if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, i) =>
                    p === '...' ? (
                      <span key={`ellipsis-${i}`} className="px-2 py-1.5 text-sm text-gray-400">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          page === p
                            ? 'bg-blue-600 text-white font-medium'
                            : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                下一页 →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

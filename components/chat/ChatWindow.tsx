'use client'

import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store'
import { ChatMessage } from './ChatMessage'
import { SuggestedQuestions } from './SuggestedQuestions'
import { GlassPanel } from '@/components/layout/GlassPanel'

export function ChatWindow() {
  const { chatHistory, addMessage, updateMessage, setLive2dLine, agentName } = useAppStore()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingId, setStreamingId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, loading])

  async function send(question: string) {
    if (!question.trim() || loading) return
    const userMsg = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: question.trim(),
      timestamp: new Date(),
    }
    addMessage(userMsg)
    setInput('')
    setLoading(true)

    // 塞塞开始思考
    setLive2dLine('塞塞正在想呢... (｡•́︿•̀｡)')

    try {
      const history = chatHistory.map((m) => ({ role: m.role, content: m.content }))
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMsg.content, history, currentPage: '/' }),
      })

      if (!res.ok) {
        // 非 2xx 时尝试解析错误信息
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`)
      }

      // 响应成功：添加空白助手消息，流式填充内容
      const assistantId = (Date.now() + 1).toString()
      addMessage({
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      })
      setLive2dLine('')
      setLoading(false)       // 隐藏打点动画，流式内容开始出现
      setStreamingId(assistantId)

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        updateMessage(assistantId, accumulated)
      }
      // flush 最后一帧
      const tail = decoder.decode()
      if (tail) updateMessage(assistantId, accumulated + tail)
      setStreamingId(null)    // 流结束，移除光标
    } catch (err) {
      const msg = err instanceof Error ? err.message : '网络异常，请稍后重试。'
      setLive2dLine('哎呀，网络好像出问题了 (>_<)')
      setTimeout(() => setLive2dLine(''), 3000)
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: msg,
        timestamp: new Date(),
      })
    } finally {
      setLoading(false)
      setStreamingId(null)
    }
  }

  return (
    <GlassPanel variant="chat" className="flex flex-col h-full">
      {/* 标题栏 */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white font-medium text-sm">{agentName} · Ashia 的专属秘书</span>
          <div className="ml-auto text-right">
            <p className="text-white/40 text-xs">问我任何关于 Ashia 的问题 (◕‿◕✿)</p>
            <p className="text-white/22 text-[10px] mt-0.5 select-none">↺ 刷新页面可开启新对话</p>
          </div>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1 chat-scrollbar">
        {chatHistory.length === 0 && (
          <div className="flex items-center justify-center h-full text-white/50 text-sm">
            ↓ 选择下方推荐问题，或直接输入
          </div>
        )}
        {chatHistory.map((msg) => (
          <ChatMessage
            key={msg.id}
            role={msg.role}
            content={msg.content}
            isStreaming={msg.id === streamingId}
          />
        ))}
        {loading && (
          <div className="flex gap-2 mb-3">
            <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white/90">
              A
            </div>
            <div className="bg-white/10 rounded-2xl rounded-tl-sm px-4 py-2.5">
              <div className="flex gap-1 items-center h-5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-white/60"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 推荐问题（紧贴输入框上方） */}
      {chatHistory.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-3 pt-2 border-t border-white/10"
        >
          <p className="text-[11px] text-white/50 mb-1.5 px-1">推荐问题</p>
          <SuggestedQuestions onSelect={send} disabled={loading} />
        </motion.div>
      )}

      {/* 输入框 */}
      <div className="p-3 border-t border-white/10">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send(input)}
            placeholder="向 Agent 提问…"
            disabled={loading || !!streamingId}
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/55 focus:outline-none focus:border-blue-400/60 transition-colors disabled:opacity-50"
          />
          <button
            onClick={() => send(input)}
            disabled={loading || !!streamingId || !input.trim()}
            className="px-4 py-2 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed send-btn"
          >
            发送
          </button>
        </div>
      </div>
    </GlassPanel>
  )
}

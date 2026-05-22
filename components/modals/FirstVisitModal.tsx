'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store'

const STORAGE_KEY = 'self-blog-visited'

export interface WelcomeConfig {
  title: string
  intro: string
  btnChat: string
  btnLinks: { label: string; path: string }[]
}

export const DEFAULT_WELCOME: WelcomeConfig = {
  title: '欢迎来到 Ashia 的频道',
  intro: '专注 Agent 应用、RAG、工具调用和工作流自动化。欢迎通过 Agent 直接提问，或浏览项目和简历了解更多。',
  btnChat: '和 Agent 聊聊',
  btnLinks: [
    { label: '查看项目', path: '/projects' },
    { label: '查看简历', path: '/about' },
  ],
}

export function FirstVisitModal({ config }: { config?: WelcomeConfig }) {
  const [open, setOpen] = useState(false)
  const setFirstVisitDone = useAppStore((s) => s.setFirstVisitDone)
  const router = useRouter()

  const cfg = config ?? DEFAULT_WELCOME

  useEffect(() => {
    const visited = localStorage.getItem(STORAGE_KEY)
    if (!visited) setOpen(true)
  }, [])

  function close() {
    localStorage.setItem(STORAGE_KEY, '1')
    setFirstVisitDone()
    setOpen(false)
  }

  function go(path: string) {
    close()
    router.push(path)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 遮罩 */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />

          <motion.div
            className="relative w-full max-w-sm rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl p-6 shadow-2xl text-white"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <button
              onClick={close}
              className="absolute right-4 top-4 text-white/40 hover:text-white transition-colors"
            >
              ✕
            </button>

            {/* 欢迎标题 */}
            <h2 className="text-2xl font-bold mb-4 pr-6 leading-snug">{cfg.title}</h2>

            {/* 自我介绍 */}
            <p className="text-sm text-white/75 leading-relaxed mb-6">{cfg.intro}</p>

            {/* 按钮组 */}
            <div className="flex flex-col gap-2">
              <Button
                className="w-full bg-blue-500/80 hover:bg-blue-500 text-white border-0"
                onClick={() => go('/')}
              >
                {cfg.btnChat}
              </Button>
              {cfg.btnLinks.length > 0 && (
                <div className="flex gap-2">
                  {cfg.btnLinks.map((btn) => (
                    <Button
                      key={btn.path}
                      variant="outline"
                      className="flex-1 border-white/20 text-white/80 hover:bg-white/10 hover:text-white bg-transparent"
                      onClick={() => go(btn.path)}
                    >
                      {btn.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

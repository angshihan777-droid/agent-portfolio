'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface SpeechBubbleProps {
  text: string
}

export function SpeechBubble({ text }: SpeechBubbleProps) {
  return (
    <AnimatePresence>
      {text && (
        <motion.div
          key={text}
          initial={{ opacity: 0, y: 6, scale: 0.93 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          // 绝对定位：底部贴住容器顶部（即模型顶端），水平居中
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-max max-w-[200px] pointer-events-none"
        >
          <div className="relative rounded-2xl bg-white/90 backdrop-blur-sm px-3.5 py-2 text-xs text-gray-800 shadow-lg leading-relaxed text-center">
            {text}
            {/* 向下的小尾巴，水平居中 */}
            <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 h-2.5 w-2.5 bg-white/90 rotate-45 shadow-sm" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

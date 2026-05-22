'use client'

import { motion } from 'framer-motion'
import { useAppStore } from '@/store'

const DEFAULT_QUESTIONS = [
  'Ashia 是谁？',
  'Ashia 适合什么岗位？',
  'Ashia 做过哪些 Agent 项目？',
  'Ashia 的技术栈是什么？',
  '有哪些项目可以在线体验？',
  'Ashia 的简历在哪里？',
]

interface SuggestedQuestionsProps {
  onSelect: (q: string) => void
  disabled?: boolean
}

export function SuggestedQuestions({ onSelect, disabled }: SuggestedQuestionsProps) {
  const storeQuestions = useAppStore((s) => s.suggestedQuestions)
  const questions = storeQuestions.length > 0 ? storeQuestions : DEFAULT_QUESTIONS

  return (
    <div className="flex flex-wrap gap-2 p-3">
      {questions.map((q) => (
        <motion.button
          key={q}
          disabled={disabled}
          onClick={() => onSelect(q)}
          whileHover={disabled ? {} : { y: -2, boxShadow: '0 0 12px 2px rgba(96,165,250,0.35)' }}
          whileTap={disabled ? {} : { scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="text-xs px-3 py-1.5 rounded-full border border-white/30 bg-white/10 text-white/80 hover:bg-white/20 hover:text-white hover:border-blue-300/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {q}
        </motion.button>
      ))}
    </div>
  )
}

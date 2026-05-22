'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { ContactItem } from '@/data/about'
import { ContactIcon } from '@/components/ui/ContactIcon'

const btnCls =
  'flex items-center justify-center w-9 h-9 rounded-xl ' +
  'bg-white/10 backdrop-blur-sm border border-white/20 ' +
  'text-white/50 transition-all duration-200 ' +
  'hover:text-white hover:bg-white/20 hover:border-white/40'

function SideButton({ item, index }: { item: ContactItem; index: number }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    if (item.type !== 'copy') return
    await navigator.clipboard.writeText(item.value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const motionProps = {
    initial: { opacity: 0, x: 12 },
    animate: { opacity: 1, x: 0 },
    transition: { delay: 0.08 + index * 0.06, type: 'spring' as const, stiffness: 350, damping: 26 },
    whileHover: { scale: 1.1 },
    whileTap: { scale: 0.93 },
  }

  if (item.type === 'link') {
    return (
      <motion.a
        href={item.href}
        target={item.icon !== 'email' ? '_blank' : undefined}
        rel="noopener noreferrer"
        title={item.label}
        className={btnCls}
        {...motionProps}
      >
        <ContactIcon icon={item.icon} size="md" />
      </motion.a>
    )
  }

  return (
    <motion.button
      onClick={handleCopy}
      title={copied ? `${item.label}：已复制！` : item.label}
      className={btnCls + (copied ? ' !border-green-400/50 !text-green-300 !bg-green-500/15' : '')}
      {...motionProps}
    >
      {copied
        ? <span className="text-xs font-bold">✓</span>
        : <ContactIcon icon={item.icon} size="md" />}
    </motion.button>
  )
}

export function ContactSideBar({ contacts }: { contacts: ContactItem[] }) {
  if (!contacts?.length) return null
  return (
    <div className="flex flex-col gap-2">
      {contacts.map((item, i) => (
        <SideButton key={item.label} item={item} index={i} />
      ))}
    </div>
  )
}

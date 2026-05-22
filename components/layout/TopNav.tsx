'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store'

const navItems = [
  { href: '/', label: '主页', icon: ChatIcon },
  { href: '/projects', label: '项目', icon: CodeIcon },
  { href: '/tools', label: '工具', icon: WrenchIcon },
  { href: '/about', label: '有关', icon: PersonIcon },
]

export function TopNav() {
  const pathname = usePathname()
  const navOpacity = useAppStore((s) => s.navOpacity)

  // 模糊度随透明度联动
  const blurPx = Math.round((navOpacity / 80) * 12)

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 border-b border-white/10 transition-all duration-500"
      style={{
        backgroundColor: `rgba(0,0,0,${navOpacity / 100})`,
        backdropFilter: blurPx > 0 ? `blur(${blurPx}px)` : 'none',
        WebkitBackdropFilter: blurPx > 0 ? `blur(${blurPx}px)` : 'none',
      }}
    >
      <div className="relative mx-auto flex max-w-4xl items-center h-16 px-5">
        {/* 站点名/Logo — 最左侧固定 */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <span className="text-xl font-black bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent tracking-tight">
            Ashia
          </span>
          <span className="text-white/30 text-xs hidden sm:block">· My Channel</span>
        </Link>

        {/* 导航项 — 绝对居中 */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-medium transition-colors duration-150',
                  active ? 'text-white' : 'text-white/55 hover:text-white/85',
                )}
              >
                {active && (
                  <motion.div
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-full backdrop-blur-sm"
                    style={{
                      background: 'rgba(255,255,255,0.13)',
                      border: '1px solid rgba(255,255,255,0.28)',
                      boxShadow:
                        'inset 0 1px 0 rgba(255,255,255,0.35), 0 0 14px 3px rgba(96,165,250,0.22)',
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  />
                )}
                <Icon className="relative h-4 w-4" />
                <span className="relative">{label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )
}

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  )
}

function WrenchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function PersonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

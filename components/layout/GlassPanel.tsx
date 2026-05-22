'use client'

import { cn } from '@/lib/utils'
import { useAppStore } from '@/store'

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  /** 'chat' 使用聊天窗口独立透明度，默认使用面板透明度 */
  variant?: 'default' | 'chat'
}

export function GlassPanel({ children, className, style, variant = 'default', ...rest }: GlassPanelProps) {
  const panelOpacity = useAppStore((s) => s.panelOpacity)
  const chatOpacity = useAppStore((s) => s.chatOpacity)
  const opacity = variant === 'chat' ? chatOpacity : panelOpacity
  const bg = `rgba(255,255,255,${opacity / 100})`
  const border = `rgba(255,255,255,${Math.min((opacity * 2) / 100, 1)})`
  // 模糊度随透明度联动：0% → 无模糊（壁纸清晰可见），50% → 12px 满模糊
  const blurPx = Math.round((opacity / 50) * 12)

  return (
    <div
      className={cn(
        'rounded-2xl border shadow-lg transition-all duration-500',
        className,
      )}
      style={{
        backgroundColor: bg,
        borderColor: border,
        backdropFilter: blurPx > 0 ? `blur(${blurPx}px)` : 'none',
        WebkitBackdropFilter: blurPx > 0 ? `blur(${blurPx}px)` : 'none',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}

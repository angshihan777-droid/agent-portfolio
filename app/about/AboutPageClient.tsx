'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ContactItem } from '@/data/about'
import type { AboutData } from '@/lib/db/about'
import { GlassPanel } from '@/components/layout/GlassPanel'
import { Badge } from '@/components/ui/badge'
import { ContactIcon } from '@/components/ui/ContactIcon'

function ContactButton({ item }: { item: ContactItem }) {
  const [copied, setCopied] = useState(false)
  const copyValue = item.type === 'copy' ? item.value : ''

  if (item.type === 'link') {
    return (
      <a
        href={item.href}
        target={item.icon !== 'email' ? '_blank' : undefined}
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs bg-white/8 hover:bg-white/15 text-white/75 hover:text-white border border-white/10 transition-all w-full"
      >
        <ContactIcon icon={item.icon} />
        <span className="flex-1">{item.label}</span>
        <span className="text-white/35 text-[10px]">↗</span>
      </a>
    )
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(copyValue)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs bg-white/8 hover:bg-white/15 text-white/75 hover:text-white border border-white/10 transition-all w-full text-left"
    >
      <ContactIcon icon={item.icon} />
      <span className="flex-1">{item.label}</span>
      <span className="text-white/35 text-[10px] truncate max-w-[80px]">{copyValue}</span>
      <AnimatePresence>
        {copied && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 bg-green-500/90 text-white text-[10px] px-2 py-1 rounded-lg whitespace-nowrap pointer-events-none z-10"
          >
            已复制！
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}

export function AboutPageClient({ about, hasResume = false }: { about: AboutData; hasResume?: boolean }) {
  const avatarUrl = (about as any).avatarUrl as string | undefined

  return (
    <main className="flex-1 overflow-y-auto p-4 pb-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-4 items-start">

          {/* ── 主列 ── */}
          <div className="space-y-4 min-w-0">

            {/* 个人信息卡 */}
            <GlassPanel className="p-5">
              <div className="flex items-start gap-4">
                {/* 头像 */}
                <div className="flex-shrink-0 h-14 w-14 rounded-full overflow-hidden ring-2 ring-white/20 shadow-lg">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={about.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                      {about.name[0]}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h1 className="text-white text-lg font-bold">{about.name}</h1>
                  <p className="text-blue-300 text-xs mt-0.5">
                    {Array.isArray(about.jobDirection) ? about.jobDirection.join(' / ') : about.jobDirection}
                  </p>
                  <p className="text-white/65 text-sm mt-2.5 leading-relaxed">{about.summary}</p>
                </div>
              </div>
            </GlassPanel>

            {/* 技术栈 */}
            <GlassPanel className="p-5">
              <h2 className="text-white font-semibold text-sm mb-3">技术栈</h2>
              <div className="space-y-3">
                {about.techStack.map((group) => (
                  <div key={group.category}>
                    <p className="text-white/40 text-[11px] mb-1.5 font-medium tracking-wide">
                      {group.category}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {group.items.map((item) => (
                        <Badge
                          key={item}
                          variant="outline"
                          className="border-white/20 text-white/80 text-xs"
                        >
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </GlassPanel>

            {/* 工作经历 — 时间轴 */}
            <GlassPanel className="p-5">
              <h2 className="text-white font-semibold text-sm mb-5">工作经历</h2>
              <div>
                {about.workExperience.map((w, i) => {
                  const isLast = i === about.workExperience.length - 1
                  return (
                    <div key={w.company} className="flex items-stretch">
                      {/* 左：时间段 */}
                      <div className="w-28 flex-shrink-0 text-right pr-4 pt-0.5 pb-6">
                        <span className="text-white/45 text-[10px] leading-relaxed whitespace-pre-line">
                          {w.period.replace(' — ', '\n— ')}
                        </span>
                      </div>

                      {/* 中：节点 + 竖线 */}
                      <div className="flex flex-col items-center flex-shrink-0 w-5">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-400 ring-[3px] ring-blue-400/20 flex-shrink-0 mt-0.5" />
                        {!isLast && (
                          <div className="w-px flex-1 bg-white/15 mt-1.5" />
                        )}
                      </div>

                      {/* 右：内容 */}
                      <div className={`flex-1 pl-4 ${isLast ? 'pb-0' : 'pb-6'}`}>
                        <p className="text-white font-medium text-sm leading-snug">{w.company}</p>
                        <p className="text-blue-300 text-xs mt-0.5">{w.position}</p>
                        <ul className="mt-2 space-y-1">
                          {w.highlights.map((h) => (
                            <li key={h} className="text-white/60 text-xs flex gap-1.5">
                              <span className="text-blue-400 flex-shrink-0 mt-0.5">▸</span>
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )
                })}
              </div>
            </GlassPanel>

            {/* 教育经历 */}
            <GlassPanel className="p-5">
              <h2 className="text-white font-semibold text-sm mb-3">教育经历</h2>
              <div className="space-y-3">
                {about.education.map((e) => (
                  <div key={e.school} className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-white text-sm font-medium">{e.school}</p>
                      <p className="text-white/55 text-xs mt-0.5">{e.degree}</p>
                    </div>
                    <span className="text-white/40 text-xs flex-shrink-0 bg-white/5 px-2 py-0.5 rounded-full">
                      {e.period}
                    </span>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </div>

          {/* ── 右侧联系方式侧栏 ── */}
          <div className="space-y-3 lg:sticky lg:top-18">
            <GlassPanel className="p-4">
              <p className="text-white/40 text-[11px] font-medium mb-3 tracking-wide">联系方式</p>
              <div className="space-y-2">
                {about.contact.map((item) => (
                  <ContactButton key={item.label} item={item} />
                ))}
              </div>
            </GlassPanel>

            {hasResume ? (
              <a
                href="/uploads/resume/resume.pdf"
                download="resume.pdf"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-blue-500/80 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
              >
                ↓ 下载简历 PDF
              </a>
            ) : (
              <div className="flex items-center justify-center w-full px-4 py-2.5 rounded-xl bg-white/5 text-white/30 text-sm cursor-not-allowed">
                简历暂未上传
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  )
}


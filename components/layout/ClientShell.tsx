'use client'

import { usePathname } from 'next/navigation'
import { TopNav } from '@/components/layout/TopNav'
import { PageTransition } from '@/components/layout/PageTransition'

export function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  if (isAdmin) {
    // 后台页面：不需要顶部导航，直接全屏渲染
    return <>{children}</>
  }

  return (
    <>
      <TopNav />
      <div className="flex flex-col flex-1 min-h-0 pt-16">
        <PageTransition>
          {children}
        </PageTransition>
      </div>
    </>
  )
}

import { db } from '@/lib/db/client'
import Link from 'next/link'
import { DashboardClient } from './DashboardClient'
import type { ChartPoint, PeriodData } from './DashboardClient'

// ── 数据聚合工具 ───────────────────────────────────────────────────────────────

function buildHourly(dates: Date[], now: Date): PeriodData {
  const points: ChartPoint[] = []
  for (let i = 23; i >= 0; i--) {
    const start = new Date(now)
    start.setMinutes(0, 0, 0)
    start.setHours(start.getHours() - i)
    const end = new Date(start)
    end.setHours(end.getHours() + 1)
    const count = dates.filter((d) => d >= start && d < end).length
    points.push({ label: `${String(start.getHours()).padStart(2, '0')}:00`, count })
  }
  return { total: points.reduce((s, p) => s + p.count, 0), points }
}

function buildDaily(dates: Date[], days: number, now: Date): PeriodData {
  const points: ChartPoint[] = []
  for (let i = days - 1; i >= 0; i--) {
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)
    start.setDate(start.getDate() - i)
    const end = new Date(start)
    end.setDate(end.getDate() + 1)
    const count = dates.filter((d) => d >= start && d < end).length
    points.push({ label: `${start.getMonth() + 1}/${start.getDate()}`, count })
  }
  return { total: points.reduce((s, p) => s + p.count, 0), points }
}

function buildAllTime(dates: Date[]): PeriodData {
  if (dates.length === 0) return { total: 0, points: [] }
  const dayMap = new Map<string, number>()
  dates.forEach((d) => {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    dayMap.set(key, (dayMap.get(key) ?? 0) + 1)
  })
  const points = Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, count]) => {
      const [, m, day] = key.split('-')
      return { label: `${Number(m)}/${Number(day)}`, count }
    })
  return { total: dates.length, points }
}

// ── 页面 ───────────────────────────────────────────────────────────────────────

export default async function AdminDashboard() {
  const now = new Date()

  const [projectCount, toolCount, lineCount, rawViews] = await Promise.all([
    db.project.count(),
    db.tool.count(),
    db.live2DLine.count(),
    db.pageView.findMany({
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  const allDates = rawViews.map((v) => new Date(v.createdAt))
  const h24ago = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const h24 = buildHourly(allDates.filter((d) => d >= h24ago), now)
  const d7 = buildDaily(allDates, 7, now)
  const all = buildAllTime(allDates)

  const stats = [
    { label: '项目', count: projectCount, href: '/admin/projects' },
    { label: '工具', count: toolCount, href: '/admin/tools' },
    { label: 'Live2D 台词', count: lineCount, href: '/admin/live2d' },
  ]

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-semibold text-gray-800">仪表盘</h1>

      {/* 内容统计 */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{s.count}</p>
          </Link>
        ))}
      </div>

      {/* 访问统计折线图 */}
      <DashboardClient h24={h24} d7={d7} all={all} />
    </div>
  )
}

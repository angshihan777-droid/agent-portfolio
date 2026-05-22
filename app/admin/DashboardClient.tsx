'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export type ChartPoint = { label: string; count: number }
export type PeriodData = { total: number; points: ChartPoint[] }

type Period = '24h' | '7d' | 'all'

const PERIOD_LABELS: Record<Period, string> = {
  '24h': '24 小时',
  '7d': '7 天',
  all: '全部',
}

const PERIOD_DESC: Record<Period, string> = {
  '24h': '过去 24 小时访问量',
  '7d': '过去 7 天访问量',
  all: '全部时间访问量',
}

export function DashboardClient({
  h24,
  d7,
  all,
}: {
  h24: PeriodData
  d7: PeriodData
  all: PeriodData
}) {
  const [period, setPeriod] = useState<Period>('24h')

  const data = period === '24h' ? h24 : period === '7d' ? d7 : all
  const isEmpty = data.total === 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* 标题行 */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-medium text-gray-700 text-sm">访问统计</h2>
          <p className="text-4xl font-bold text-gray-900 mt-1 tabular-nums">{data.total}</p>
          <p className="text-xs text-gray-400 mt-1">{PERIOD_DESC[period]}</p>
        </div>

        {/* 时间段切换 */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(['24h', '7d', 'all'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                period === p
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* 图表区域 */}
      {isEmpty ? (
        <div className="h-[200px] flex items-center justify-center text-sm text-gray-400">
          暂无访问数据，访问前台页面后此处将显示趋势图
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={data.points}
            margin={{ top: 4, right: 8, left: -24, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              width={36}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
              labelStyle={{ color: '#374151', fontWeight: 600, marginBottom: 2 }}
              itemStyle={{ color: '#3b82f6' }}
              formatter={(value: number) => [value, '访问量']}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

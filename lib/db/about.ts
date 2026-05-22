import { db } from './client'
import type { about as AboutShape } from '@/data/about'

export type AboutData = typeof AboutShape

export async function getAbout(): Promise<AboutData | null> {
  const row = await db.about.findUnique({ where: { id: 'singleton' } })
  if (!row) return null
  const data = JSON.parse(row.data) as AboutData
  // 兼容旧版 string 格式（自动拆分为数组）
  if (typeof (data as any).jobDirection === 'string') {
    data.jobDirection = ((data as any).jobDirection as string)
      .split(/[/、,]/)
      .map((s: string) => s.trim())
      .filter(Boolean)
  }
  // 兼容旧版没有 avatarUrl 的数据
  if ((data as any).avatarUrl === undefined) {
    (data as any).avatarUrl = ''
  }
  return data
}

export async function upsertAbout(data: AboutData) {
  return db.about.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton', data: JSON.stringify(data) },
    update: { data: JSON.stringify(data) },
  })
}

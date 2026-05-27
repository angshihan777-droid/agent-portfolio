import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { live2dLines } from '@/data/live2d-lines'

/**
 * POST /api/admin/seed
 * 将 data/live2d-lines.ts 中的静态默认台词导入 DB。
 * - mode=append（默认）：仅在表为空时导入，有数据则跳过
 * - mode=replace：清空表后重新导入
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const mode = body.mode ?? 'append'

  const existing = await db.live2DLine.count()

  if (mode !== 'replace' && existing > 0) {
    return NextResponse.json(
      { skipped: true, message: `已有 ${existing} 条台词，使用 mode=replace 强制覆盖` },
      { status: 200 },
    )
  }

  if (mode === 'replace') {
    await db.live2DLine.deleteMany()
  }

  const data = live2dLines.map(({ text, scene, weight, enabled }) => ({
    text, scene, weight, enabled,
  }))

  await db.live2DLine.createMany({ data })

  return NextResponse.json({ inserted: data.length })
}

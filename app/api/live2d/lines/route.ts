import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'

/** 公开接口：前台 Live2DWidget 拉取启用的台词列表（无需鉴权） */
export async function GET() {
  try {
    const lines = await db.live2DLine.findMany({
      where:  { enabled: true },
      select: { id: true, text: true, scene: true, weight: true },
    })
    return NextResponse.json(lines)
  } catch {
    // DB 不可用时返回空数组，前台降级到静态台词
    return NextResponse.json([])
  }
}

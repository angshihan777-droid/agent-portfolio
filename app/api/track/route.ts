import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'

export async function POST(req: NextRequest) {
  try {
    const { page } = await req.json()
    if (!page || typeof page !== 'string') {
      return NextResponse.json({ error: 'invalid' }, { status: 400 })
    }
    await db.pageView.create({ data: { page } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getAbout, upsertAbout } from '@/lib/db/about'

export async function GET() {
  const about = await getAbout()
  return NextResponse.json(about)
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  await upsertAbout(body)
  return NextResponse.json({ ok: true })
}

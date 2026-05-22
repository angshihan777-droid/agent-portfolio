import { NextRequest, NextResponse } from 'next/server'
import { getLive2DConfig, setLive2DConfig } from '@/lib/db/live2d'

export async function GET() {
  const config = await getLive2DConfig()
  return NextResponse.json(config)
}

export async function PUT(req: NextRequest) {
  const { model, size } = await req.json()
  await setLive2DConfig(model, size)
  return NextResponse.json({ ok: true })
}

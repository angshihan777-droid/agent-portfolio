import { NextRequest, NextResponse } from 'next/server'
import { getLive2DLines, createLive2DLine } from '@/lib/db/live2d'

export async function GET() {
  const lines = await getLive2DLines()
  return NextResponse.json(lines)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const line = await createLive2DLine(body)
  return NextResponse.json(line, { status: 201 })
}

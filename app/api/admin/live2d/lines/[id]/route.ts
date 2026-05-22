import { NextRequest, NextResponse } from 'next/server'
import { updateLive2DLine, deleteLive2DLine } from '@/lib/db/live2d'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const line = await updateLive2DLine(id, body)
  return NextResponse.json(line)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await deleteLive2DLine(id)
  return NextResponse.json({ ok: true })
}

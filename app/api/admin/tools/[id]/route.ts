import { NextRequest, NextResponse } from 'next/server'
import { updateTool, deleteTool } from '@/lib/db/tools'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const tool = await updateTool(id, body)
  return NextResponse.json(tool)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await deleteTool(id)
  return NextResponse.json({ ok: true })
}

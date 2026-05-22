import { NextRequest, NextResponse } from 'next/server'
import { updateProject, deleteProject } from '@/lib/db/projects'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const project = await updateProject(id, body)
  return NextResponse.json(project)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await deleteProject(id)
  return NextResponse.json({ ok: true })
}

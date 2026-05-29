import { NextRequest, NextResponse } from 'next/server'
import { updateProject, deleteProject } from '@/lib/db/projects'
import { clearPromptCache } from '@/lib/agent/knowledge'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const project = await updateProject(id, body)
  clearPromptCache()
  return NextResponse.json(project)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await deleteProject(id)
  clearPromptCache()
  return NextResponse.json({ ok: true })
}

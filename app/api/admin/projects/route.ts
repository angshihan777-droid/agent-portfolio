import { NextRequest, NextResponse } from 'next/server'
import { getProjects, createProject } from '@/lib/db/projects'

export async function GET() {
  const projects = await getProjects()
  return NextResponse.json(projects)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const project = await createProject(body)
  return NextResponse.json(project, { status: 201 })
}

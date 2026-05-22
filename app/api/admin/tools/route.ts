import { NextRequest, NextResponse } from 'next/server'
import { getTools, createTool } from '@/lib/db/tools'

export async function GET() {
  const tools = await getTools()
  return NextResponse.json(tools)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const tool = await createTool(body)
  return NextResponse.json(tool, { status: 201 })
}

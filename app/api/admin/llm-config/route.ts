import { NextRequest, NextResponse } from 'next/server'
import { getConfig, setConfig } from '@/lib/db/config'

export async function GET() {
  const [configsJson, activeId] = await Promise.all([
    getConfig('llmConfigs'),
    getConfig('llmActiveId'),
  ])
  const configs = configsJson ? JSON.parse(configsJson) : []
  return NextResponse.json({ configs, activeId: activeId ?? '' })
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const updates: Promise<void>[] = []
  if (Array.isArray(body.configs)) {
    updates.push(setConfig('llmConfigs', JSON.stringify(body.configs)))
  }
  if (typeof body.activeId === 'string') {
    updates.push(setConfig('llmActiveId', body.activeId))
  }
  await Promise.all(updates)
  return NextResponse.json({ ok: true })
}

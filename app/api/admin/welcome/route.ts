import { NextRequest, NextResponse } from 'next/server'
import { getConfig, setConfig } from '@/lib/db/config'
import { DEFAULT_WELCOME } from '@/components/modals/FirstVisitModal'

export async function GET() {
  const raw = await getConfig('welcomeConfig')
  if (!raw) return NextResponse.json(DEFAULT_WELCOME)
  try {
    return NextResponse.json({ ...DEFAULT_WELCOME, ...JSON.parse(raw) })
  } catch {
    return NextResponse.json(DEFAULT_WELCOME)
  }
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  await setConfig('welcomeConfig', JSON.stringify(body))
  return NextResponse.json({ ok: true })
}

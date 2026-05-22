import { NextRequest, NextResponse } from 'next/server'
import { hashPassword, DEFAULT_PASSWORD_HASH } from '@/lib/auth'
import { getConfig, setConfig } from '@/lib/db/config'

async function verifyOld(input: string): Promise<boolean> {
  const stored = await getConfig('adminPasswordHash')
  if (stored) return hashPassword(input) === stored
  return hashPassword(input) === DEFAULT_PASSWORD_HASH
}

export async function PUT(req: NextRequest) {
  const { oldPassword, newPassword } = await req.json()

  if (!oldPassword || !newPassword) {
    return NextResponse.json({ error: '参数缺失' }, { status: 400 })
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ error: '新密码至少 6 位' }, { status: 400 })
  }
  if (!(await verifyOld(oldPassword))) {
    return NextResponse.json({ error: '旧密码错误' }, { status: 401 })
  }

  await setConfig('adminPasswordHash', hashPassword(newPassword))
  return NextResponse.json({ ok: true })
}

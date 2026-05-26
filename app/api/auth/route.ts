import { NextRequest, NextResponse } from 'next/server'
import { signAdminToken, hashPassword, DEFAULT_PASSWORD_HASH, COOKIE_NAME } from '@/lib/auth'
import { getConfig } from '@/lib/db/config'

async function verifyPassword(input: string): Promise<boolean> {
  const stored = await getConfig('adminPasswordHash')
  // 改过密码：对比 DB 中的哈希
  if (stored) return hashPassword(input) === stored
  // 优先使用环境变量 ADMIN_PASSWORD（docker-compose 注入）
  const envPassword = process.env.ADMIN_PASSWORD
  if (envPassword) return hashPassword(input) === hashPassword(envPassword)
  // 兜底：内置默认密码 admin123
  return hashPassword(input) === DEFAULT_PASSWORD_HASH
}

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  if (!password || !(await verifyPassword(password))) {
    return NextResponse.json({ error: '密码错误' }, { status: 401 })
  }

  const token = await signAdminToken()
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete(COOKIE_NAME)
  return res
}

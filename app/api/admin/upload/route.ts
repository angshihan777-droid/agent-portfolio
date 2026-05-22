import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { setConfig } from '@/lib/db/config'

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const file = form.get('file') as File | null
  const type = form.get('type') as string | null

  if (!file || !type) {
    return NextResponse.json({ error: '缺少 file 或 type 参数' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  let dir: string
  let filename: string

  if (type === 'wallpaper') {
    dir = path.join(process.cwd(), 'public', 'uploads', 'wallpapers')
    filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  } else if (type === 'resume') {
    dir = path.join(process.cwd(), 'public', 'uploads', 'resume')
    filename = 'resume.pdf'
  } else if (type === 'avatar') {
    dir = path.join(process.cwd(), 'public', 'uploads', 'avatars')
    const ext = file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'jpg'
    filename = `avatar-${Date.now()}.${ext}`
  } else {
    return NextResponse.json({ error: '不支持的文件类型' }, { status: 400 })
  }

  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, filename), buffer)

  const url =
    type === 'wallpaper'
      ? `/uploads/wallpapers/${filename}`
      : type === 'avatar'
      ? `/uploads/avatars/${filename}`
      : `/uploads/resume/${filename}`

  if (type === 'wallpaper') {
    await setConfig('wallpaper', url)
  }

  return NextResponse.json({ url })
}

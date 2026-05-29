import { NextRequest, NextResponse } from 'next/server'
import { getChatLogs, deleteChatLog, deleteAllChatLogs } from '@/lib/db/chatLog'

export async function GET() {
  const logs = await getChatLogs(500)
  return NextResponse.json({ logs })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const id = searchParams.get('id')
  const all = searchParams.get('all')

  if (all === 'true') {
    await deleteAllChatLogs()
    return NextResponse.json({ ok: true, deleted: 'all' })
  }
  if (id) {
    await deleteChatLog(id)
    return NextResponse.json({ ok: true, deleted: id })
  }
  return NextResponse.json({ error: '缺少 id 或 all 参数' }, { status: 400 })
}

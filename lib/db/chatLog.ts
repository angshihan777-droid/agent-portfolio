import { db } from './client'

export type ChatLogRow = {
  id: string
  ip: string
  location: string
  question: string
  answer: string
  createdAt: Date
}

/** 写入一条聊天记录（异步，失败静默） */
export async function createChatLog(
  data: Omit<ChatLogRow, 'id' | 'createdAt'>,
): Promise<void> {
  await db.chatLog.create({ data })
}

/** 按时间倒序读取最近 N 条 */
export async function getChatLogs(limit = 500): Promise<ChatLogRow[]> {
  return db.chatLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

/** 删除单条 */
export async function deleteChatLog(id: string): Promise<void> {
  await db.chatLog.delete({ where: { id } })
}

/** 清空全部 */
export async function deleteAllChatLogs(): Promise<void> {
  await db.chatLog.deleteMany()
}

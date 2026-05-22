import { db } from './client'

export type ToolRow = {
  id: string
  name: string
  category: string
  type: string
  description: string
  url: string | null
  fileUrl: string | null
  tags: string[]
  isRecommended: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

function deserialize(row: Awaited<ReturnType<typeof db.tool.findFirst>>): ToolRow | null {
  if (!row) return null
  return { ...row, tags: JSON.parse(row.tags) }
}

export async function getTools(): Promise<ToolRow[]> {
  const rows = await db.tool.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] })
  return rows.map((r) => deserialize(r)!)
}

export async function getToolById(id: string): Promise<ToolRow | null> {
  const row = await db.tool.findUnique({ where: { id } })
  return deserialize(row)
}

export async function createTool(data: Omit<ToolRow, 'id' | 'createdAt' | 'updatedAt'>) {
  return db.tool.create({
    data: { ...data, tags: JSON.stringify(data.tags) },
  })
}

export async function updateTool(id: string, data: Partial<Omit<ToolRow, 'id' | 'createdAt' | 'updatedAt'>>) {
  const payload: Record<string, unknown> = { ...data }
  if (data.tags) payload.tags = JSON.stringify(data.tags)
  return db.tool.update({ where: { id }, data: payload })
}

export async function deleteTool(id: string) {
  return db.tool.delete({ where: { id } })
}

import { db } from './client'

export type ProjectRow = {
  id: string
  title: string
  type: string
  category: string
  description: string
  techStack: string[]
  highlights: string[]
  githubUrl: string | null
  demoUrl: string | null
  coverUrl: string | null
  isFeatured: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

function deserialize(row: Awaited<ReturnType<typeof db.project.findFirst>>): ProjectRow | null {
  if (!row) return null
  return {
    ...row,
    techStack: JSON.parse(row.techStack),
    highlights: JSON.parse(row.highlights),
  }
}

export async function getProjects(): Promise<ProjectRow[]> {
  const rows = await db.project.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] })
  return rows.map((r) => deserialize(r)!)
}

export async function getProjectById(id: string): Promise<ProjectRow | null> {
  const row = await db.project.findUnique({ where: { id } })
  return deserialize(row)
}

export async function createProject(data: Omit<ProjectRow, 'id' | 'createdAt' | 'updatedAt'>) {
  return db.project.create({
    data: {
      ...data,
      techStack: JSON.stringify(data.techStack),
      highlights: JSON.stringify(data.highlights),
    },
  })
}

export async function updateProject(id: string, data: Partial<Omit<ProjectRow, 'id' | 'createdAt' | 'updatedAt'>>) {
  const payload: Record<string, unknown> = { ...data }
  if (data.techStack) payload.techStack = JSON.stringify(data.techStack)
  if (data.highlights) payload.highlights = JSON.stringify(data.highlights)
  return db.project.update({ where: { id }, data: payload })
}

export async function deleteProject(id: string) {
  return db.project.delete({ where: { id } })
}

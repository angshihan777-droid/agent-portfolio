import { db } from './client'

export async function getConfig(key: string): Promise<string | null> {
  const row = await db.siteConfig.findUnique({ where: { key } })
  return row?.value ?? null
}

export async function setConfig(key: string, value: string): Promise<void> {
  await db.siteConfig.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  })
}

export async function getAllConfigs(): Promise<Record<string, string>> {
  const rows = await db.siteConfig.findMany()
  return Object.fromEntries(rows.map((r) => [r.key, r.value]))
}

import { db } from './client'
import { getConfig, setConfig } from './config'
import type { Live2DModel } from '@/store'

export type Live2DLineRow = {
  id: string
  text: string
  scene: string
  weight: number
  enabled: boolean
}

export async function getLive2DLines(): Promise<Live2DLineRow[]> {
  return db.live2DLine.findMany()
}

export async function createLive2DLine(data: Omit<Live2DLineRow, 'id'>) {
  return db.live2DLine.create({ data })
}

export async function updateLive2DLine(id: string, data: Partial<Omit<Live2DLineRow, 'id'>>) {
  return db.live2DLine.update({ where: { id }, data })
}

export async function deleteLive2DLine(id: string) {
  return db.live2DLine.delete({ where: { id } })
}

export async function getLive2DConfig(): Promise<{ model: Live2DModel; size: number }> {
  const [model, size] = await Promise.all([getConfig('live2dModel'), getConfig('live2dSize')])
  return {
    model: (model as Live2DModel) ?? 'blanc',
    size: size ? parseInt(size) : 220,
  }
}

export async function setLive2DConfig(model: Live2DModel, size: number) {
  await Promise.all([setConfig('live2dModel', model), setConfig('live2dSize', String(size))])
}

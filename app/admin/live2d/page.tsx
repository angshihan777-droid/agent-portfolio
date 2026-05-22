import { getLive2DLines } from '@/lib/db/live2d'
import { Live2DLinesClient } from './Live2DLinesClient'

export default async function AdminLive2DPage() {
  const lines = await getLive2DLines()
  return <Live2DLinesClient lines={lines} />
}

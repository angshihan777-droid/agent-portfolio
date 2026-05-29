import { getChatLogs } from '@/lib/db/chatLog'
import { VisitorsClient } from './VisitorsClient'

export default async function VisitorsPage() {
  const logs = await getChatLogs(500)
  return <VisitorsClient initialLogs={logs} />
}

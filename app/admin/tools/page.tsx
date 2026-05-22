import { getTools } from '@/lib/db/tools'
import { ToolsClient } from './ToolsClient'

export default async function AdminToolsPage() {
  const tools = await getTools()
  return <ToolsClient initialTools={tools} />
}

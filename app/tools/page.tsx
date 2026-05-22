import { getTools } from '@/lib/db/tools'
import { ToolsPageClient } from './ToolsPageClient'

export default async function ToolsPage() {
  const tools = await getTools()
  return <ToolsPageClient tools={tools} />
}

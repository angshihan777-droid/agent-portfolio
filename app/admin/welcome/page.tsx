import { getConfig } from '@/lib/db/config'
import { DEFAULT_WELCOME } from '@/components/modals/FirstVisitModal'
import type { WelcomeConfig } from '@/components/modals/FirstVisitModal'
import { WelcomeClient } from './WelcomeClient'

export default async function AdminWelcomePage() {
  const raw = await getConfig('welcomeConfig')
  let config: WelcomeConfig = DEFAULT_WELCOME
  if (raw) {
    try { config = { ...DEFAULT_WELCOME, ...JSON.parse(raw) } } catch { /* ignore */ }
  }

  return <WelcomeClient initialConfig={config} />
}

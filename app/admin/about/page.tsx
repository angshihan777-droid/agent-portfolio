import { getAbout } from '@/lib/db/about'
import { AboutClient } from './AboutClient'

export default async function AdminAboutPage() {
  const about = await getAbout()
  return <AboutClient initialAbout={about} />
}

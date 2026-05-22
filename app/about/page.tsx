import { getAbout } from '@/lib/db/about'
import { AboutPageClient } from './AboutPageClient'
import { about as fallback } from '@/data/about'

export default async function AboutPage() {
  const data = await getAbout()
  return <AboutPageClient about={data ?? fallback} />
}

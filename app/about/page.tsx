import { access } from 'fs/promises'
import path from 'path'
import { getAbout } from '@/lib/db/about'
import { AboutPageClient } from './AboutPageClient'
import { about as fallback } from '@/data/about'

async function checkResumeExists(): Promise<boolean> {
  try {
    await access(path.join(process.cwd(), 'public', 'uploads', 'resume', 'resume.pdf'))
    return true
  } catch {
    return false
  }
}

export default async function AboutPage() {
  const [data, hasResume] = await Promise.all([
    getAbout(),
    checkResumeExists(),
  ])
  return <AboutPageClient about={data ?? fallback} hasResume={hasResume} />
}

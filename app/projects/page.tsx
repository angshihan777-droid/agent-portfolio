import { getProjects } from '@/lib/db/projects'
import { ProjectsPageClient } from './ProjectsPageClient'

export default async function ProjectsPage() {
  const projects = await getProjects()
  return <ProjectsPageClient projects={projects} />
}

import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getProject, canDeleteProject } from '@/app/actions/projects'
import { getUserData } from '@/lib/auth'
import { ProjectDetailClient } from './ProjectDetailClient'
import { CommentsSection } from './CommentsSection'

interface ProjectPageProps {
  params: Promise<{ id: string }>
}

// Loading skeleton for comments
function CommentsLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-6 w-32 bg-card-hover rounded" />
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="h-20 bg-card-hover rounded mb-3" />
        <div className="h-10 w-32 bg-card-hover rounded ml-auto" />
      </div>
    </div>
  )
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params

  // Parallel fetch: project data + user data (both cached)
  const [project, userData] = await Promise.all([
    getProject(id),
    getUserData()
  ])

  if (!project) {
    notFound()
  }

  const { user, isAdmin } = userData

  // Check delete permission
  const canDelete = user ? await canDeleteProject(id) : false

  return (
    <ProjectDetailClient
      project={project}
      isAdmin={isAdmin}
      isAuthenticated={!!user}
      canDelete={canDelete}
      userId={user?.id}
    >
      {/* Stream comments separately - they require auth check */}
      <Suspense fallback={<CommentsLoading />}>
        <CommentsSection projectId={id} isAuthenticated={!!user} userId={user?.id} isAdmin={isAdmin} />
      </Suspense>
    </ProjectDetailClient>
  )
}

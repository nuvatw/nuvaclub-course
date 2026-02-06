import { notFound, redirect } from 'next/navigation'
import { getIssueById, canEditIssue } from '@/app/actions/issues'
import { getUserData } from '@/lib/auth'
import { IssueDetail } from '@/components/issues'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const issue = await getIssueById(id)

  if (!issue) {
    return { title: '項目不存在' }
  }

  return {
    title: `${issue.title} | 開發區`,
    description: issue.why_background?.slice(0, 160) || '項目詳情',
  }
}

export default async function IssueDetailPage({ params }: PageProps) {
  const userData = await getUserData()

  // Require authentication
  if (!userData?.user) {
    redirect('/')
  }

  const { id } = await params
  const issue = await getIssueById(id)

  if (!issue) {
    notFound()
  }

  // Check if user can edit
  const canEdit = await canEditIssue(id)

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <IssueDetail issue={issue} canEdit={canEdit} />
      </div>
    </main>
  )
}

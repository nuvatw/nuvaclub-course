import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getIssueById, canEditIssue } from '@/app/actions/issues'
import { getUserData } from '@/lib/auth'
import { IssueForm } from '@/components/issues'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const issue = await getIssueById(id)

  if (!issue) {
    return { title: '問題不存在' }
  }

  return {
    title: `編輯: ${issue.title} | 問題`,
  }
}

export default async function EditIssuePage({ params }: PageProps) {
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

  if (!canEdit) {
    redirect(`/issues/${id}`)
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/issues/${id}`}
            className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-foreground"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            返回詳情
          </Link>
          <h1 className="text-3xl font-bold text-foreground">編輯問題</h1>
          <p className="mt-2 text-zinc-500">修改問題的內容和資訊</p>
        </div>

        {/* Form */}
        <div className="rounded-lg border border-zinc-800 bg-card p-6 md:p-8">
          <IssueForm mode="edit" issue={issue} />
        </div>
      </div>
    </main>
  )
}

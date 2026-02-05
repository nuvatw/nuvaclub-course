import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUserData } from '@/lib/auth'
import { IssueForm } from '@/components/issues'

export const metadata = {
  title: '建立問題 | nuvaClub',
  description: '建立新的問題追蹤單',
}

export default async function NewIssuePage() {
  const userData = await getUserData()

  // Require authentication
  if (!userData?.user) {
    redirect('/')
  }

  // Check if onboarding is completed
  if (userData?.profile && !userData.profile.onboarding_completed) {
    redirect('/onboarding')
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/issues"
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
            返回列表
          </Link>
          <h1 className="text-3xl font-bold text-foreground">建立問題單</h1>
          <p className="mt-2 text-zinc-500">
            填寫以下資訊來建立新的問題單。請盡量詳細描述問題或需求。
          </p>
        </div>

        {/* Form */}
        <div className="rounded-lg border border-zinc-800 bg-card p-6 md:p-8">
          <IssueForm mode="create" />
        </div>
      </div>
    </main>
  )
}

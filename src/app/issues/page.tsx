import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getIssues } from '@/app/actions/issues'
import { getUserData } from '@/lib/auth'
import { IssueList } from '@/components/issues'
import { IssuePageHeader } from '@/components/issues/IssuePageHeader'
interface PageProps {
  searchParams: Promise<{
    category?: string
    status?: string
    priority?: string
    search?: string
    page?: string
  }>
}

const VALID_CATEGORIES = ['fix', 'wish'] as const
const VALID_STATUSES = ['not_started', 'in_progress', 'done', 'cancelled'] as const
const VALID_PRIORITIES = ['low', 'medium', 'high'] as const

function isValidCsv(value: string | undefined, allowed: readonly string[]): boolean {
  if (!value) return true
  if (value === 'all') return true
  return value.split(',').every((s) => (allowed as readonly string[]).includes(s))
}

export const metadata = {
  title: '開發區 | nuvaClub',
  description: '內部開發追蹤系統',
}

export default async function IssuesPage({ searchParams }: PageProps) {
  const userData = await getUserData()

  // Require authentication
  if (!userData?.user) {
    redirect('/')
  }

  const params = await searchParams

  // Fetch issues with filters (validate params before using)
  const filters = {
    category: isValidCsv(params.category, VALID_CATEGORIES) ? params.category : 'all',
    status: isValidCsv(params.status, VALID_STATUSES) ? (params.status || 'not_started,in_progress') : 'not_started,in_progress',
    priority: isValidCsv(params.priority, VALID_PRIORITIES) ? params.priority : 'all',
    search: params.search,
    page: params.page ? parseInt(params.page) : 1,
  }

  const result = await getIssues(filters)

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <IssuePageHeader issues={result.issues} />

        {/* Issue List */}
        <Suspense
          fallback={
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-lg bg-zinc-800" />
              ))}
            </div>
          }
        >
          <IssueList
            issues={result.issues}
            total={result.total}
            page={result.page}
            totalPages={result.totalPages}
          />
        </Suspense>
      </div>
    </main>
  )
}

import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getIssues } from '@/app/actions/issues'
import { getUserData } from '@/lib/auth'
import { IssueList } from '@/components/issues'
import { Button } from '@/components/ui/Button'
import type { IssueCategory, IssueStatus, IssuePriority } from '@/types/issues'

interface PageProps {
  searchParams: Promise<{
    category?: string
    status?: string
    priority?: string
    search?: string
    page?: string
  }>
}

const VALID_CATEGORIES = ['all', 'fix', 'wish'] as const
const VALID_STATUSES = ['all', 'not_started', 'in_progress', 'done', 'cancelled'] as const
const VALID_PRIORITIES = ['all', 'low', 'medium', 'high'] as const

function isValidCategory(value: string | undefined): value is IssueCategory | 'all' {
  return value === undefined || VALID_CATEGORIES.includes(value as typeof VALID_CATEGORIES[number])
}

function isValidStatus(value: string | undefined): value is IssueStatus | 'all' {
  return value === undefined || VALID_STATUSES.includes(value as typeof VALID_STATUSES[number])
}

function isValidPriority(value: string | undefined): value is IssuePriority | 'all' {
  return value === undefined || VALID_PRIORITIES.includes(value as typeof VALID_PRIORITIES[number])
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
    category: isValidCategory(params.category) ? params.category : 'all',
    status: isValidStatus(params.status) ? params.status : 'all',
    priority: isValidPriority(params.priority) ? params.priority : 'all',
    search: params.search,
    page: params.page ? parseInt(params.page) : 1,
  }

  const result = await getIssues(filters)

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">開發區</h1>
            <p className="mt-1 text-zinc-500">內部開發追蹤系統</p>
          </div>
          <Link href="/issues/new">
            <Button>
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              建立項目
            </Button>
          </Link>
        </div>

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

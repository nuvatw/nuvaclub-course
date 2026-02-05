import { Skeleton } from '@/components/ui/Skeleton'

export default function IssuesLoading() {
  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header skeleton */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Skeleton className="h-9 w-32" />
            <Skeleton className="mt-2 h-5 w-48" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>

        {/* Search and filters skeleton */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-20" />
          </div>
          <div className="flex flex-wrap gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-8 w-24" />
            ))}
          </div>
        </div>

        {/* Results count skeleton */}
        <Skeleton className="mb-6 h-5 w-32" />

        {/* Issue cards skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-lg border border-zinc-800 bg-card p-4">
              <div className="mb-3 flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-12" />
              </div>
              <Skeleton className="mb-2 h-6 w-full" />
              <Skeleton className="mb-3 h-4 w-3/4" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

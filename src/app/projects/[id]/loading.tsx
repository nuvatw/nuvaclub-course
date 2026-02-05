import { Skeleton, StepListSkeleton, StepDetailSkeleton, CommentsSkeleton } from '@/components/ui/Skeleton'

export default function ProjectLoading() {
  return (
    <div className="min-h-screen">
      {/* Header Skeleton */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="skeleton h-4 w-28 rounded mb-2" />
          <div className="skeleton h-8 w-72 rounded mb-2" />
          <div className="skeleton h-4 w-96 rounded mb-4" />

          {/* Progress bar skeleton - 20 steps */}
          <div className="max-w-xl">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="flex items-center flex-1">
                  <div className="skeleton w-1.5 h-1.5 rounded-full" />
                  {i < 19 && <div className="skeleton h-0.5 flex-1" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Skeleton */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="bg-card rounded-lg border border-border p-4 sticky top-4">
              <Skeleton className="h-6 w-36 mb-4" />
              <StepListSkeleton />
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-8">
            {/* Step Detail */}
            <div className="bg-card rounded-lg border border-border p-6">
              <StepDetailSkeleton />
            </div>

            {/* Comments */}
            <CommentsSkeleton />
          </div>
        </div>
      </div>
    </div>
  )
}

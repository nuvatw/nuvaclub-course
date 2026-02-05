interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`skeleton rounded ${className}`} />
}

export function SkeletonText({ lines = 1, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  )
}

export function ProjectCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      {/* Header Row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Skeleton className="h-7 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-12" />
          </div>
          <div className="text-right">
            <Skeleton className="h-8 w-20 mb-1" />
            <Skeleton className="h-3 w-10" />
          </div>
          <div className="text-right">
            <Skeleton className="h-8 w-14 mb-1" />
            <Skeleton className="h-3 w-10" />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <Skeleton className="h-2 w-full rounded-full mb-6" />

      {/* 20 Steps Timeline */}
      <div className="flex items-center gap-1">
        {Array.from({ length: 20 }).map((_, i) => (
          <Skeleton key={i} className="flex-1 h-8 rounded" />
        ))}
      </div>

      {/* Current Step */}
      <div className="mt-4 flex items-center gap-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-24 rounded" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  )
}

export function ProjectListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function StepListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
          <Skeleton className="w-6 h-6 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function StepDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>

      {/* Action button */}
      <Skeleton className="h-10 w-32" />

      {/* Links section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-card-hover rounded-lg p-4">
              <Skeleton className="h-5 w-1/2 mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function CommentsSkeleton() {
  return (
    <div className="space-y-4">
      {/* Comment form */}
      <div className="bg-card rounded-lg border border-border p-4">
        <Skeleton className="h-6 w-24 mb-3" />
        <Skeleton className="h-20 w-full mb-3" />
        <div className="flex justify-end">
          <Skeleton className="h-9 w-28" />
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
            <SkeletonText lines={2} />
          </div>
        ))}
      </div>
    </div>
  )
}

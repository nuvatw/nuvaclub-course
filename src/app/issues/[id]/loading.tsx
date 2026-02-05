import { Skeleton } from '@/components/ui/Skeleton'

export default function IssueDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* 返回按鈕 */}
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="h-5 w-20" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-9 w-16" />
        </div>
      </div>

      {/* 標題 */}
      <Skeleton className="h-8 w-3/4 mb-4" />

      {/* 狀態列 */}
      <div className="flex gap-4 mb-6">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-7 w-32" />
      </div>

      {/* Meta info */}
      <div className="flex gap-4 mb-8 pb-8 border-b border-zinc-800">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-40" />
      </div>

      {/* Content sections */}
      <div className="space-y-6">
        {/* 背景說明 */}
        <div className="rounded-lg border border-zinc-800 bg-card p-6">
          <Skeleton className="h-4 w-24 mb-3" />
          <Skeleton className="h-24 w-full" />
        </div>

        {/* 目前行為 / 預期行為 */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-zinc-800 bg-card p-6">
            <Skeleton className="h-4 w-20 mb-3" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="rounded-lg border border-zinc-800 bg-card p-6">
            <Skeleton className="h-4 w-20 mb-3" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>

        {/* 驗收條件 */}
        <div className="rounded-lg border border-zinc-800 bg-card p-6">
          <Skeleton className="h-4 w-24 mb-3" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </div>
  )
}

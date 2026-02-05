import { Skeleton } from '@/components/ui/Skeleton'

export default function NewIssueLoading() {
  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="h-5 w-20 mb-4" />
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-80" />
        </div>

        {/* Form */}
        <div className="rounded-lg border border-zinc-800 bg-card p-6 md:p-8 space-y-8">
          {/* 標題 */}
          <div>
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-12 w-full" />
          </div>

          {/* 優先度 */}
          <div>
            <Skeleton className="h-4 w-20 mb-3" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>

          {/* 背景說明 */}
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-32 w-full" />
          </div>

          {/* 目前行為 / 預期行為 */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>

          {/* 驗收條件 */}
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-32 w-full" />
          </div>

          {/* 圖片 */}
          <div>
            <Skeleton className="h-4 w-20 mb-3" />
            <Skeleton className="h-40 w-full" />
          </div>

          {/* 按鈕 */}
          <div className="flex justify-end gap-3 pt-6 border-t border-zinc-800">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
      </div>
    </main>
  )
}

import { Skeleton } from '@/components/ui/Skeleton'

export default function NewProjectLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <Skeleton className="h-7 w-32 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* 課程標題 */}
          <div>
            <Skeleton className="h-4 w-20 mb-1.5" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* 描述 */}
          <div>
            <Skeleton className="h-4 w-28 mb-1.5" />
            <Skeleton className="h-24 w-full" />
          </div>

          {/* 上線日期 */}
          <div>
            <Skeleton className="h-4 w-40 mb-1.5" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* 按鈕 */}
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </div>
      </div>
    </div>
  )
}

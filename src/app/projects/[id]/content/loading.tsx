export default function ContentLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar skeleton */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="h-4 w-20 bg-card-hover rounded skeleton" />
        <div className="h-4 w-40 bg-card-hover rounded skeleton" />
      </div>

      {/* Mind map skeleton */}
      <div className="bg-card border-b border-border h-[340px] skeleton" />

      {/* Main layout skeleton */}
      <div className="flex flex-1">
        {/* Sidebar skeleton */}
        <div className="w-[260px] flex-shrink-0 border-r border-border bg-card p-3 space-y-3">
          <div className="h-8 bg-card-hover rounded skeleton" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-6 bg-card-hover rounded skeleton" />
              <div className="ml-4 space-y-1.5">
                <div className="h-4 w-3/4 bg-card-hover rounded skeleton" />
                <div className="h-4 w-2/3 bg-card-hover rounded skeleton" />
              </div>
            </div>
          ))}
        </div>

        {/* Content skeleton */}
        <div className="flex-1 p-8 max-w-4xl mx-auto space-y-4">
          <div className="h-4 w-64 bg-card-hover rounded skeleton" />
          <div className="h-8 w-96 bg-card-hover rounded skeleton" />
          <div className="h-4 w-full bg-card-hover rounded skeleton" />
          <div className="h-4 w-5/6 bg-card-hover rounded skeleton" />
          <div className="h-4 w-4/5 bg-card-hover rounded skeleton" />
          <div className="h-32 bg-card-hover rounded skeleton mt-6" />
          <div className="h-4 w-full bg-card-hover rounded skeleton" />
          <div className="h-4 w-3/4 bg-card-hover rounded skeleton" />
        </div>
      </div>
    </div>
  )
}

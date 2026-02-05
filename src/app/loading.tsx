import { ProjectListSkeleton } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="min-h-screen">
      {/* Hero Skeleton */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="skeleton h-12 w-96 mx-auto rounded-lg mb-6" />
          <div className="skeleton h-6 w-80 mx-auto rounded mb-2" />
          <div className="skeleton h-6 w-64 mx-auto rounded mb-10" />
          <div className="flex items-center justify-center gap-4">
            <div className="skeleton h-12 w-40 rounded-lg" />
            <div className="skeleton h-12 w-36 rounded-lg" />
          </div>
        </div>
      </section>

      {/* Projects Skeleton */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="skeleton h-8 w-32 rounded mb-8" />
          <ProjectListSkeleton count={3} />
        </div>
      </section>
    </div>
  )
}

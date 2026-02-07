'use client'

import Link from 'next/link'

interface ContentBreadcrumbProps {
  projectId: string
  projectTitle: string
  chapterTitle: string
  sectionTitle: string
}

export function ContentBreadcrumb({
  projectId,
  projectTitle,
  chapterTitle,
  sectionTitle,
}: ContentBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted mb-6" aria-label="Breadcrumb">
      <Link
        href={`/projects/${projectId}`}
        className="hover:text-foreground transition-colors"
      >
        {projectTitle}
      </Link>
      <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
      <span className="text-muted">{chapterTitle}</span>
      <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
      <span className="text-foreground font-medium">{sectionTitle}</span>
    </nav>
  )
}

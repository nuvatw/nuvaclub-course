'use client'

import Link from 'next/link'
import { ContentSidebar } from '@/components/content/ContentSidebar'
import { ContentBreadcrumb } from '@/components/content/ContentBreadcrumb'
import { MarkdownRenderer } from '@/components/content/MarkdownRenderer'
import type { Chapter } from '@/content/course/_config'

interface AdjacentSection {
  id: string
  title: string
  chapterDir: string
  chapterTitle: string
}

interface ContentViewerProps {
  projectId: string
  projectTitle: string
  toc: Chapter[]
  currentChapter: string
  currentSection: string
  chapterTitle: string
  sectionTitle: string
  markdownContent: string
  prev: AdjacentSection | null
  next: AdjacentSection | null
}

export function ContentViewer({
  projectId,
  projectTitle,
  toc,
  currentChapter,
  currentSection,
  chapterTitle,
  sectionTitle,
  markdownContent,
  prev,
  next,
}: ContentViewerProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <Link
          href={`/projects/${projectId}`}
          className="text-sm text-muted hover:text-foreground transition-colors inline-flex items-center gap-1 group"
        >
          <svg
            className="w-4 h-4 transition-transform group-hover:-translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回課程
        </Link>
        <span className="text-sm text-muted">
          {sectionTitle}
        </span>
      </div>

      {/* Main layout: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        <ContentSidebar
          toc={toc}
          projectId={projectId}
          currentChapter={currentChapter}
          currentSection={currentSection}
        />

        {/* Content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-8 py-6">
            <ContentBreadcrumb
              projectId={projectId}
              projectTitle={projectTitle}
              chapterTitle={chapterTitle}
              sectionTitle={sectionTitle}
            />

            <MarkdownRenderer content={markdownContent} />

            {/* Prev / Next navigation */}
            <div className="mt-12 pt-6 border-t border-border flex items-center justify-between">
              {prev ? (
                <Link
                  href={`/projects/${projectId}/content?ch=${prev.chapterDir}&s=${prev.id}`}
                  className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors group"
                >
                  <svg
                    className="w-4 h-4 transition-transform group-hover:-translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <div>
                    <div className="text-xs text-muted/60">上一節</div>
                    <div>{prev.id} {prev.title}</div>
                  </div>
                </Link>
              ) : (
                <div />
              )}
              {next ? (
                <Link
                  href={`/projects/${projectId}/content?ch=${next.chapterDir}&s=${next.id}`}
                  className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors group text-right"
                >
                  <div>
                    <div className="text-xs text-muted/60">下一節</div>
                    <div>{next.id} {next.title}</div>
                  </div>
                  <svg
                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

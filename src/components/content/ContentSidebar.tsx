'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import type { Chapter } from '@/content/course/_config'

interface ContentSidebarProps {
  toc: Chapter[]
  projectId: string
  currentChapter: string
  currentSection: string
}

export function ContentSidebar({
  toc,
  projectId,
  currentChapter,
  currentSection,
}: ContentSidebarProps) {
  const [query, setQuery] = useState('')
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(() => {
    return new Set([currentChapter])
  })

  const filteredToc = useMemo(() => {
    if (!query.trim()) return toc
    const lower = query.toLowerCase()
    return toc
      .map((chapter) => ({
        ...chapter,
        sections: chapter.sections.filter(
          (s) =>
            s.title.toLowerCase().includes(lower) ||
            s.id.toLowerCase().includes(lower) ||
            chapter.title.toLowerCase().includes(lower)
        ),
      }))
      .filter((chapter) => chapter.sections.length > 0)
  }, [toc, query])

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev)
      if (next.has(chapterId)) {
        next.delete(chapterId)
      } else {
        next.add(chapterId)
      }
      return next
    })
  }

  const isSearching = query.trim().length > 0

  return (
    <aside className="w-[260px] flex-shrink-0 border-r border-border bg-card flex flex-col h-full overflow-hidden">
      {/* Search */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="搜尋章節..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-background border border-border rounded-md text-sm text-foreground placeholder-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* TOC */}
      <nav className="flex-1 overflow-y-auto p-2">
        {filteredToc.map((chapter) => {
          const isExpanded = isSearching || expandedChapters.has(chapter.id)
          const isActiveChapter = chapter.id === currentChapter

          return (
            <div key={chapter.id} className="mb-1">
              {/* Chapter header */}
              <button
                onClick={() => toggleChapter(chapter.id)}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActiveChapter
                    ? 'text-foreground bg-card-hover'
                    : 'text-muted hover:text-foreground hover:bg-card-hover/50'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: chapter.color }}
                />
                <span className="flex-1 text-left truncate">
                  Ch{chapter.number} {chapter.title}
                </span>
                <svg
                  className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${
                    isExpanded ? 'rotate-90' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              {/* Sections */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-3 border-l border-border/50 pl-2 py-1">
                      {chapter.sections.map((section) => {
                        const isActive =
                          chapter.id === currentChapter &&
                          section.id === currentSection

                        return (
                          <Link
                            key={section.id}
                            href={`/projects/${projectId}/content?ch=${chapter.id}&s=${section.id}`}
                            scroll={false}
                            className={`block px-2 py-1.5 rounded text-sm transition-colors ${
                              isActive
                                ? 'text-primary bg-primary/10 font-medium border-l-2 border-primary -ml-[2px] pl-[10px]'
                                : 'text-muted hover:text-foreground hover:bg-card-hover/30'
                            }`}
                          >
                            <span className="text-xs text-muted/70 mr-1.5">{section.id}</span>
                            {section.title}
                          </Link>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </nav>
    </aside>
  )
}

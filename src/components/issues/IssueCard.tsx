'use client'

import { memo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { StatusTrackMiniInteractive, PriorityDot, CategoryBadge } from './StatusBadge'
import type { IssueWithCreator } from '@/types/issues'
import { formatDate } from '@/lib/utils'

interface IssueCardProps {
  issue: IssueWithCreator
  index?: number
}

export const IssueCard = memo(function IssueCard({ issue, index = 0 }: IssueCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Link
        href={`/issues/${issue.id}`}
        className="group flex items-center gap-4 p-4 rounded-lg border border-zinc-800 bg-card hover:border-zinc-700 hover:bg-card-hover transition-all"
      >
        {/* Priority Dot */}
        <PriorityDot priority={issue.priority} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
            <span className="text-zinc-500 font-normal">#{issue.issue_number}</span>{' '}
            {issue.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <CategoryBadge category={issue.category} />
            <span className="text-xs text-zinc-500">
              {issue.creator?.full_name || issue.creator?.email?.split('@')[0] || '未知'} · {formatDate(issue.updated_at)}
            </span>
          </div>
        </div>

        {/* Status - interactive, click to change */}
        <StatusTrackMiniInteractive issueId={issue.id} status={issue.status} />

        {/* Arrow */}
        <svg
          className="w-4 h-4 text-zinc-600 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </motion.div>
  )
})

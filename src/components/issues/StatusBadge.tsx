'use client'

import { motion } from 'framer-motion'
import {
  type IssueCategory,
  type IssueStatus,
  type IssuePriority,
  ISSUE_CATEGORY_LABELS,
  ISSUE_CATEGORY_COLORS,
  ISSUE_STATUS_LABELS,
  ISSUE_STATUS_COLORS,
  ISSUE_PRIORITY_LABELS,
  ISSUE_PRIORITY_COLORS,
} from '@/types/issues'

interface StatusBadgeProps {
  status: IssueStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const label = ISSUE_STATUS_LABELS[status]
  const colorClass = ISSUE_STATUS_COLORS[status]

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${colorClass}`}>
      {label.zh}
    </span>
  )
}

// Status order for the track (excluding cancelled)
const STATUS_TRACK_ORDER: IssueStatus[] = ['not_started', 'in_progress', 'done']

interface StatusTrackProps {
  status: IssueStatus
  onChange?: (status: IssueStatus) => void
  disabled?: boolean
  size?: 'sm' | 'md'
}

export function StatusTrack({ status, onChange, disabled = false, size = 'md' }: StatusTrackProps) {
  const currentIndex = STATUS_TRACK_ORDER.indexOf(status)
  const isCancelled = status === 'cancelled'

  const handleClick = (newStatus: IssueStatus) => {
    if (!disabled && onChange && newStatus !== status) {
      onChange(newStatus)
    }
  }

  const sizeClasses = {
    sm: {
      container: 'h-8',
      button: 'px-2 text-xs',
      indicator: 'h-1',
    },
    md: {
      container: 'h-10',
      button: 'px-4 text-sm',
      indicator: 'h-1.5',
    },
  }

  const styles = sizeClasses[size]

  return (
    <div className="flex flex-col gap-2">
      {/* Main track */}
      <div className={`relative flex items-center bg-zinc-800 rounded-lg overflow-hidden ${styles.container}`}>
        {/* Animated background indicator */}
        {!isCancelled && currentIndex >= 0 && (
          <motion.div
            layoutId="status-indicator"
            className="absolute inset-y-0 bg-gradient-to-r from-primary to-blue-500 rounded-lg"
            initial={false}
            animate={{
              left: `${(currentIndex / STATUS_TRACK_ORDER.length) * 100}%`,
              width: `${100 / STATUS_TRACK_ORDER.length}%`,
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          />
        )}

        {/* Status buttons */}
        {STATUS_TRACK_ORDER.map((s, index) => {
          const isActive = s === status
          const isPast = currentIndex > index && !isCancelled
          const label = ISSUE_STATUS_LABELS[s]

          return (
            <button
              key={s}
              type="button"
              onClick={() => handleClick(s)}
              disabled={disabled}
              className={`
                relative flex-1 flex items-center justify-center font-medium transition-colors z-10
                ${styles.button}
                ${isActive ? 'text-white' : isPast ? 'text-zinc-400' : 'text-zinc-500'}
                ${!disabled && !isActive ? 'hover:text-zinc-300 cursor-pointer' : ''}
                ${disabled ? 'cursor-not-allowed' : ''}
              `}
            >
              {label.zh}
            </button>
          )
        })}
      </div>

      {/* Progress bar underneath */}
      <div className={`relative w-full bg-zinc-700 rounded-full overflow-hidden ${styles.indicator}`}>
        {!isCancelled && (
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-blue-500 rounded-full"
            initial={false}
            animate={{
              width: `${((currentIndex + 1) / STATUS_TRACK_ORDER.length) * 100}%`,
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          />
        )}
      </div>

      {/* Cancelled option - separate */}
      {(isCancelled || onChange) && (
        <button
          type="button"
          onClick={() => handleClick('cancelled')}
          disabled={disabled}
          className={`
            self-start flex items-center gap-1.5 px-3 py-1 rounded-md text-xs transition-colors
            ${isCancelled ? 'bg-zinc-600 text-white' : 'text-zinc-500 hover:text-zinc-400 hover:bg-zinc-800'}
            ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          `}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          {ISSUE_STATUS_LABELS.cancelled.zh}
        </button>
      )}
    </div>
  )
}

// Mini version for cards
interface StatusTrackMiniProps {
  status: IssueStatus
}

export function StatusTrackMini({ status }: StatusTrackMiniProps) {
  const currentIndex = STATUS_TRACK_ORDER.indexOf(status)
  const isCancelled = status === 'cancelled'

  if (isCancelled) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-6 h-1.5 rounded-full bg-zinc-600" />
          ))}
        </div>
        <span className="text-xs text-zinc-500">撤銷</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {STATUS_TRACK_ORDER.map((_, index) => (
          <div
            key={index}
            className={`w-6 h-1.5 rounded-full transition-colors ${
              index <= currentIndex ? 'bg-primary' : 'bg-zinc-700'
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-zinc-400">{ISSUE_STATUS_LABELS[status].zh}</span>
    </div>
  )
}

interface PriorityDotProps {
  priority: IssuePriority
  showLabel?: boolean
}

export function PriorityDot({ priority, showLabel = false }: PriorityDotProps) {
  const colorClass = ISSUE_PRIORITY_COLORS[priority]
  const label = ISSUE_PRIORITY_LABELS[priority]

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-2.5 h-2.5 rounded-full ${colorClass}`} />
      {showLabel && <span className="text-sm text-zinc-400">{label.zh}</span>}
    </span>
  )
}

interface PrioritySelectorProps {
  priority: IssuePriority
  onChange: (priority: IssuePriority) => void
  disabled?: boolean
}

export function PrioritySelector({ priority, onChange, disabled = false }: PrioritySelectorProps) {
  const priorities: IssuePriority[] = ['high', 'medium', 'low']

  return (
    <div className="inline-flex items-center gap-3">
      {priorities.map((p) => {
        const colorClass = ISSUE_PRIORITY_COLORS[p]
        const label = ISSUE_PRIORITY_LABELS[p]
        const isSelected = priority === p

        return (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            disabled={disabled}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              isSelected
                ? 'bg-zinc-700 text-foreground'
                : 'text-zinc-500 hover:text-foreground hover:bg-zinc-800'
            } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${colorClass}`} />
            <span className="text-sm">{label.zh}</span>
          </button>
        )
      })}
    </div>
  )
}

// Category Badge (for display in cards and detail)
interface CategoryBadgeProps {
  category: IssueCategory
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const label = ISSUE_CATEGORY_LABELS[category]
  const colorClass = ISSUE_CATEGORY_COLORS[category]

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}>
      {category === 'fix' ? '\u{1F527}' : '\u{2728}'} {label.zh}
    </span>
  )
}

// Category Selector (for forms)
interface CategorySelectorProps {
  category: IssueCategory
  onChange: (category: IssueCategory) => void
  disabled?: boolean
}

export function CategorySelector({ category, onChange, disabled = false }: CategorySelectorProps) {
  const categories: IssueCategory[] = ['fix', 'wish']

  return (
    <div className="inline-flex items-center gap-3">
      {categories.map((cat) => {
        const label = ISSUE_CATEGORY_LABELS[cat]
        const colorClass = ISSUE_CATEGORY_COLORS[cat]
        const isSelected = category === cat

        return (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            disabled={disabled}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              isSelected
                ? colorClass
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
            } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            {cat === 'fix' ? '\u{1F527}' : '\u{2728}'} {label.zh}
          </button>
        )
      })}
    </div>
  )
}

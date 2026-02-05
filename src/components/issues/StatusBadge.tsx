'use client'

import {
  type IssueStatus,
  type IssuePriority,
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

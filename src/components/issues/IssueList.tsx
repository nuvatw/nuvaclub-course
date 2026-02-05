'use client'

import { useCallback, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { IssueCard } from './IssueCard'
import { Button } from '@/components/ui/Button'
import type { IssueWithCreator, IssueStatus, IssuePriority } from '@/types/issues'
import { ISSUE_STATUS_LABELS, ISSUE_PRIORITY_LABELS } from '@/types/issues'

interface IssueListProps {
  issues: IssueWithCreator[]
  total: number
  page: number
  totalPages: number
}

export function IssueList({ issues, total, page, totalPages }: IssueListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentFilters = {
    status: searchParams.get('status') || 'all',
    priority: searchParams.get('priority') || 'all',
    search: searchParams.get('search') || '',
  }

  const updateFilters = useCallback(
    (key: string, value: string) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString())
        if (value && value !== 'all') {
          params.set(key, value)
        } else {
          params.delete(key)
        }
        params.delete('page')
        router.push(`/issues?${params.toString()}`)
      })
    },
    [searchParams, router]
  )

  const handleSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      const search = formData.get('search') as string
      updateFilters('search', search)
    },
    [updateFilters]
  )

  const goToPage = useCallback(
    (newPage: number) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString())
        if (newPage > 1) {
          params.set('page', String(newPage))
        } else {
          params.delete('page')
        }
        router.push(`/issues?${params.toString()}`)
      })
    },
    [searchParams, router]
  )

  const clearFilters = useCallback(() => {
    startTransition(() => {
      router.push('/issues')
    })
  }, [router])

  const hasActiveFilters =
    currentFilters.status !== 'all' ||
    currentFilters.priority !== 'all' ||
    currentFilters.search !== ''

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
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
              name="search"
              defaultValue={currentFilters.search}
              placeholder="搜尋問題..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-zinc-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <Button type="submit" disabled={isPending}>
            搜尋
          </Button>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <FilterSelect
            label="狀態"
            value={currentFilters.status}
            onChange={(v) => updateFilters('status', v)}
            options={[
              { value: 'all', label: '全部' },
              ...(['not_started', 'in_progress', 'done', 'cancelled'] as IssueStatus[]).map((s) => ({
                value: s,
                label: ISSUE_STATUS_LABELS[s].zh,
              })),
            ]}
          />

          <FilterSelect
            label="優先度"
            value={currentFilters.priority}
            onChange={(v) => updateFilters('priority', v)}
            options={[
              { value: 'all', label: '全部' },
              ...(['high', 'medium', 'low'] as IssuePriority[]).map((p) => ({
                value: p,
                label: ISSUE_PRIORITY_LABELS[p].zh,
              })),
            ]}
          />

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-zinc-400 hover:text-foreground transition-colors"
            >
              清除篩選
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-zinc-500">
        共 {total} 筆結果
        {totalPages > 1 && ` · 第 ${page} / ${totalPages} 頁`}
      </div>

      {/* Issue list */}
      <AnimatePresence mode="wait">
        {isPending ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-zinc-800" />
            ))}
          </motion.div>
        ) : issues.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-lg border border-dashed border-zinc-700 p-12 text-center"
          >
            <svg
              className="mx-auto h-10 w-10 text-zinc-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-4 text-base font-medium text-foreground">沒有找到問題</h3>
            <p className="mt-1 text-sm text-zinc-500">
              {hasActiveFilters ? '嘗試調整篩選條件' : '建立第一個問題開始追蹤'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {issues.map((issue, index) => (
              <IssueCard key={issue.id} issue={issue} index={index} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1 || isPending}
          >
            上一頁
          </Button>

          <span className="text-sm text-zinc-500 px-3">
            {page} / {totalPages}
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages || isPending}
          >
            下一頁
          </Button>
        </div>
      )}
    </div>
  )
}

interface FilterSelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}

function FilterSelect({ label, value, onChange, options }: FilterSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-zinc-500">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

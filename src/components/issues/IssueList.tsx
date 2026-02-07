'use client'

import { useCallback, useOptimistic, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { IssueCard } from './IssueCard'
import { Button } from '@/components/ui/Button'
import type { IssueWithCreator } from '@/types/issues'

const ALL_CATEGORIES = ['fix', 'wish']
const DEFAULT_STATUSES = ['not_started', 'in_progress']
const ALL_PRIORITIES = ['high', 'medium', 'low']

const CATEGORY_TAGS = [
  { value: 'fix', label: '修理', color: 'bg-orange-600/80 border-orange-500/80' },
  { value: 'wish', label: '願望', color: 'bg-violet-600/80 border-violet-500/80' },
] as const

const STATUS_TAGS = [
  { value: 'not_started', label: '尚未開始', color: 'bg-zinc-600 border-zinc-500' },
  { value: 'in_progress', label: '執行中', color: 'bg-amber-600/80 border-amber-500/80' },
  { value: 'done', label: '完成', color: 'bg-emerald-600/80 border-emerald-500/80' },
] as const

const PRIORITY_TAGS = [
  { value: 'high', label: '高', color: 'bg-red-600/80 border-red-500/80' },
  { value: 'medium', label: '中', color: 'bg-yellow-600/80 border-yellow-500/80' },
  { value: 'low', label: '低', color: 'bg-blue-600/80 border-blue-500/80' },
] as const

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

  // Derive actual state from URL
  const categoryParam = searchParams.get('category')
  const statusParam = searchParams.get('status')
  const priorityParam = searchParams.get('priority')
  const searchValue = searchParams.get('search') || ''

  const categoryFromURL = categoryParam ? categoryParam.split(',') : ALL_CATEGORIES
  const statusFromURL = statusParam ? statusParam.split(',') : DEFAULT_STATUSES
  const priorityFromURL = priorityParam ? priorityParam.split(',') : ALL_PRIORITIES

  // Optimistic state for instant UI feedback
  const [activeCategories, setOptimisticCategories] = useOptimistic(categoryFromURL)
  const [activeStatuses, setOptimisticStatuses] = useOptimistic(statusFromURL)
  const [activePriorities, setOptimisticPriorities] = useOptimistic(priorityFromURL)

  const toggleFilter = useCallback(
    (
      key: string,
      value: string,
      current: string[],
      setOptimistic: (v: string[]) => void,
      defaults: string[]
    ) => {
      const newValues = current.includes(value)
        ? current.filter((s) => s !== value)
        : [...current, value]
      if (newValues.length === 0) return

      startTransition(() => {
        setOptimistic(newValues)
        const params = new URLSearchParams(searchParams.toString())
        const isDefault =
          newValues.length === defaults.length &&
          defaults.every((v) => newValues.includes(v))
        if (isDefault) {
          params.delete(key)
        } else {
          params.set(key, newValues.join(','))
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
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString())
        if (search) {
          params.set('search', search)
        } else {
          params.delete('search')
        }
        params.delete('page')
        router.push(`/issues?${params.toString()}`)
      })
    },
    [searchParams, router]
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
      setOptimisticCategories(ALL_CATEGORIES)
      setOptimisticStatuses(DEFAULT_STATUSES)
      setOptimisticPriorities(ALL_PRIORITIES)
      router.push('/issues')
    })
  }, [router, setOptimisticCategories, setOptimisticStatuses, setOptimisticPriorities])

  const isDefaultCategory =
    activeCategories.length === ALL_CATEGORIES.length &&
    ALL_CATEGORIES.every((c) => activeCategories.includes(c))
  const isDefaultStatus =
    activeStatuses.length === DEFAULT_STATUSES.length &&
    DEFAULT_STATUSES.every((s) => activeStatuses.includes(s))
  const isDefaultPriority =
    activePriorities.length === ALL_PRIORITIES.length &&
    ALL_PRIORITIES.every((p) => activePriorities.includes(p))

  const hasActiveFilters =
    !isDefaultCategory || !isDefaultStatus || !isDefaultPriority || searchValue !== ''

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
              defaultValue={searchValue}
              placeholder="搜尋項目..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-zinc-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <Button type="submit" disabled={isPending}>
            搜尋
          </Button>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">分類:</span>
            {CATEGORY_TAGS.map((tag) => {
              const isActive = activeCategories.includes(tag.value)
              return (
                <button
                  key={tag.value}
                  type="button"
                  onClick={() =>
                    toggleFilter(
                      'category',
                      tag.value,
                      activeCategories,
                      setOptimisticCategories,
                      ALL_CATEGORIES
                    )
                  }
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    isActive
                      ? `${tag.color} text-white`
                      : 'border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-400'
                  }`}
                >
                  {tag.label}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">狀態:</span>
            {STATUS_TAGS.map((tag) => {
              const isActive = activeStatuses.includes(tag.value)
              return (
                <button
                  key={tag.value}
                  type="button"
                  onClick={() =>
                    toggleFilter(
                      'status',
                      tag.value,
                      activeStatuses,
                      setOptimisticStatuses,
                      DEFAULT_STATUSES
                    )
                  }
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    isActive
                      ? `${tag.color} text-white`
                      : 'border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-400'
                  }`}
                >
                  {tag.label}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">優先度:</span>
            {PRIORITY_TAGS.map((tag) => {
              const isActive = activePriorities.includes(tag.value)
              return (
                <button
                  key={tag.value}
                  type="button"
                  onClick={() =>
                    toggleFilter(
                      'priority',
                      tag.value,
                      activePriorities,
                      setOptimisticPriorities,
                      ALL_PRIORITIES
                    )
                  }
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    isActive
                      ? `${tag.color} text-white`
                      : 'border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-400'
                  }`}
                >
                  {tag.label}
                </button>
              )
            })}
          </div>

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
            <h3 className="mt-4 text-base font-medium text-foreground">沒有找到項目</h3>
            <p className="mt-1 text-sm text-zinc-500">
              {hasActiveFilters ? '嘗試調整篩選條件' : '建立第一個項目開始追蹤'}
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

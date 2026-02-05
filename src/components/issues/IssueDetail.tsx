'use client'

import { useState, useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { StatusBadge, PrioritySelector } from './StatusBadge'
import { ImageGallery } from './ImageGallery'
import type { IssueWithDetails, IssueStatus, IssuePriority } from '@/types/issues'
import { ISSUE_STATUS_LABELS } from '@/types/issues'
import { updateIssueStatus, updateIssuePriority, deleteIssue, deleteIssueImage } from '@/app/actions/issues'
import { formatDate } from '@/lib/utils'

interface IssueDetailProps {
  issue: IssueWithDetails
  canEdit: boolean
}

const STATUS_OPTIONS: IssueStatus[] = ['not_started', 'in_progress', 'done', 'cancelled']

export function IssueDetail({ issue, canEdit }: IssueDetailProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)

  const handleStatusChange = useCallback(
    (newStatus: IssueStatus) => {
      setShowStatusDropdown(false)
      startTransition(async () => {
        const result = await updateIssueStatus(issue.id, { status: newStatus })
        if (!result.success) {
          alert(result.error || '更新狀態失敗')
        }
      })
    },
    [issue.id]
  )

  const handlePriorityChange = useCallback(
    (newPriority: IssuePriority) => {
      startTransition(async () => {
        const result = await updateIssuePriority(issue.id, { priority: newPriority })
        if (!result.success) {
          alert(result.error || '更新優先度失敗')
        }
      })
    },
    [issue.id]
  )

  const handleDelete = useCallback(() => {
    startTransition(async () => {
      const result = await deleteIssue(issue.id)
      if (result.success) {
        router.push('/issues')
      } else {
        alert(result.error || '刪除失敗')
        setShowDeleteConfirm(false)
      }
    })
  }, [issue.id, router])

  const handleImageDelete = useCallback(
    async (imageId: string) => {
      const result = await deleteIssueImage(issue.id, imageId)
      if (!result.success) {
        alert(result.error || '刪除圖片失敗')
      }
    },
    [issue.id]
  )

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/issues"
          className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-foreground transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回列表
        </Link>

        {canEdit && (
          <div className="flex items-center gap-2">
            <Link href={`/issues/${issue.id}/edit`}>
              <Button variant="secondary" size="sm">
                編輯
              </Button>
            </Link>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isPending}
            >
              刪除
            </Button>
          </div>
        )}
      </div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <span className="text-lg text-zinc-500 font-medium">#{issue.issue_number}</span>
        <h1 className="text-2xl font-bold text-foreground mt-1">
          {issue.title}
        </h1>
      </motion.div>

      {/* Status & Priority Row */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex flex-wrap items-center gap-4 mb-6"
      >
        {/* Status Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className="flex items-center gap-1.5"
            disabled={isPending}
          >
            <StatusBadge status={issue.status} />
            <svg
              className={`w-4 h-4 text-zinc-400 transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showStatusDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowStatusDropdown(false)} />
              <div className="absolute left-0 top-full z-20 mt-1 w-36 rounded-lg border border-zinc-700 bg-zinc-800 py-1 shadow-lg">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleStatusChange(status)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-zinc-700 ${
                      status === issue.status ? 'bg-zinc-700 text-primary' : 'text-foreground'
                    }`}
                  >
                    {ISSUE_STATUS_LABELS[status].zh}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="h-4 w-px bg-zinc-700" />

        {/* Priority Selector */}
        <PrioritySelector
          priority={issue.priority}
          onChange={handlePriorityChange}
          disabled={isPending}
        />
      </motion.div>

      {/* Meta info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center gap-4 text-sm text-zinc-500 mb-8 pb-8 border-b border-zinc-800"
      >
        <span>建立者：{issue.creator?.full_name || issue.creator?.email || '未知'}</span>
        <span>·</span>
        <span>建立於 {formatDate(issue.created_at)}</span>
        <span>·</span>
        <span>更新於 {formatDate(issue.updated_at)}</span>
      </motion.div>

      {/* Content Sections */}
      <div className="space-y-6">
        {/* Row 1: Background */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-lg border border-zinc-800 bg-card p-6"
        >
          <h2 className="text-sm font-medium text-zinc-400 mb-3">背景說明</h2>
          <p className="text-foreground whitespace-pre-wrap leading-relaxed">
            {issue.why_background || '—'}
          </p>
        </motion.section>

        {/* Row 2: Current vs Expected Behavior */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid gap-6 md:grid-cols-2"
        >
          <section className="rounded-lg border border-zinc-800 bg-card p-6">
            <h2 className="text-sm font-medium text-zinc-400 mb-3">目前行為</h2>
            <p className="text-foreground whitespace-pre-wrap leading-relaxed">
              {issue.current_behavior || '—'}
            </p>
          </section>

          <section className="rounded-lg border border-zinc-800 bg-card p-6">
            <h2 className="text-sm font-medium text-zinc-400 mb-3">預期行為</h2>
            <p className="text-foreground whitespace-pre-wrap leading-relaxed">
              {issue.expected_behavior || '—'}
            </p>
          </section>
        </motion.div>

        {/* Row 3: Acceptance Criteria */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-lg border border-zinc-800 bg-card p-6"
        >
          <h2 className="text-sm font-medium text-zinc-400 mb-3">驗收條件</h2>
          <p className="text-foreground whitespace-pre-wrap leading-relaxed">
            {issue.acceptance_criteria || '—'}
          </p>
        </motion.section>

        {/* Row 4: Images */}
        {issue.images.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-lg border border-zinc-800 bg-card p-6"
          >
            <h2 className="text-sm font-medium text-zinc-400 mb-4">
              附加圖片 ({issue.images.length})
            </h2>
            <ImageGallery
              images={issue.images}
              canDelete={canEdit}
              onDelete={handleImageDelete}
            />
          </motion.section>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-lg border border-zinc-700 bg-zinc-900 p-6"
          >
            <h3 className="text-lg font-semibold text-foreground">確定要刪除這個問題？</h3>
            <p className="mt-2 text-sm text-zinc-400">
              此操作無法復原。所有相關的圖片也會被一併刪除。
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isPending}
              >
                取消
              </Button>
              <Button variant="danger" onClick={handleDelete} disabled={isPending}>
                {isPending ? '刪除中...' : '確定刪除'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

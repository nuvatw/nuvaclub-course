'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { CategoryBadge, StatusBadge } from './StatusBadge'
import { notifyEngineer } from '@/app/actions/notify'
import type { IssueWithCreator } from '@/types/issues'

interface NotifyEngineerModalProps {
  isOpen: boolean
  onClose: () => void
  issues: IssueWithCreator[]
}

export function NotifyEngineerModal({ isOpen, onClose, issues }: NotifyEngineerModalProps) {
  const [email, setEmail] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const allSelected = issues.length > 0 && selectedIds.size === issues.length

  const toggleAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(issues.map((i) => i.id)))
    }
  }, [allSelected, issues])

  const toggleIssue = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const handleClose = useCallback(() => {
    if (sending) return
    setEmail('')
    setSelectedIds(new Set())
    setMessage('')
    setError('')
    setSuccess(false)
    onClose()
  }, [sending, onClose])

  const handleSubmit = useCallback(async () => {
    setError('')

    if (!email.trim()) {
      setError('請輸入收件人信箱')
      return
    }
    if (selectedIds.size === 0) {
      setError('請至少選擇一個項目')
      return
    }

    setSending(true)
    const result = await notifyEngineer({
      recipientEmail: email.trim(),
      issueIds: Array.from(selectedIds),
      message: message.trim() || undefined,
    })

    setSending(false)

    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        handleClose()
      }, 1500)
    } else {
      setError(result.error || '發送失敗')
    }
  }, [email, selectedIds, message, handleClose])

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="通知工程師">
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-8"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
              <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="mt-4 text-sm text-foreground">通知已成功發送</p>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            {/* Error */}
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Email Input */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                收件人信箱 <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="engineer@example.com"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-foreground placeholder:text-zinc-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Issue Selection */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  選擇項目 <span className="text-red-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={toggleAll}
                  className="text-xs text-primary hover:text-primary-hover transition-colors"
                >
                  {allSelected ? '取消全選' : '全選'}
                </button>
              </div>
              <div className="max-h-[240px] overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-800/50">
                {issues.length === 0 ? (
                  <p className="px-3 py-4 text-center text-sm text-zinc-500">目前沒有項目</p>
                ) : (
                  issues.map((issue) => {
                    const checked = selectedIds.has(issue.id)
                    return (
                      <label
                        key={issue.id}
                        className={`flex cursor-pointer items-center gap-3 border-b border-zinc-700/50 px-3 py-2.5 transition-colors last:border-b-0 ${
                          checked ? 'bg-primary/5' : 'hover:bg-zinc-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleIssue(issue.id)}
                          className="h-4 w-4 rounded border-zinc-600 bg-zinc-700 text-primary focus:ring-primary focus:ring-offset-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-foreground truncate block">
                            <span className="text-zinc-500">#{issue.issue_number}</span>{' '}
                            {issue.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <CategoryBadge category={issue.category} />
                          <StatusBadge status={issue.status} />
                        </div>
                      </label>
                    )
                  })
                )}
              </div>
              {selectedIds.size > 0 && (
                <p className="mt-1 text-xs text-zinc-500">已選擇 {selectedIds.size} 個項目</p>
              )}
            </div>

            {/* Message */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">附加訊息</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="例如: 請優先處理這幾張單子..."
                rows={3}
                maxLength={500}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-foreground placeholder:text-zinc-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
              {message.length > 0 && (
                <p className="mt-1 text-right text-xs text-zinc-500">{message.length}/500</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="ghost" onClick={handleClose} disabled={sending}>
                取消
              </Button>
              <Button onClick={handleSubmit} isLoading={sending} disabled={selectedIds.size === 0}>
                <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                發送通知
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  )
}

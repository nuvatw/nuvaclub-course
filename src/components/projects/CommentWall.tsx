'use client'

import { useRef, useTransition, useOptimistic, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { createComment, deleteComment } from '@/app/actions/comments'
import { formatDateTime } from '@/lib/utils'
import type { ProjectComment } from '@/types/database'

interface CommentWallProps {
  projectId: string
  comments: ProjectComment[]
  isAuthenticated: boolean
  userId?: string
  isAdmin: boolean
}

export function CommentWall({ projectId, comments, isAuthenticated, userId, isAdmin }: CommentWallProps) {
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  const [optimisticComments, updateOptimisticComments] = useOptimistic(
    comments,
    (state, action: { type: 'add'; comment: ProjectComment } | { type: 'delete'; id: string }) => {
      if (action.type === 'add') {
        return [action.comment, ...state]
      } else {
        return state.filter((c) => c.id !== action.id)
      }
    }
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const body = formData.get('body') as string

    if (!body.trim()) return

    formData.set('projectId', projectId)

    const optimisticComment: ProjectComment = {
      id: `temp-${Date.now()}`,
      project_id: projectId,
      author_id: 'temp',
      author_name: '你',
      body: body.trim(),
      created_at: new Date().toISOString(),
    }

    startTransition(async () => {
      updateOptimisticComments({ type: 'add', comment: optimisticComment })
      formRef.current?.reset()
      await createComment(formData)
    })
  }

  const handleDelete = useCallback(
    async (commentId: string) => {
      if (!confirm('確定要刪除這則留言嗎？')) return

      startTransition(async () => {
        updateOptimisticComments({ type: 'delete', id: commentId })
        const result = await deleteComment(commentId, projectId)
        if (!result.success) {
          alert(result.error || '刪除失敗')
        }
      })
    },
    [projectId, updateOptimisticComments]
  )

  const canDeleteComment = (comment: ProjectComment) => {
    if (comment.id.startsWith('temp-')) return false
    return isAdmin || comment.author_id === userId
  }

  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="py-8 text-center">
            <svg
              className="w-12 h-12 text-muted/30 mx-auto mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-muted">請登入以查看和發表留言</p>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-4"
    >
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <svg className="w-5 h-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            留言
            {optimisticComments.length > 0 && (
              <span className="text-sm font-normal text-muted">
                ({optimisticComments.length})
              </span>
            )}
          </h3>
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
            <textarea
              name="body"
              placeholder="寫下你的留言..."
              required
              rows={3}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
            />
            <div className="flex justify-end">
              <Button type="submit" isLoading={isPending}>
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                發表留言
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <AnimatePresence mode="popLayout">
        {optimisticComments.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card>
              <CardContent className="py-8 text-center">
                <svg
                  className="w-8 h-8 text-muted/30 mx-auto mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="text-muted">還沒有留言，成為第一個留言的人吧！</p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {optimisticComments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.03 }}
                layout
              >
                <Card
                  className={`transition-opacity ${
                    comment.id.startsWith('temp-') ? 'opacity-70' : ''
                  }`}
                >
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-semibold">
                          {comment.author_name.charAt(0).toUpperCase()}
                        </span>
                        {comment.author_name}
                        {comment.id.startsWith('temp-') && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xs text-muted flex items-center gap-1"
                          >
                            <svg
                              className="w-3 h-3 animate-spin"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            發送中...
                          </motion.span>
                        )}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted">
                          {formatDateTime(comment.created_at)}
                        </span>
                        {canDeleteComment(comment) && (
                          <button
                            type="button"
                            onClick={() => handleDelete(comment.id)}
                            disabled={isPending}
                            className="text-zinc-500 hover:text-red-400 transition-colors disabled:opacity-50"
                            aria-label="刪除留言"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-foreground whitespace-pre-wrap pl-9">
                      {comment.body}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

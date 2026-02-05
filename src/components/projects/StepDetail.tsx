'use client'

import { useState, useTransition, useOptimistic } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { LinkCard } from './LinkCard'
import { LinkModal } from './LinkModal'
import { CompleteStepModal } from './CompleteStepModal'
import { completeStep, startStep } from '@/app/actions/steps'
import { getCategoryColor } from '@/lib/utils'
import type { ProjectStep, StepLink } from '@/types/database'

interface StepWithLinks extends ProjectStep {
  step_links: StepLink[]
}

interface StepDetailProps {
  projectId: string
  step: StepWithLinks
  isAdmin: boolean
}

export function StepDetail({ projectId, step, isAdmin }: StepDetailProps) {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [showSuccess, setShowSuccess] = useState(false)

  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    step.status,
    (_, newStatus: 'not_started' | 'in_progress' | 'done') => newStatus
  )

  const handleComplete = (actualHours: number) => {
    startTransition(async () => {
      setOptimisticStatus('done')
      setIsCompleteModalOpen(false)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
      await completeStep(projectId, step.id, actualHours)
    })
  }

  const handleStart = () => {
    startTransition(async () => {
      setOptimisticStatus('in_progress')
      await startStep(projectId, step.id)
    })
  }

  const displayStatus = optimisticStatus

  // Format time display
  const formatHours = (hours: number | null) => {
    if (hours === null) return '-'
    if (hours < 1) return `${Math.round(hours * 60)}分鐘`
    return `${hours}小時`
  }

  return (
    <motion.div
      key={step.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold text-foreground">
            {step.step_index}. {step.name}
          </h2>
          <span
            className={`${getCategoryColor(step.category)} text-sm text-white px-3 py-1 rounded-full font-medium`}
          >
            {step.category}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {step.relative_timing}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            預估 {step.estimated_hours} 小時
          </span>
          {step.actual_hours !== null && (
            <span className="flex items-center gap-1 text-foreground">
              <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              實際 {formatHours(step.actual_hours)}
            </span>
          )}

          {/* Status badge */}
          <motion.span
            layout
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
              displayStatus === 'done'
                ? 'bg-success/20 text-success'
                : displayStatus === 'in_progress'
                ? 'bg-in-progress/20 text-in-progress'
                : 'bg-card-hover text-muted'
            }`}
          >
            {displayStatus === 'done' ? (
              <>
                <motion.svg
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </motion.svg>
                完成
              </>
            ) : displayStatus === 'in_progress' ? (
              <>
                <motion.span
                  className="w-2 h-2 bg-in-progress rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                進行中
              </>
            ) : (
              <>
                <span className="w-2 h-2 bg-muted rounded-full" />
                未開始
              </>
            )}
          </motion.span>
        </div>
      </div>

      {/* Success animation overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              className="bg-success/20 backdrop-blur-sm rounded-full p-8"
            >
              <motion.svg
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5 }}
                className="w-16 h-16 text-success"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </motion.svg>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      {isAdmin && displayStatus !== 'done' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3"
        >
          {displayStatus === 'not_started' && (
            <Button onClick={handleStart} isLoading={isPending}>
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              開始這個階段
            </Button>
          )}
          {displayStatus === 'in_progress' && (
            <Button onClick={() => setIsCompleteModalOpen(true)} disabled={isPending}>
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              完成階段
            </Button>
          )}
        </motion.div>
      )}

      {/* Links section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <svg className="w-5 h-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            連結
          </h3>
          {isAdmin && (
            <Button variant="secondary" size="sm" onClick={() => setIsLinkModalOpen(true)}>
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新增連結
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {step.step_links.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card>
                <CardContent className="py-8">
                  <p className="text-muted text-center flex flex-col items-center gap-2">
                    <svg className="w-8 h-8 text-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    尚未新增任何連結
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {step.step_links.map((link, index) => (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <LinkCard
                    link={link}
                    projectId={projectId}
                    isAdmin={isAdmin}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <LinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        projectId={projectId}
        stepId={step.id}
      />

      <CompleteStepModal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        onConfirm={handleComplete}
        stepName={step.name}
        estimatedHours={step.estimated_hours}
        isPending={isPending}
      />
    </motion.div>
  )
}

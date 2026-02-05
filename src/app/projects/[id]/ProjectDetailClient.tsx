'use client'

import { useState, useCallback, useTransition, ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { StepList } from '@/components/projects/StepList'
import { StepDetail } from '@/components/projects/StepDetail'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'
import { deleteProject } from '@/app/actions/projects'
import { formatDate } from '@/lib/utils'
import { useFocusTrap } from '@/lib/useFocusTrap'
import type { ProjectStep, StepLink } from '@/types/database'

interface StepWithLinks extends ProjectStep {
  step_links: StepLink[]
}

interface Project {
  id: string
  title: string
  description: string | null
  launch_date: string | null
  current_step_index: number
  created_at: string
  project_steps: StepWithLinks[]
}

interface ProjectDetailClientProps {
  project: Project
  isAdmin: boolean
  canDelete: boolean
  children: ReactNode // Streamed comments section
}

export function ProjectDetailClient({
  project,
  isAdmin,
  canDelete,
  children,
}: ProjectDetailClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedStepId, setSelectedStepId] = useState<string>(
    project.project_steps[0]?.id || ''
  )

  const deleteModalRef = useFocusTrap<HTMLDivElement>({
    isOpen: showDeleteConfirm,
    onClose: () => setShowDeleteConfirm(false),
  })

  const handleDelete = useCallback(() => {
    startTransition(async () => {
      const result = await deleteProject(project.id)
      if (result.success) {
        router.push('/')
      } else {
        alert(result.error || '刪除失敗')
        setShowDeleteConfirm(false)
      }
    })
  }, [project.id, router])

  const selectedStep = project.project_steps.find((s) => s.id === selectedStepId)
  const completedSteps = project.project_steps.filter((s) => s.status === 'done').length

  // Find current step index (first non-done step or last step)
  const currentStepIndex = project.project_steps.find(s => s.status !== 'done')?.step_index || project.project_steps.length

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-card border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between">
            <div>
              <Link
                href="/"
                className="text-sm text-muted hover:text-foreground transition-colors mb-2 inline-flex items-center gap-1 group"
              >
                <svg
                  className="w-4 h-4 transition-transform group-hover:-translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                返回列表
              </Link>
              <h1 className="text-2xl font-bold text-foreground">{project.title}</h1>
              {project.description && (
                <p className="text-muted mt-1">{project.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-muted">
                {project.launch_date && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    上線日期：{formatDate(project.launch_date)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  建立時間：{formatDate(project.created_at)}
                </span>
              </div>
            </div>
            {canDelete && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isPending}
              >
                刪除
              </Button>
            )}
          </div>
          <div className="mt-4 max-w-xl">
            <ProgressBar
              current={completedSteps}
              total={project.project_steps.length}
              variant="steps"
              currentStepIndex={currentStepIndex}
            />
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Step Sidebar */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="bg-card rounded-lg border border-border p-4 sticky top-4">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                製作步驟
              </h2>
              <StepList
                steps={project.project_steps}
                selectedStepId={selectedStepId}
                onSelectStep={setSelectedStepId}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-8">
            {selectedStep && (
              <div className="bg-card rounded-lg border border-border p-6">
                <StepDetail
                  projectId={project.id}
                  step={selectedStep}
                  isAdmin={isAdmin}
                />
              </div>
            )}

            {/* Streamed Comments Section */}
            {children}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-project-modal-title"
        >
          <motion.div
            ref={deleteModalRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-lg border border-zinc-700 bg-zinc-900 p-6"
          >
            <h3 id="delete-project-modal-title" className="text-lg font-semibold text-foreground">確定要刪除這個課程？</h3>
            <p className="mt-2 text-sm text-zinc-400">
              此操作無法復原。所有相關的步驟、連結和留言也會被一併刪除。
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

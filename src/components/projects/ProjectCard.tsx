'use client'

import { memo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getCategoryColor } from '@/lib/utils'
import type { ProjectStep } from '@/types/database'

interface ProjectCardProps {
  id: string
  title: string
  description: string | null
  steps: ProjectStep[]
  index?: number
}

export const ProjectCard = memo(function ProjectCard({
  id,
  title,
  description,
  steps,
  index = 0
}: ProjectCardProps) {
  // Calculate hours-based progress
  const completedHours = steps
    .filter((s) => s.status === 'done')
    .reduce((sum, s) => sum + s.estimated_hours, 0)
  const totalHours = steps.reduce((sum, s) => sum + s.estimated_hours, 0)
  const progressPercent = Math.round((completedHours / totalHours) * 100)

  const completedSteps = steps.filter((s) => s.status === 'done').length
  const inProgressStep = steps.find((s) => s.status === 'in_progress')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: [0.25, 0.1, 0.25, 1]
      }}
    >
      <Link href={`/projects/${id}`}>
        <motion.div
          className="bg-card rounded-xl border border-border p-6 transition-all duration-200"
          whileHover={{
            borderColor: 'rgba(59, 130, 246, 0.3)',
            boxShadow: '0 8px 40px rgba(0, 0, 0, 0.3), 0 0 60px rgba(59, 130, 246, 0.08)'
          }}
        >
          {/* Header Row */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-foreground mb-1">{title}</h3>
              {description && (
                <p className="text-sm text-muted line-clamp-1">{description}</p>
              )}
            </div>

            {/* Progress Stats */}
            <div className="flex items-center gap-6 text-right">
              <div>
                <p className="text-2xl font-bold text-foreground tabular-nums">{progressPercent}%</p>
                <p className="text-xs text-muted">完成度</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground tabular-nums">{completedHours}<span className="text-sm font-normal text-muted">/{totalHours}h</span></p>
                <p className="text-xs text-muted">工時</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground tabular-nums">{completedSteps}<span className="text-sm font-normal text-muted">/{steps.length}</span></p>
                <p className="text-xs text-muted">階段</p>
              </div>
            </div>
          </div>

          {/* Hours Progress Bar */}
          <div className="mb-6">
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: index * 0.1 + 0.2 }}
                className="h-full bg-gradient-to-r from-primary via-blue-400 to-cyan-400 relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-400 to-cyan-400 blur-sm opacity-60" />
              </motion.div>
            </div>
          </div>

          {/* 20 Steps Timeline */}
          <div className="relative">
            <div className="flex items-center gap-1">
              {steps.map((step, stepIndex) => {
                const isDone = step.status === 'done'
                const isInProgress = step.status === 'in_progress'

                return (
                  <div key={step.id} className="flex-1 group relative">
                    {/* Step bar */}
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 + stepIndex * 0.02 }}
                      className={`h-8 rounded transition-all duration-200 origin-left ${
                        isDone
                          ? 'bg-success/80'
                          : isInProgress
                          ? 'bg-in-progress relative overflow-hidden'
                          : 'bg-card-hover'
                      }`}
                      style={{
                        boxShadow: isInProgress
                          ? '0 0 20px rgba(249, 115, 22, 0.4)'
                          : isDone
                          ? '0 0 10px rgba(34, 197, 94, 0.2)'
                          : 'none'
                      }}
                    >
                      {/* Pulse animation for in-progress */}
                      {isInProgress && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        />
                      )}

                      {/* Step number */}
                      <div className={`h-full flex items-center justify-center text-xs font-medium ${
                        isDone || isInProgress ? 'text-white' : 'text-muted'
                      }`}>
                        {isDone ? (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          step.step_index
                        )}
                      </div>
                    </motion.div>

                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
                        <p className="text-xs font-medium text-foreground">{step.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`${getCategoryColor(step.category)} text-[10px] text-white px-1.5 py-0.5 rounded`}>
                            {step.category}
                          </span>
                          <span className="text-[10px] text-muted">{step.estimated_hours}h</span>
                        </div>
                      </div>
                      {/* Arrow */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-border" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Current Step Info */}
          {inProgressStep && (
            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm text-muted">目前進度：</span>
              <span className={`${getCategoryColor(inProgressStep.category)} text-xs text-white px-2 py-0.5 rounded`}>
                {inProgressStep.category}
              </span>
              <span className="text-sm font-medium text-in-progress">
                {inProgressStep.step_index}. {inProgressStep.name}
              </span>
              <span className="text-xs text-muted">({inProgressStep.estimated_hours}h)</span>
            </div>
          )}
        </motion.div>
      </Link>
    </motion.div>
  )
})

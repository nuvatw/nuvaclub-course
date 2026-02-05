'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { getCategoryColor } from '@/lib/utils'
import type { ProjectStep, StepLink } from '@/types/database'

interface StepWithLinks extends ProjectStep {
  step_links: StepLink[]
}

interface StepListProps {
  steps: StepWithLinks[]
  selectedStepId: string | null
  onSelectStep: (stepId: string) => void
}

export const StepList = memo(function StepList({ steps, selectedStepId, onSelectStep }: StepListProps) {
  return (
    <div className="space-y-1">
      {steps.map((step, index) => {
        const isSelected = step.id === selectedStepId
        const isDone = step.status === 'done'
        const isInProgress = step.status === 'in_progress'
        const isLast = index === steps.length - 1

        return (
          <div key={step.id} className="relative">
            {/* Timeline connector line */}
            {!isLast && (
              <div
                className={`absolute left-[18px] top-10 w-0.5 h-[calc(100%-8px)] transition-colors duration-300 ${
                  isDone ? 'bg-success/50' : 'bg-border'
                }`}
              />
            )}

            <motion.button
              onClick={() => onSelectStep(step.id)}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 relative ${
                isSelected
                  ? 'bg-primary/10 border border-primary/30'
                  : 'hover:bg-card-hover border border-transparent'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Status indicator */}
                <div className="relative flex-shrink-0 mt-0.5">
                  <motion.div
                    initial={false}
                    animate={
                      isInProgress
                        ? { scale: [1, 1.15, 1] }
                        : { scale: 1 }
                    }
                    transition={
                      isInProgress
                        ? { repeat: Infinity, duration: 2, ease: 'easeInOut' }
                        : { duration: 0.3 }
                    }
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                      isDone
                        ? 'bg-success text-white shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                        : isInProgress
                        ? 'bg-in-progress text-white shadow-[0_0_15px_rgba(249,115,22,0.5)]'
                        : 'bg-card-hover text-muted border border-border'
                    }`}
                  >
                    {isDone ? (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step.step_index
                    )}
                  </motion.div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium truncate transition-colors ${
                        isSelected ? 'text-primary' : isDone ? 'text-foreground' : 'text-foreground/80'
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`${getCategoryColor(step.category)} text-xs text-white px-1.5 py-0.5 rounded`}
                    >
                      {step.category}
                    </span>
                    <span className="text-xs text-muted tabular-nums">
                      {step.estimated_hours}h
                    </span>
                    {step.step_links.length > 0 && (
                      <span className="text-xs text-muted flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        {step.step_links.length}
                      </span>
                    )}
                  </div>
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <motion.div
                    layoutId="step-selection"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r"
                  />
                )}
              </div>
            </motion.button>
          </div>
        )
      })}
    </div>
  )
})

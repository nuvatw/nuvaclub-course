'use client'

import { motion } from 'framer-motion'

interface StepIndicatorProps {
  totalSteps: number
  completedSteps: number
  currentStepIndex: number
  compact?: boolean
}

export function StepIndicator({
  totalSteps,
  completedSteps,
  currentStepIndex,
  compact = false
}: StepIndicatorProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1)

  return (
    <div className="w-full">
      <div className={`flex items-center ${compact ? 'gap-0.5' : 'gap-1'}`}>
        {steps.map((stepNum, index) => {
          const isDone = stepNum <= completedSteps
          const isActive = stepNum === currentStepIndex && !isDone
          const isPending = stepNum > completedSteps && stepNum !== currentStepIndex

          return (
            <div key={stepNum} className="flex items-center flex-1">
              {/* Step dot */}
              <motion.div
                initial={false}
                animate={
                  isDone
                    ? { scale: 1, opacity: 1 }
                    : isActive
                    ? { scale: [1, 1.15, 1], opacity: 1 }
                    : { scale: 1, opacity: 0.4 }
                }
                transition={
                  isActive
                    ? { repeat: Infinity, duration: 2, ease: 'easeInOut' }
                    : { duration: 0.3 }
                }
                className={`
                  ${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'}
                  rounded-full flex-shrink-0
                  ${isDone ? 'step-dot-done' : ''}
                  ${isActive ? 'step-dot-active' : ''}
                  ${isPending ? 'step-dot-pending' : ''}
                `}
              />

              {/* Connecting line (except for last step) */}
              {index < totalSteps - 1 && (
                <div
                  className={`
                    step-line
                    ${stepNum < completedSteps || (stepNum === completedSteps && completedSteps < currentStepIndex)
                      ? 'step-line-done'
                      : 'step-line-pending'}
                  `}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Progress label */}
      {!compact && (
        <div className="flex justify-between items-center mt-2 text-xs text-muted">
          <span>{completedSteps}/{totalSteps} 已完成</span>
          <span className="text-in-progress font-medium">
            第 {currentStepIndex} 步
          </span>
        </div>
      )}
    </div>
  )
}

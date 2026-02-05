'use client'

import { motion } from 'framer-motion'
import { StepIndicator } from './StepIndicator'

interface ProgressBarProps {
  current: number
  total: number
  className?: string
  showLabel?: boolean
  variant?: 'bar' | 'steps'
  currentStepIndex?: number
}

export function ProgressBar({
  current,
  total,
  className = '',
  showLabel = true,
  variant = 'bar',
  currentStepIndex
}: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100)

  if (variant === 'steps') {
    return (
      <div className={className}>
        <StepIndicator
          totalSteps={total}
          completedSteps={current}
          currentStepIndex={currentStepIndex || current + 1}
        />
      </div>
    )
  }

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between text-sm text-muted mb-2">
          <span className="font-medium">進度</span>
          <span className="tabular-nums">
            {current}/{total} 步驟
            <span className="ml-2 text-foreground">({percentage}%)</span>
          </span>
        </div>
      )}
      <div className="h-2 bg-border rounded-full overflow-hidden relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="h-full bg-gradient-to-r from-primary to-blue-400 relative"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-400 blur-sm opacity-50" />
          {/* Shine animation */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
          />
        </motion.div>
      </div>
    </div>
  )
}

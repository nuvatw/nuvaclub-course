'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface CompleteStepModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (actualHours: number) => void
  stepName: string
  estimatedHours: number
  isPending: boolean
}

export function CompleteStepModal({
  isOpen,
  onClose,
  onConfirm,
  stepName,
  estimatedHours,
  isPending
}: CompleteStepModalProps) {
  const [actualHours, setActualHours] = useState(estimatedHours.toString())

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const hours = parseFloat(actualHours)
    if (!isNaN(hours) && hours >= 0) {
      onConfirm(hours)
    }
  }

  const hoursNum = parseFloat(actualHours) || 0
  const difference = hoursNum - estimatedHours
  const percentDiff = estimatedHours > 0 ? Math.round((difference / estimatedHours) * 100) : 0

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="完成階段">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <p className="text-foreground font-medium mb-1">{stepName}</p>
          <p className="text-sm text-muted">預估時間：{estimatedHours} 小時</p>
        </div>

        <div>
          <label htmlFor="actualHours" className="block text-sm font-medium text-foreground mb-2">
            實際花費時間（小時）
          </label>
          <div className="relative">
            <input
              type="number"
              id="actualHours"
              value={actualHours}
              onChange={(e) => setActualHours(e.target.value)}
              min="0"
              step="0.5"
              required
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              placeholder="輸入實際時間"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted">小時</span>
          </div>
        </div>

        {/* Comparison */}
        {hoursNum > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg ${
              difference > 0
                ? 'bg-red-500/10 border border-red-500/20'
                : difference < 0
                ? 'bg-green-500/10 border border-green-500/20'
                : 'bg-card-hover border border-border'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">與預估相比</span>
              <span
                className={`font-medium ${
                  difference > 0
                    ? 'text-red-400'
                    : difference < 0
                    ? 'text-green-400'
                    : 'text-foreground'
                }`}
              >
                {difference > 0 ? '+' : ''}{difference.toFixed(1)} 小時
                <span className="text-sm ml-1">
                  ({percentDiff > 0 ? '+' : ''}{percentDiff}%)
                </span>
              </span>
            </div>
            <p className="text-xs text-muted mt-2">
              {difference > 0
                ? '這個階段比預期花費更多時間，數據會更新未來專案的預估。'
                : difference < 0
                ? '比預期更快完成！數據會優化未來專案的預估。'
                : '完美符合預估時間！'}
            </p>
          </motion.div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            取消
          </Button>
          <Button type="submit" isLoading={isPending}>
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            確認完成
          </Button>
        </div>
      </form>
    </Modal>
  )
}

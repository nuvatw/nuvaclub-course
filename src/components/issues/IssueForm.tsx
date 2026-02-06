'use client'

import { useState, useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { ImageUploader } from './ImageUploader'
import { PrioritySelector, CategorySelector } from './StatusBadge'
import { type IssueCategory, type IssuePriority, type IssueWithDetails } from '@/types/issues'
import { createIssue, updateIssue, deleteIssueImage } from '@/app/actions/issues'

interface IssueFormProps {
  mode: 'create' | 'edit'
  issue?: IssueWithDetails
}

export function IssueForm({ mode, issue }: IssueFormProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [isPending, startTransition] = useTransition()

  // Form state (simplified)
  const [title, setTitle] = useState(issue?.title || '')
  const [category, setCategory] = useState<IssueCategory>(issue?.category || 'fix')
  const [priority, setPriority] = useState<IssuePriority>(issue?.priority || 'medium')
  const [whyBackground, setWhyBackground] = useState(issue?.why_background || '')
  const [currentBehavior, setCurrentBehavior] = useState(issue?.current_behavior || '')
  const [expectedBehavior, setExpectedBehavior] = useState(issue?.expected_behavior || '')
  const [acceptanceCriteria, setAcceptanceCriteria] = useState(issue?.acceptance_criteria || '')
  const [imageIds, setImageIds] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const existingImages = issue?.images || []
  const issueId = issue?.id

  const handleRemoveExisting = useCallback(
    async (imageId: string) => {
      if (!issueId) return
      const result = await deleteIssueImage(issueId, imageId)
      if (!result.success) {
        showToast({ type: 'error', message: result.error || '刪除圖片失敗' })
      }
    },
    [issueId, showToast]
  )

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (title.length < 5) {
      newErrors.title = '標題至少需要 5 個字元'
    }
    if (title.length > 200) {
      newErrors.title = '標題不能超過 200 個字元'
    }
    if (whyBackground.length < 10) {
      newErrors.whyBackground = '背景說明至少需要 10 個字元'
    }
    if (currentBehavior.length < 10) {
      newErrors.currentBehavior = '目前行為說明至少需要 10 個字元'
    }
    if (expectedBehavior.length < 10) {
      newErrors.expectedBehavior = '預期行為說明至少需要 10 個字元'
    }
    if (acceptanceCriteria.length < 10) {
      newErrors.acceptanceCriteria = '驗收條件至少需要 10 個字元'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [title, whyBackground, currentBehavior, expectedBehavior, acceptanceCriteria])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      if (!validate()) return

      startTransition(async () => {
        const formData = {
          title,
          category,
          priority,
          why_background: whyBackground,
          current_behavior: currentBehavior,
          expected_behavior: expectedBehavior,
          acceptance_criteria: acceptanceCriteria,
          image_ids: imageIds,
        }

        if (mode === 'create') {
          const result = await createIssue(formData)
          if (result.success && result.issueId) {
            router.push(`/issues/${result.issueId}`)
          } else {
            showToast({ type: 'error', message: result.error || '建立失敗' })
          }
        } else if (issueId) {
          const result = await updateIssue(issueId, formData)
          if (result.success) {
            router.push(`/issues/${issueId}`)
          } else {
            showToast({ type: 'error', message: result.error || '更新失敗' })
          }
        }
      })
    },
    [
      validate,
      mode,
      issueId,
      title,
      category,
      priority,
      whyBackground,
      currentBehavior,
      expectedBehavior,
      acceptanceCriteria,
      imageIds,
      router,
      showToast,
    ]
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          標題 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例：首頁載入速度過慢"
          className={`w-full rounded-lg border px-4 py-3 text-foreground placeholder:text-zinc-600 focus:outline-none focus:ring-2 ${
            errors.title
              ? 'border-red-500 focus:ring-red-500'
              : 'border-zinc-700 bg-zinc-800 focus:ring-primary focus:border-primary'
          }`}
        />
        {errors.title && <p className="mt-1.5 text-sm text-red-400">{errors.title}</p>}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-3">
          分類 <span className="text-red-400">*</span>
        </label>
        <CategorySelector category={category} onChange={setCategory} />
      </div>

      {/* Priority */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-3">
          優先度 <span className="text-red-400">*</span>
        </label>
        <PrioritySelector priority={priority} onChange={setPriority} />
      </div>

      {/* Background */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          背景說明 <span className="text-red-400">*</span>
        </label>
        <p className="text-xs text-zinc-500 mb-2">說明為什麼需要處理這個問題</p>
        <textarea
          value={whyBackground}
          onChange={(e) => setWhyBackground(e.target.value)}
          placeholder="1. 使用者反映結帳時顯示錯誤的總金額&#10;2. 影響用戶體驗與信任度"
          rows={4}
          className={`w-full rounded-lg border px-4 py-3 text-foreground placeholder:text-zinc-600 focus:outline-none focus:ring-2 ${
            errors.whyBackground
              ? 'border-red-500 focus:ring-red-500'
              : 'border-zinc-700 bg-zinc-800 focus:ring-primary focus:border-primary'
          }`}
        />
        {errors.whyBackground && <p className="mt-1.5 text-sm text-red-400">{errors.whyBackground}</p>}
      </div>

      {/* Current vs Expected Behavior */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            目前行為 <span className="text-red-400">*</span>
          </label>
          <textarea
            value={currentBehavior}
            onChange={(e) => setCurrentBehavior(e.target.value)}
            placeholder="描述目前系統的行為"
            rows={4}
            className={`w-full rounded-lg border px-4 py-3 text-foreground placeholder:text-zinc-600 focus:outline-none focus:ring-2 ${
              errors.currentBehavior
                ? 'border-red-500 focus:ring-red-500'
                : 'border-zinc-700 bg-zinc-800 focus:ring-primary focus:border-primary'
            }`}
          />
          {errors.currentBehavior && <p className="mt-1.5 text-sm text-red-400">{errors.currentBehavior}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            預期行為 <span className="text-red-400">*</span>
          </label>
          <textarea
            value={expectedBehavior}
            onChange={(e) => setExpectedBehavior(e.target.value)}
            placeholder="描述期望的行為"
            rows={4}
            className={`w-full rounded-lg border px-4 py-3 text-foreground placeholder:text-zinc-600 focus:outline-none focus:ring-2 ${
              errors.expectedBehavior
                ? 'border-red-500 focus:ring-red-500'
                : 'border-zinc-700 bg-zinc-800 focus:ring-primary focus:border-primary'
            }`}
          />
          {errors.expectedBehavior && <p className="mt-1.5 text-sm text-red-400">{errors.expectedBehavior}</p>}
        </div>
      </div>

      {/* Acceptance Criteria */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          驗收條件 <span className="text-red-400">*</span>
        </label>
        <p className="text-xs text-zinc-500 mb-2">列出如何驗證問題已解決</p>
        <textarea
          value={acceptanceCriteria}
          onChange={(e) => setAcceptanceCriteria(e.target.value)}
          placeholder="✅ 情境 A：預期結果 X&#10;✅ 情境 B：預期結果 Y"
          rows={4}
          className={`w-full rounded-lg border px-4 py-3 text-foreground placeholder:text-zinc-600 focus:outline-none focus:ring-2 ${
            errors.acceptanceCriteria
              ? 'border-red-500 focus:ring-red-500'
              : 'border-zinc-700 bg-zinc-800 focus:ring-primary focus:border-primary'
          }`}
        />
        {errors.acceptanceCriteria && <p className="mt-1.5 text-sm text-red-400">{errors.acceptanceCriteria}</p>}
      </div>

      {/* Image Uploads */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">附加圖片</label>
        <p className="text-xs text-zinc-500 mb-3">上傳截圖或相關圖片</p>
        <ImageUploader
          onImagesReady={setImageIds}
          existingImages={existingImages.map((img) => ({
            id: img.id,
            url: img.url || '',
            filename: img.filename,
          }))}
          onRemoveExisting={mode === 'edit' ? handleRemoveExisting : undefined}
        />
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-zinc-800">
        <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isPending}>
          取消
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? '處理中...' : mode === 'create' ? '建立項目' : '儲存變更'}
        </Button>
      </div>
    </form>
  )
}

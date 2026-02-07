import { z } from 'zod'

// ============================================
// Issue Validation Schemas (Simplified)
// ============================================

// Enum schemas
export const issueCategorySchema = z.enum(['fix', 'wish'])
export const issuePrioritySchema = z.enum(['low', 'medium', 'high'])
export const issueStatusSchema = z.enum(['not_started', 'in_progress', 'done', 'cancelled'])

// Create issue schema (simplified)
export const createIssueSchema = z.object({
  title: z
    .string()
    .min(5, '標題至少需要 5 個字元')
    .max(200, '標題不能超過 200 個字元'),
  category: issueCategorySchema,
  priority: issuePrioritySchema,
  why_background: z
    .string()
    .min(10, '背景說明至少需要 10 個字元')
    .max(5000, '背景說明不能超過 5000 個字元'),
  current_behavior: z
    .string()
    .min(10, '目前行為說明至少需要 10 個字元')
    .max(5000, '目前行為說明不能超過 5000 個字元'),
  expected_behavior: z
    .string()
    .min(10, '預期行為說明至少需要 10 個字元')
    .max(5000, '預期行為說明不能超過 5000 個字元'),
  acceptance_criteria: z
    .string()
    .min(10, '驗收條件至少需要 10 個字元')
    .max(5000, '驗收條件不能超過 5000 個字元'),
  image_ids: z.array(z.string().uuid()).optional(),
})

// Update issue schema
export const updateIssueSchema = z.object({
  title: z
    .string()
    .min(5, '標題至少需要 5 個字元')
    .max(200, '標題不能超過 200 個字元')
    .optional(),
  category: issueCategorySchema.optional(),
  priority: issuePrioritySchema.optional(),
  status: issueStatusSchema.optional(),
  why_background: z
    .string()
    .min(10, '背景說明至少需要 10 個字元')
    .max(5000, '背景說明不能超過 5000 個字元')
    .optional(),
  current_behavior: z
    .string()
    .min(10, '目前行為說明至少需要 10 個字元')
    .max(5000, '目前行為說明不能超過 5000 個字元')
    .optional(),
  expected_behavior: z
    .string()
    .min(10, '預期行為說明至少需要 10 個字元')
    .max(5000, '預期行為說明不能超過 5000 個字元')
    .optional(),
  acceptance_criteria: z
    .string()
    .min(10, '驗收條件至少需要 10 個字元')
    .max(5000, '驗收條件不能超過 5000 個字元')
    .optional(),
  image_ids: z.array(z.string().uuid()).optional(),
})

// Status update schema
export const updateStatusSchema = z.object({
  status: issueStatusSchema,
})

// Priority update schema
export const updatePrioritySchema = z.object({
  priority: issuePrioritySchema,
})

// Image presign request schema
export const presignImageSchema = z.object({
  filename: z
    .string()
    .min(1, '檔案名稱為必填')
    .max(255, '檔案名稱太長'),
  content_type: z
    .string()
    .refine(
      (type) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(type),
      '僅支援 jpg, jpeg, png, webp 格式'
    ),
  size: z
    .number()
    .min(1, '檔案大小必須大於 0')
    .max(10 * 1024 * 1024, '檔案大小不能超過 10MB'),
  issue_id: z.string().uuid().optional(),
})

// Confirm upload schema
export const confirmUploadSchema = z.object({
  image_id: z.string().uuid('無效的圖片 ID'),
})

// Filter schema for list endpoint (simplified)
export const issueFiltersSchema = z.object({
  category: z.string().optional().default('all'),
  status: z.string().optional().default('all'),
  priority: z.string().optional().default('all'),
  search: z.string().optional(),
  created_by: z.string().uuid().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

// Export types from schemas
export type CreateIssueInput = z.infer<typeof createIssueSchema>
export type UpdateIssueInput = z.infer<typeof updateIssueSchema>
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>
export type UpdatePriorityInput = z.infer<typeof updatePrioritySchema>
export type PresignImageInput = z.infer<typeof presignImageSchema>
export type ConfirmUploadInput = z.infer<typeof confirmUploadSchema>
export type IssueFiltersInput = z.input<typeof issueFiltersSchema>
export type IssueFiltersOutput = z.output<typeof issueFiltersSchema>

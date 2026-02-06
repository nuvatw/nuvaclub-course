// ============================================
// Issue Types - Simplified Version
// ============================================

// Simplified enum types
export type IssueCategory = 'fix' | 'wish'
export type IssuePriority = 'low' | 'medium' | 'high'
export type IssueStatus = 'not_started' | 'in_progress' | 'done' | 'cancelled'

// Issue record from database (simplified)
export interface Issue {
  id: string
  issue_number: number
  title: string
  category: IssueCategory
  priority: IssuePriority
  status: IssueStatus
  why_background: string | null
  current_behavior: string | null
  expected_behavior: string | null
  acceptance_criteria: string | null
  created_by: string
  created_at: string
  updated_at: string
}

// Issue with creator profile joined
export interface IssueWithCreator extends Issue {
  creator: {
    id: string
    email: string
    full_name: string | null
  } | null
}

// Issue with images and creator
export interface IssueWithDetails extends IssueWithCreator {
  images: IssueImage[]
}

// Issue image record from database
export interface IssueImage {
  id: string
  issue_id: string | null
  object_key: string
  filename: string
  content_type: string
  size: number
  url: string | null
  uploaded: boolean
  uploaded_by: string
  created_at: string
}

// Form data for creating/editing issues (simplified)
export interface IssueFormData {
  title: string
  category: IssueCategory
  priority: IssuePriority
  why_background: string
  current_behavior: string
  expected_behavior: string
  acceptance_criteria: string
  image_ids?: string[]
}

// Filter options for issue list (simplified)
export interface IssueFilters {
  category?: IssueCategory | 'all'
  status?: IssueStatus | 'all'
  priority?: IssuePriority | 'all'
  search?: string
  createdBy?: string
}

// Pagination params
export interface PaginationParams {
  page: number
  limit: number
}

// Paginated response
export interface PaginatedIssues {
  issues: IssueWithCreator[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Presign response for image upload
export interface PresignResponse {
  uploadUrl: string
  objectKey: string
  imageId: string
}

// ============================================
// Label mappings for UI display (Bilingual)
// ============================================

export const ISSUE_CATEGORY_LABELS: Record<IssueCategory, { en: string; zh: string }> = {
  fix: { en: 'Fix', zh: '修理' },
  wish: { en: 'Wish', zh: '願望' },
}

export const ISSUE_CATEGORY_COLORS: Record<IssueCategory, string> = {
  fix: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',
  wish: 'bg-violet-500/15 text-violet-400 border border-violet-500/30',
}

export const ISSUE_PRIORITY_LABELS: Record<IssuePriority, { en: string; zh: string }> = {
  low: { en: 'Low', zh: '低' },
  medium: { en: 'Medium', zh: '中' },
  high: { en: 'High', zh: '高' },
}

export const ISSUE_STATUS_LABELS: Record<IssueStatus, { en: string; zh: string }> = {
  not_started: { en: 'Not Started', zh: '尚未開始' },
  in_progress: { en: 'In Progress', zh: '執行中' },
  done: { en: 'Done', zh: '完成' },
  cancelled: { en: 'Cancelled', zh: '撤銷' },
}

// Priority colors - simplified to dots
export const ISSUE_PRIORITY_COLORS: Record<IssuePriority, string> = {
  low: 'bg-blue-500',
  medium: 'bg-yellow-500',
  high: 'bg-red-500',
}

// Status colors - differentiated for accessibility (WCAG 4.5:1 contrast ratio)
export const ISSUE_STATUS_COLORS: Record<IssueStatus, string> = {
  not_started: 'bg-zinc-600 text-white',
  in_progress: 'bg-amber-600 text-white',
  done: 'bg-emerald-600 text-white',
  cancelled: 'bg-zinc-500 text-white',
}

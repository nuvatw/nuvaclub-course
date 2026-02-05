// ============================================
// Issue Types - Simplified Version
// ============================================

// Simplified enum types
export type IssuePriority = 'low' | 'medium' | 'high'
export type IssueStatus = 'not_started' | 'in_progress' | 'done' | 'cancelled'

// Issue record from database (simplified)
export interface Issue {
  id: string
  issue_number: number
  title: string
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
  priority: IssuePriority
  why_background: string
  current_behavior: string
  expected_behavior: string
  acceptance_criteria: string
  image_ids?: string[]
}

// Filter options for issue list (simplified)
export interface IssueFilters {
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

// Status colors - simplified
export const ISSUE_STATUS_COLORS: Record<IssueStatus, string> = {
  not_started: 'bg-zinc-600 text-zinc-200',
  in_progress: 'bg-zinc-600 text-zinc-200',
  done: 'bg-zinc-600 text-zinc-200',
  cancelled: 'bg-zinc-600 text-zinc-200',
}

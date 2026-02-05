'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  createIssueSchema,
  updateIssueSchema,
  updateStatusSchema,
  updatePrioritySchema,
  issueFiltersSchema,
  type CreateIssueInput,
  type UpdateIssueInput,
  type UpdateStatusInput,
  type UpdatePriorityInput,
  type IssueFiltersInput,
} from '@/lib/validations/issue'
import {
  type IssueWithCreator,
  type IssueWithDetails,
  type PaginatedIssues,
  type IssueImage,
} from '@/types/issues'
import { deleteObject, deleteObjects, getPublicUrl, generatePresignedGetUrl } from '@/lib/r2'
import { sanitizeSearchInput } from '@/lib/sanitize'

// ============================================
// Helper Functions
// ============================================

async function getCurrentUserId(): Promise<string> {
  const supabase = await createClient()
  if (!supabase) {
    throw new Error('資料庫未設定')
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('未登入')
  }

  return user.id
}

async function isAdmin(): Promise<boolean> {
  const supabase = await createClient()
  if (!supabase) return false

  const { data, error } = await supabase.rpc('is_current_user_admin')
  if (error) {
    console.error('Error checking admin status:', error)
    return false
  }
  return data === true
}

// ============================================
// Issue CRUD Operations
// ============================================

/**
 * Create a new issue (simplified)
 */
export async function createIssue(input: CreateIssueInput): Promise<{ success: boolean; issueId?: string; error?: string }> {
  try {
    const userId = await getCurrentUserId()
    const supabase = await createClient()
    if (!supabase) throw new Error('資料庫未設定')

    // Validate input
    const validated = createIssueSchema.parse(input)

    // Create the issue
    const { data: issue, error: issueError } = await supabase
      .from('issues')
      .insert({
        title: validated.title,
        priority: validated.priority,
        status: 'not_started',
        why_background: validated.why_background,
        current_behavior: validated.current_behavior,
        expected_behavior: validated.expected_behavior,
        acceptance_criteria: validated.acceptance_criteria,
        created_by: userId,
      })
      .select('id')
      .single()

    if (issueError) {
      console.error('Error creating issue:', issueError)
      throw new Error('無法建立問題')
    }

    // Link uploaded images to the issue
    if (validated.image_ids && validated.image_ids.length > 0) {
      const { error: linkError } = await supabase
        .from('issue_images')
        .update({ issue_id: issue.id })
        .in('id', validated.image_ids)
        .eq('uploaded', true)
        .eq('uploaded_by', userId)

      if (linkError) {
        console.error('Error linking images:', linkError)
      }
    }

    revalidatePath('/issues')
    return { success: true, issueId: issue.id }
  } catch (error) {
    console.error('createIssue error:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: '發生未知錯誤' }
  }
}

/**
 * Get paginated list of issues with filters (simplified)
 */
export async function getIssues(filters?: IssueFiltersInput): Promise<PaginatedIssues> {
  const supabase = await createClient()
  if (!supabase) return { issues: [], total: 0, page: 1, limit: 20, totalPages: 0 }

  // Validate and set defaults for filters
  const validated = issueFiltersSchema.parse(filters || {})
  const { page, limit, status, priority, search, created_by } = validated

  // Calculate offset
  const offset = (page - 1) * limit

  // Build query
  let query = supabase
    .from('issues')
    .select(
      `
      *,
      creator:profiles!issues_created_by_fkey(id, email, full_name)
    `,
      { count: 'exact' }
    )

  // Apply filters
  if (status && status !== 'all') {
    query = query.eq('status', status)
  }
  if (priority && priority !== 'all') {
    query = query.eq('priority', priority)
  }
  if (created_by) {
    query = query.eq('created_by', created_by)
  }
  if (search) {
    const sanitizedSearch = sanitizeSearchInput(search)
    query = query.ilike('title', `%${sanitizedSearch}%`)
  }

  // Apply pagination and ordering
  query = query.order('updated_at', { ascending: false }).range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching issues:', error)
    return { issues: [], total: 0, page, limit, totalPages: 0 }
  }

  const total = count || 0
  const totalPages = Math.ceil(total / limit)

  return {
    issues: data as IssueWithCreator[],
    total,
    page,
    limit,
    totalPages,
  }
}

/**
 * Get a single issue by ID with all details
 */
export async function getIssueById(id: string): Promise<IssueWithDetails | null> {
  const supabase = await createClient()
  if (!supabase) return null

  // Fetch issue with creator
  const { data: issue, error: issueError } = await supabase
    .from('issues')
    .select(
      `
      *,
      creator:profiles!issues_created_by_fkey(id, email, full_name)
    `
    )
    .eq('id', id)
    .single()

  if (issueError || !issue) {
    // PGRST116 = "not found" - don't log this as it's expected after deletion
    if (issueError?.code !== 'PGRST116') {
      console.error('Error fetching issue:', issueError)
    }
    return null
  }

  // Fetch images
  const { data: images, error: imagesError } = await supabase
    .from('issue_images')
    .select('*')
    .eq('issue_id', id)
    .eq('uploaded', true)
    .order('created_at', { ascending: true })

  if (imagesError) {
    console.error('Error fetching images:', imagesError)
  }

  // Fill in missing URLs for images
  const imagesWithUrls = await Promise.all(
    (images || []).map(async (img) => {
      if (img.url) return img
      const publicUrl = getPublicUrl(img.object_key)
      if (publicUrl) {
        return { ...img, url: publicUrl }
      }
      const presignedUrl = await generatePresignedGetUrl(img.object_key)
      return { ...img, url: presignedUrl }
    })
  )

  return {
    ...issue,
    images: imagesWithUrls as IssueImage[],
  } as IssueWithDetails
}

/**
 * Update an issue
 */
export async function updateIssue(
  id: string,
  input: UpdateIssueInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId()
    const supabase = await createClient()
    if (!supabase) throw new Error('資料庫未設定')

    // Validate input
    const validated = updateIssueSchema.parse(input)

    // Check if user can edit this issue
    const { data: issue } = await supabase.from('issues').select('created_by').eq('id', id).single()

    if (!issue) {
      throw new Error('找不到此問題')
    }

    const isCreator = issue.created_by === userId
    const isAdminUser = await isAdmin()

    if (!isCreator && !isAdminUser) {
      throw new Error('沒有權限編輯此問題')
    }

    // Build update object
    const updateData: Record<string, unknown> = {}

    if (validated.title !== undefined) updateData.title = validated.title
    if (validated.priority !== undefined) updateData.priority = validated.priority
    if (validated.status !== undefined) updateData.status = validated.status
    if (validated.why_background !== undefined) updateData.why_background = validated.why_background
    if (validated.current_behavior !== undefined) updateData.current_behavior = validated.current_behavior
    if (validated.expected_behavior !== undefined) updateData.expected_behavior = validated.expected_behavior
    if (validated.acceptance_criteria !== undefined) updateData.acceptance_criteria = validated.acceptance_criteria

    // Update the issue
    const { error: updateError } = await supabase.from('issues').update(updateData).eq('id', id)

    if (updateError) {
      console.error('Error updating issue:', updateError)
      throw new Error('無法更新問題')
    }

    // Link new images if provided
    if (validated.image_ids && validated.image_ids.length > 0) {
      const { error: linkError } = await supabase
        .from('issue_images')
        .update({ issue_id: id })
        .in('id', validated.image_ids)
        .eq('uploaded', true)
        .eq('uploaded_by', userId)

      if (linkError) {
        console.error('Error linking new images:', linkError)
      }
    }

    revalidatePath('/issues')
    revalidatePath(`/issues/${id}`)
    return { success: true }
  } catch (error) {
    console.error('updateIssue error:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: '發生未知錯誤' }
  }
}

/**
 * Update issue status
 */
export async function updateIssueStatus(
  id: string,
  input: UpdateStatusInput
): Promise<{ success: boolean; error?: string }> {
  try {
    await getCurrentUserId()
    const supabase = await createClient()
    if (!supabase) throw new Error('資料庫未設定')

    const validated = updateStatusSchema.parse(input)

    const { error: updateError } = await supabase
      .from('issues')
      .update({ status: validated.status })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating status:', updateError)
      throw new Error('無法更新狀態')
    }

    revalidatePath('/issues')
    revalidatePath(`/issues/${id}`)
    return { success: true }
  } catch (error) {
    console.error('updateIssueStatus error:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: '發生未知錯誤' }
  }
}

/**
 * Update issue priority
 */
export async function updateIssuePriority(
  id: string,
  input: UpdatePriorityInput
): Promise<{ success: boolean; error?: string }> {
  try {
    await getCurrentUserId()
    const supabase = await createClient()
    if (!supabase) throw new Error('資料庫未設定')

    const validated = updatePrioritySchema.parse(input)

    const { error: updateError } = await supabase
      .from('issues')
      .update({ priority: validated.priority })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating priority:', updateError)
      throw new Error('無法更新優先度')
    }

    revalidatePath('/issues')
    revalidatePath(`/issues/${id}`)
    return { success: true }
  } catch (error) {
    console.error('updateIssuePriority error:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: '發生未知錯誤' }
  }
}

/**
 * Delete an issue
 */
export async function deleteIssue(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId()
    const supabase = await createClient()
    if (!supabase) throw new Error('資料庫未設定')

    const { data: issue } = await supabase
      .from('issues')
      .select('created_by')
      .eq('id', id)
      .single()

    if (!issue) {
      throw new Error('找不到此問題')
    }

    const isCreator = issue.created_by === userId
    const isAdminUser = await isAdmin()

    if (!isCreator && !isAdminUser) {
      throw new Error('沒有權限刪除此問題')
    }

    const { data: images } = await supabase
      .from('issue_images')
      .select('object_key')
      .eq('issue_id', id)

    const { error: deleteError } = await supabase.from('issues').delete().eq('id', id)

    if (deleteError) {
      console.error('Error deleting issue:', deleteError)
      throw new Error('無法刪除問題')
    }

    if (images && images.length > 0) {
      try {
        await deleteObjects(images.map((img) => img.object_key))
      } catch (r2Error) {
        console.error('Error deleting images from R2:', r2Error)
      }
    }

    revalidatePath('/issues')
    return { success: true }
  } catch (error) {
    console.error('deleteIssue error:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: '發生未知錯誤' }
  }
}

/**
 * Delete an image from an issue
 */
export async function deleteIssueImage(
  issueId: string,
  imageId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId()
    const supabase = await createClient()
    if (!supabase) throw new Error('資料庫未設定')

    const { data: image } = await supabase
      .from('issue_images')
      .select('object_key, uploaded_by, issue_id')
      .eq('id', imageId)
      .single()

    if (!image) {
      throw new Error('找不到此圖片')
    }

    const isUploader = image.uploaded_by === userId

    let isIssueCreator = false
    if (image.issue_id) {
      const { data: issue } = await supabase
        .from('issues')
        .select('created_by')
        .eq('id', image.issue_id)
        .single()
      isIssueCreator = issue?.created_by === userId
    }

    const isAdminUser = await isAdmin()

    if (!isUploader && !isIssueCreator && !isAdminUser) {
      throw new Error('沒有權限刪除此圖片')
    }

    const { error: deleteError } = await supabase.from('issue_images').delete().eq('id', imageId)

    if (deleteError) {
      console.error('Error deleting image record:', deleteError)
      throw new Error('無法刪除圖片')
    }

    try {
      await deleteObject(image.object_key)
    } catch (r2Error) {
      console.error('Error deleting from R2:', r2Error)
    }

    revalidatePath(`/issues/${issueId}`)
    return { success: true }
  } catch (error) {
    console.error('deleteIssueImage error:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: '發生未知錯誤' }
  }
}

/**
 * Check if current user can edit an issue
 */
export async function canEditIssue(issueId: string): Promise<boolean> {
  try {
    const userId = await getCurrentUserId()
    const supabase = await createClient()
    if (!supabase) return false

    const { data: issue } = await supabase
      .from('issues')
      .select('created_by')
      .eq('id', issueId)
      .single()

    if (!issue) return false
    if (issue.created_by === userId) return true

    return await isAdmin()
  } catch {
    return false
  }
}

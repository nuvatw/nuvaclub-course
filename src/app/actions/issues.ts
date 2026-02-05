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

/**
 * Retrieves the current authenticated user's ID
 * @returns The user's UUID
 * @throws Error if database is not configured or user is not authenticated
 */
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

/**
 * Checks if the current authenticated user has admin privileges
 * @returns True if the user is an admin, false otherwise (including on error)
 */
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
 * Creates a new issue in the system
 *
 * @param input - The issue data to create
 * @param input.title - Issue title (required)
 * @param input.priority - Priority level: 'low', 'medium', or 'high'
 * @param input.why_background - Background context for the issue
 * @param input.current_behavior - Description of current behavior
 * @param input.expected_behavior - Description of expected behavior
 * @param input.acceptance_criteria - Criteria for issue completion
 * @param input.image_ids - Array of pre-uploaded image IDs to attach
 * @returns Object with success status, issue ID on success, or error message on failure
 *
 * @example
 * const result = await createIssue({
 *   title: 'Login button not working',
 *   priority: 'high',
 *   current_behavior: 'Button does nothing when clicked',
 *   expected_behavior: 'Should navigate to login page',
 * })
 * if (result.success) {
 *   console.log('Created issue:', result.issueId)
 * }
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
 * Retrieves a paginated list of issues with optional filtering
 *
 * @param filters - Optional filter and pagination parameters
 * @param filters.page - Page number (default: 1)
 * @param filters.limit - Items per page (default: 20)
 * @param filters.status - Filter by status: 'all', 'not_started', 'in_progress', 'done', 'cancelled'
 * @param filters.priority - Filter by priority: 'all', 'low', 'medium', 'high'
 * @param filters.search - Search term to filter by title (case-insensitive)
 * @param filters.created_by - Filter by creator's user ID
 * @returns Paginated response with issues array and metadata
 *
 * @example
 * // Get high priority issues on page 2
 * const result = await getIssues({
 *   page: 2,
 *   priority: 'high',
 *   status: 'in_progress',
 * })
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
 * Retrieves a single issue by ID with all related details including images
 *
 * @param id - The UUID of the issue to retrieve
 * @returns The issue with creator and images, or null if not found
 *
 * @example
 * const issue = await getIssueById('123e4567-e89b-12d3-a456-426614174000')
 * if (issue) {
 *   console.log(issue.title, issue.images.length)
 * }
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
 * Updates an existing issue
 *
 * Only the issue creator or an admin can update an issue.
 * All fields are optional - only provided fields will be updated.
 *
 * @param id - The UUID of the issue to update
 * @param input - The fields to update (all optional)
 * @returns Object with success status and optional error message
 * @throws Returns error if user lacks permission or issue not found
 *
 * @example
 * const result = await updateIssue('issue-uuid', {
 *   title: 'Updated title',
 *   status: 'in_progress',
 *   image_ids: ['new-image-id'], // Attach new images
 * })
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
 * Updates only the status of an issue
 *
 * Any authenticated user can update issue status (no ownership check).
 * This is a lightweight operation for quick status changes.
 *
 * @param id - The UUID of the issue to update
 * @param input - Object containing the new status
 * @param input.status - New status: 'not_started', 'in_progress', 'done', 'cancelled'
 * @returns Object with success status and optional error message
 *
 * @example
 * await updateIssueStatus('issue-uuid', { status: 'done' })
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
 * Updates only the priority of an issue
 *
 * Any authenticated user can update issue priority (no ownership check).
 * This is a lightweight operation for quick priority changes.
 *
 * @param id - The UUID of the issue to update
 * @param input - Object containing the new priority
 * @param input.priority - New priority: 'low', 'medium', 'high'
 * @returns Object with success status and optional error message
 *
 * @example
 * await updateIssuePriority('issue-uuid', { priority: 'high' })
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
 * Deletes an issue and all associated images
 *
 * Only the issue creator or an admin can delete an issue.
 * This operation also removes all associated images from R2 storage.
 *
 * @param id - The UUID of the issue to delete
 * @returns Object with success status and optional error message
 * @throws Returns error if user lacks permission or issue not found
 *
 * @example
 * const result = await deleteIssue('issue-uuid')
 * if (result.success) {
 *   redirect('/issues')
 * }
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
 * Deletes a single image from an issue
 *
 * Permission is granted to: the image uploader, the issue creator, or an admin.
 * The image is removed from both the database and R2 storage.
 *
 * @param issueId - The UUID of the parent issue (used for path revalidation)
 * @param imageId - The UUID of the image to delete
 * @returns Object with success status and optional error message
 * @throws Returns error if user lacks permission or image not found
 *
 * @example
 * const result = await deleteIssueImage('issue-uuid', 'image-uuid')
 * if (!result.success) {
 *   showToast({ type: 'error', message: result.error })
 * }
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
 * Checks if the current user has permission to edit a specific issue
 *
 * Returns true if the user is the issue creator or an admin.
 * Safe to call without authentication - returns false on any error.
 *
 * @param issueId - The UUID of the issue to check
 * @returns True if user can edit, false otherwise
 *
 * @example
 * const canEdit = await canEditIssue('issue-uuid')
 * if (canEdit) {
 *   showEditButton()
 * }
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

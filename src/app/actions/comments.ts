'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getComments(projectId: string) {
  const supabase = await createClient()
  if (!supabase) return []

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    // Comments are only visible to authenticated users
    return []
  }

  const { data: comments, error } = await supabase
    .from('project_comments')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching comments:', error)
    return []
  }

  return comments
}

export async function createComment(formData: FormData) {
  const supabase = await createClient()
  if (!supabase) throw new Error('Database not configured')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, onboarding_completed')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.onboarding_completed) {
    throw new Error('Please complete onboarding first')
  }

  const projectId = formData.get('projectId') as string
  const body = formData.get('body') as string

  if (!projectId || !body) {
    throw new Error('Missing required fields')
  }

  const { error } = await supabase.from('project_comments').insert({
    project_id: projectId,
    author_id: user.id,
    author_name: profile.full_name || user.email || 'Unknown',
    body,
  })

  if (error) {
    throw new Error('Failed to create comment')
  }

  revalidatePath(`/projects/${projectId}`)
}

export async function deleteComment(commentId: string, projectId: string) {
  const supabase = await createClient()
  if (!supabase) {
    return { success: false, error: '資料庫未設定' }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: '請先登入' }
  }

  // Check if admin
  const { data: isAdmin } = await supabase.rpc('is_admin', { user_id: user.id })

  // Check if user is the comment author
  const { data: comment } = await supabase
    .from('project_comments')
    .select('author_id')
    .eq('id', commentId)
    .single()

  if (!comment) {
    return { success: false, error: '找不到此留言' }
  }

  const isAuthor = comment.author_id === user.id

  if (!isAdmin && !isAuthor) {
    return { success: false, error: '沒有權限刪除此留言' }
  }

  const { error } = await supabase
    .from('project_comments')
    .delete()
    .eq('id', commentId)

  if (error) {
    console.error('Error deleting comment:', error)
    return { success: false, error: '刪除留言失敗' }
  }

  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}

export async function canDeleteComment(commentId: string): Promise<boolean> {
  const supabase = await createClient()
  if (!supabase) return false

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  // Check if admin
  const { data: isAdmin } = await supabase.rpc('is_admin', { user_id: user.id })
  if (isAdmin) return true

  // Check if author
  const { data: comment } = await supabase
    .from('project_comments')
    .select('author_id')
    .eq('id', commentId)
    .single()

  return comment?.author_id === user.id
}

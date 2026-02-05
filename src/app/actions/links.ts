'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createLink(formData: FormData) {
  const supabase = await createClient()
  if (!supabase) throw new Error('Database not configured')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  // Check if admin
  const { data: isAdmin } = await supabase.rpc('is_admin', { user_id: user.id })
  if (!isAdmin) {
    throw new Error('Only admins can create links')
  }

  const projectId = formData.get('projectId') as string
  const stepId = formData.get('stepId') as string
  const title = formData.get('title') as string
  const url = formData.get('url') as string
  const visibility = formData.get('visibility') as 'public' | 'private'
  const linkType = formData.get('linkType') as string

  if (!projectId || !stepId || !title || !url || !visibility) {
    throw new Error('Missing required fields')
  }

  const { error } = await supabase.from('step_links').insert({
    project_id: projectId,
    step_id: stepId,
    title,
    url,
    visibility,
    link_type: linkType || null,
    created_by: user.id,
  })

  if (error) {
    throw new Error('Failed to create link')
  }

  revalidatePath('/', 'layout')
  revalidatePath(`/projects/${projectId}`)
}

export async function updateLink(formData: FormData) {
  const supabase = await createClient()
  if (!supabase) throw new Error('Database not configured')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  // Check if admin
  const { data: isAdmin } = await supabase.rpc('is_admin', { user_id: user.id })
  if (!isAdmin) {
    throw new Error('Only admins can update links')
  }

  const linkId = formData.get('linkId') as string
  const projectId = formData.get('projectId') as string
  const title = formData.get('title') as string
  const url = formData.get('url') as string
  const visibility = formData.get('visibility') as 'public' | 'private'
  const linkType = formData.get('linkType') as string

  if (!linkId || !title || !url || !visibility) {
    throw new Error('Missing required fields')
  }

  const { error } = await supabase
    .from('step_links')
    .update({
      title,
      url,
      visibility,
      link_type: linkType || null,
    })
    .eq('id', linkId)

  if (error) {
    throw new Error('Failed to update link')
  }

  revalidatePath('/', 'layout')
  revalidatePath(`/projects/${projectId}`)
}

export async function deleteLink(linkId: string, projectId: string) {
  const supabase = await createClient()
  if (!supabase) throw new Error('Database not configured')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  // Check if admin
  const { data: isAdmin } = await supabase.rpc('is_admin', { user_id: user.id })
  if (!isAdmin) {
    throw new Error('Only admins can delete links')
  }

  const { error } = await supabase
    .from('step_links')
    .delete()
    .eq('id', linkId)

  if (error) {
    throw new Error('Failed to delete link')
  }

  revalidatePath('/', 'layout')
  revalidatePath(`/projects/${projectId}`)
}

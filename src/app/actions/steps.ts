'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function completeStep(projectId: string, stepId: string, actualHours: number) {
  const supabase = await createClient()
  if (!supabase) throw new Error('Database not configured')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  // Check if admin
  const { data: isAdmin } = await supabase.rpc('is_admin', { user_id: user.id })
  if (!isAdmin) {
    throw new Error('Only admins can complete steps')
  }

  // Get the step
  const { data: step } = await supabase
    .from('project_steps')
    .select('step_index')
    .eq('id', stepId)
    .single()

  if (!step) {
    throw new Error('Step not found')
  }

  // Mark step as done with actual hours
  const { error: updateError } = await supabase
    .from('project_steps')
    .update({
      status: 'done',
      actual_hours: actualHours,
      completed_at: new Date().toISOString(),
    })
    .eq('id', stepId)

  if (updateError) {
    throw new Error('Failed to complete step')
  }

  // Update project's current step index
  const { error: projectError } = await supabase
    .from('projects')
    .update({
      current_step_index: step.step_index + 1,
    })
    .eq('id', projectId)

  if (projectError) {
    console.error('Failed to update project step index:', projectError)
  }

  // Set next step to in_progress if it exists
  await supabase
    .from('project_steps')
    .update({
      status: 'in_progress',
      started_at: new Date().toISOString(),
    })
    .eq('project_id', projectId)
    .eq('step_index', step.step_index + 1)

  // Invalidate caches
  revalidatePath('/', 'layout')
  revalidatePath(`/projects/${projectId}`)
}

export async function startStep(projectId: string, stepId: string) {
  const supabase = await createClient()
  if (!supabase) throw new Error('Database not configured')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  // Check if admin
  const { data: isAdmin } = await supabase.rpc('is_admin', { user_id: user.id })
  if (!isAdmin) {
    throw new Error('Only admins can start steps')
  }

  const { error } = await supabase
    .from('project_steps')
    .update({
      status: 'in_progress',
      started_at: new Date().toISOString(),
    })
    .eq('id', stepId)

  if (error) {
    throw new Error('Failed to start step')
  }

  // Invalidate caches
  revalidatePath('/', 'layout')
  revalidatePath(`/projects/${projectId}`)
}

// Get step time averages for creating new projects
export async function getStepTimeAverages() {
  const supabase = await createClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('step_time_averages')
    .select('*')
    .order('step_index')

  if (error) {
    console.error('Failed to fetch step time averages:', error)
    return null
  }

  return data
}

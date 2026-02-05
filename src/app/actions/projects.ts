'use server'

import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { PRODUCTION_STEPS } from '@/lib/constants/steps'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Use React cache for request deduplication within a single request
const fetchProjects = cache(async () => {
  const supabase = await createClient()
  if (!supabase) return []

  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      *,
      project_steps (*)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }

  return projects
})

const fetchProject = cache(async (id: string) => {
  const supabase = await createClient()
  if (!supabase) return null

  const { data: project, error } = await supabase
    .from('projects')
    .select(`
      *,
      project_steps (
        *,
        step_links (*)
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    // PGRST116 = "not found" - don't log this as it's expected after deletion
    if (error.code !== 'PGRST116') {
      console.error('Error fetching project:', error)
    }
    return null
  }

  // Sort steps by index
  if (project && project.project_steps) {
    project.project_steps.sort((a: { step_index: number }, b: { step_index: number }) => a.step_index - b.step_index)
  }

  return project
})

export async function getProjects() {
  return fetchProjects()
}

export async function getProject(id: string) {
  return fetchProject(id)
}

export async function createProject(formData: FormData) {
  const supabase = await createClient()
  if (!supabase) throw new Error('Database not configured')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  // Check if admin
  const { data: isAdmin } = await supabase.rpc('is_admin', { user_id: user.id })
  if (!isAdmin) {
    throw new Error('Only admins can create projects')
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const launchDate = formData.get('launchDate') as string

  if (!title) {
    throw new Error('Title is required')
  }

  // Fetch step time averages for estimated hours
  const { data: stepAverages } = await supabase
    .from('step_time_averages')
    .select('step_index, average_hours')
    .order('step_index')

  // Create a map of step_index -> average_hours
  const averagesMap = new Map<number, number>()
  if (stepAverages) {
    stepAverages.forEach((avg: { step_index: number; average_hours: number }) => {
      averagesMap.set(avg.step_index, avg.average_hours)
    })
  }

  // Create project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      title,
      description: description || null,
      launch_date: launchDate || null,
      created_by: user.id,
    })
    .select()
    .single()

  if (projectError || !project) {
    throw new Error('Failed to create project')
  }

  // Create all 20 steps with updated estimated hours from averages
  const steps = PRODUCTION_STEPS.map((step) => ({
    project_id: project.id,
    step_index: step.index,
    name: step.name,
    category: step.category,
    relative_timing: step.timing,
    // Use average hours if available, otherwise use default hours
    estimated_hours: averagesMap.get(step.index) ?? step.hours,
    status: 'not_started' as const,
  }))

  const { error: stepsError } = await supabase
    .from('project_steps')
    .insert(steps)

  if (stepsError) {
    // Rollback project creation
    await supabase.from('projects').delete().eq('id', project.id)
    throw new Error('Failed to create project steps')
  }

  // Invalidate caches
  revalidatePath('/', 'layout')
  redirect(`/projects/${project.id}`)
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient()
  if (!supabase) {
    return { success: false, error: '資料庫未設定' }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: '請先登入' }
  }

  // Check if admin or creator
  const { data: isAdmin } = await supabase.rpc('is_admin', { user_id: user.id })

  // Check if user is the creator
  const { data: project } = await supabase
    .from('projects')
    .select('created_by')
    .eq('id', projectId)
    .single()

  if (!project) {
    return { success: false, error: '找不到此專案' }
  }

  const isCreator = project.created_by === user.id

  if (!isAdmin && !isCreator) {
    return { success: false, error: '沒有權限刪除此專案' }
  }

  // Delete project (cascade will handle steps, links, comments)
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)

  if (error) {
    console.error('Error deleting project:', error)
    return { success: false, error: '刪除專案失敗' }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function canDeleteProject(projectId: string): Promise<boolean> {
  const supabase = await createClient()
  if (!supabase) return false

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  // Check if admin
  const { data: isAdmin } = await supabase.rpc('is_admin', { user_id: user.id })
  if (isAdmin) return true

  // Check if creator
  const { data: project } = await supabase
    .from('projects')
    .select('created_by')
    .eq('id', projectId)
    .single()

  return project?.created_by === user.id
}

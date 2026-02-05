'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signOut() {
  const supabase = await createClient()
  if (supabase) {
    await supabase.auth.signOut()
  }
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient()
  if (!supabase) throw new Error('Database not configured')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const fullName = formData.get('fullName') as string
  const gender = formData.get('gender') as 'male' | 'female'

  if (!fullName || !gender) {
    throw new Error('Full name and gender are required')
  }

  // Check if profile exists
  const { data: existingProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (fetchError || !existingProfile) {
    console.error('Profile fetch error:', fetchError)
    // Profile doesn't exist, create it
    const { error: insertError } = await supabase.from('profiles').insert({
      id: user.id,
      email: user.email!,
      full_name: fullName,
      gender,
      onboarding_completed: true,
    })

    if (insertError) {
      console.error('Profile insert error:', insertError)
      throw new Error(`Failed to create profile: ${insertError.message}`)
    }
  } else {
    // Profile exists, update it
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        gender,
        onboarding_completed: true,
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      throw new Error(`Failed to update profile: ${updateError.message}`)
    }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function getCurrentUser() {
  const supabase = await createClient()
  if (!supabase) return null

  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getProfile() {
  const supabase = await createClient()
  if (!supabase) return null

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

export async function isCurrentUserAdmin() {
  const supabase = await createClient()
  if (!supabase) return false

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: isAdmin } = await supabase.rpc('is_admin', { user_id: user.id })
  return isAdmin ?? false
}

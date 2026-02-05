'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

/**
 * Signs out the current user and redirects to home page
 *
 * Clears the Supabase session and revalidates all cached paths.
 * Always redirects to '/' after sign out.
 *
 * @example
 * <form action={signOut}>
 *   <button type="submit">Sign Out</button>
 * </form>
 */
export async function signOut() {
  const supabase = await createClient()
  if (supabase) {
    await supabase.auth.signOut()
  }
  revalidatePath('/', 'layout')
  redirect('/')
}

/**
 * Completes the user onboarding process
 *
 * Creates or updates the user's profile with their name and gender.
 * Sets onboarding_completed to true. Redirects to home page on success.
 *
 * @param formData - Form data containing profile details
 * @param formData.fullName - User's full display name (required)
 * @param formData.gender - User's gender: 'male' or 'female' (required)
 * @throws Error if not authenticated or profile update fails
 *
 * @example
 * <form action={completeOnboarding}>
 *   <input name="fullName" required />
 *   <select name="gender" required>
 *     <option value="male">Male</option>
 *     <option value="female">Female</option>
 *   </select>
 *   <button type="submit">Complete</button>
 * </form>
 */
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

/**
 * Retrieves the current authenticated Supabase user
 *
 * Returns the raw Supabase User object, not the profile.
 * Use getProfile() for user profile data.
 *
 * @returns The Supabase User object, or null if not authenticated
 *
 * @example
 * const user = await getCurrentUser()
 * if (user) {
 *   console.log(user.email, user.id)
 * }
 */
export async function getCurrentUser() {
  const supabase = await createClient()
  if (!supabase) return null

  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * Retrieves the current user's profile from the profiles table
 *
 * Returns all profile fields including full_name, gender, role,
 * and onboarding_completed status.
 *
 * @returns The user's profile, or null if not authenticated or profile doesn't exist
 *
 * @example
 * const profile = await getProfile()
 * if (profile?.onboarding_completed) {
 *   showDashboard()
 * } else {
 *   redirectToOnboarding()
 * }
 */
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

/**
 * Checks if the current user has admin privileges
 *
 * Uses the is_admin database function to check admin status.
 * Safe to call without authentication - returns false on any error.
 *
 * @returns True if user is admin, false otherwise
 *
 * @example
 * const isAdmin = await isCurrentUserAdmin()
 * if (isAdmin) {
 *   showAdminPanel()
 * }
 */
export async function isCurrentUserAdmin() {
  const supabase = await createClient()
  if (!supabase) return false

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: isAdmin } = await supabase.rpc('is_admin', { user_id: user.id })
  return isAdmin ?? false
}

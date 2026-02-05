import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

export type UserData = {
  user: { id: string; email?: string } | null
  profile: {
    id: string
    email: string
    full_name: string | null
    gender: 'male' | 'female' | null
    role: 'admin' | 'member'
    onboarding_completed: boolean
  } | null
  isAdmin: boolean
}

// Cache user data for the duration of a single request
// This prevents multiple DB calls in layout + page + components
export const getUserData = cache(async (): Promise<UserData> => {
  const supabase = await createClient()

  if (!supabase) {
    return { user: null, profile: null, isAdmin: false }
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, profile: null, isAdmin: false }
  }

  // Parallel fetch: profile and admin check
  const [profileResult, adminResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, email, full_name, gender, role, onboarding_completed')
      .eq('id', user.id)
      .single(),
    supabase.rpc('is_admin', { user_id: user.id })
  ])

  const profile = profileResult.data
  const isAdmin = adminResult.data ?? false

  return {
    user: { id: user.id, email: user.email },
    profile,
    isAdmin
  }
})

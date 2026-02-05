import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.redirect(`${origin}/?error=db_not_configured`)
    }

    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && user) {
      // Check if profile exists
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!existingProfile) {
        // Check if user is an admin (by checking if their email is in app_admins)
        const { data: isAdmin } = await supabase.rpc('is_admin_email', { check_email: user.email })

        // Create profile
        const { error: insertError } = await supabase.from('profiles').insert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || null,
          role: isAdmin ? 'admin' : 'member',
          last_sign_in_at: new Date().toISOString(),
        })

        if (insertError) {
          console.error('Failed to create profile:', insertError)
          return NextResponse.redirect(`${origin}/?error=profile_creation_failed`)
        }

        // Redirect to onboarding for new users
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'

        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}/onboarding`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}/onboarding`)
        } else {
          return NextResponse.redirect(`${origin}/onboarding`)
        }
      } else {
        // Update last sign in
        await supabase
          .from('profiles')
          .update({ last_sign_in_at: new Date().toISOString() })
          .eq('id', user.id)
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/?error=auth_error`)
}

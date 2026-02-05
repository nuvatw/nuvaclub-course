'use client'

import { Suspense } from 'react'
import { Sidebar } from './Sidebar'
import { SidebarProvider, useSidebar } from './SidebarContext'
import { NavigationProgress } from '@/components/ui/NavigationProgress'

interface AppLayoutProps {
  children: React.ReactNode
  user: { id: string; email?: string } | null
  profile: { full_name: string | null } | null
  isAdmin: boolean
}

function AppLayoutInner({ children, user, profile, isAdmin }: AppLayoutProps) {
  const { isCollapsed } = useSidebar()

  // If no user, show content without sidebar (for login page)
  if (!user) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>
      <Sidebar user={user} profile={profile} isAdmin={isAdmin} />
      <main
        className="transition-[padding] duration-200 ease-out"
        style={{ paddingLeft: isCollapsed ? 64 : 240 }}
      >
        {children}
      </main>
    </div>
  )
}

export function AppLayout(props: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppLayoutInner {...props} />
    </SidebarProvider>
  )
}

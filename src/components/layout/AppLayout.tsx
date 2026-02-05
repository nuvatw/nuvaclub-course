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
      {/* Skip navigation link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-hover"
      >
        跳至主要內容
      </a>
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>
      <Sidebar user={user} profile={profile} isAdmin={isAdmin} />
      <main
        id="main-content"
        tabIndex={-1}
        className="transition-[padding] duration-200 ease-out focus:outline-none"
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

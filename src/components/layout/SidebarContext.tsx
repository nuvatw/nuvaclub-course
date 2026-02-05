'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'

interface SidebarContextType {
  isCollapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  toggle: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

const AUTO_COLLAPSE_DELAY = 10000 // 10 seconds

interface SidebarProviderProps {
  children: React.ReactNode
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const pathname = usePathname()
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Clear any existing timer
  const clearAutoCollapseTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // Start auto-collapse timer
  const startAutoCollapseTimer = useCallback(() => {
    clearAutoCollapseTimer()
    timerRef.current = setTimeout(() => {
      setIsCollapsed(true)
    }, AUTO_COLLAPSE_DELAY)
  }, [clearAutoCollapseTimer])

  // Reset to collapsed on route change
  // Note: setState in effect is intentional here - sidebar should collapse
  // when user navigates to a new page for better UX
  /* eslint-disable react-hooks/set-state-in-effect -- Intentional: responding to route change */
  useEffect(() => {
    setIsCollapsed(true)
    clearAutoCollapseTimer()
  }, [pathname, clearAutoCollapseTimer])
  /* eslint-enable react-hooks/set-state-in-effect */

  // Cleanup timer on unmount
  useEffect(() => {
    return () => clearAutoCollapseTimer()
  }, [clearAutoCollapseTimer])

  const setCollapsed = useCallback((collapsed: boolean) => {
    setIsCollapsed(collapsed)
    if (!collapsed) {
      // Started expanded, start auto-collapse timer
      startAutoCollapseTimer()
    } else {
      // Collapsed, clear timer
      clearAutoCollapseTimer()
    }
  }, [startAutoCollapseTimer, clearAutoCollapseTimer])

  const toggle = useCallback(() => {
    const newCollapsed = !isCollapsed
    setCollapsed(newCollapsed)
  }, [isCollapsed, setCollapsed])

  const value = {
    isCollapsed,
    setCollapsed,
    toggle,
  }

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}

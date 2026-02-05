'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useSidebar } from './SidebarContext'
import { Tooltip } from '@/components/ui/Tooltip'

interface SidebarProps {
  user: { id: string; email?: string } | null
  profile: { full_name: string | null } | null
  isAdmin: boolean
}

export function Sidebar({ user, profile, isAdmin }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { isCollapsed, toggle } = useSidebar()
  const [createMenuOpen, setCreateMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const createMenuRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (createMenuRef.current && !createMenuRef.current.contains(event.target as Node)) {
        setCreateMenuOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close menus when sidebar collapses
  // Note: setState in effect is intentional here - menus should close
  // when sidebar collapses to prevent UI issues with floating menus
  /* eslint-disable react-hooks/set-state-in-effect -- Intentional: responding to collapse state */
  useEffect(() => {
    if (isCollapsed) {
      setCreateMenuOpen(false)
      setUserMenuOpen(false)
    }
  }, [isCollapsed])
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || '使用者'
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const navItems = [
    {
      name: '課程',
      href: '/',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      isActive: pathname === '/' || pathname.startsWith('/projects'),
    },
    {
      name: '問題',
      href: '/issues',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      isActive: pathname.startsWith('/issues'),
    },
  ]

  if (!user) return null

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="fixed left-0 top-0 bottom-0 bg-card border-r border-border flex flex-col z-40 overflow-hidden"
    >
      {/* Header with Toggle */}
      <div className="h-14 flex items-center px-3 border-b border-border">
        {isCollapsed ? (
          // Collapsed: just toggle button centered
          <Tooltip content="展開選單" side="right">
            <button
              onClick={toggle}
              className="w-10 h-10 flex items-center justify-center rounded-lg text-zinc-400 hover:text-foreground hover:bg-zinc-800 transition-colors"
              aria-label="展開側邊欄"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </Tooltip>
        ) : (
          // Expanded: logo text + toggle button
          <div className="flex items-center justify-between w-full">
            <Link href="/" className="group">
              <span className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                nuvaClub
              </span>
            </Link>
            <button
              onClick={toggle}
              className="w-8 h-8 flex items-center justify-center rounded-md text-zinc-400 hover:text-foreground hover:bg-zinc-800 transition-colors"
              aria-label="收合側邊欄"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Create Button */}
      <div className="px-3 py-2" ref={createMenuRef}>
        <div className="relative">
          {isCollapsed ? (
            <Tooltip content="新增" side="right" disabled={!isCollapsed}>
              <button
                onClick={() => setCreateMenuOpen(!createMenuOpen)}
                aria-label="新增"
                aria-expanded={createMenuOpen}
                aria-haspopup="menu"
                className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </Tooltip>
          ) : (
            <button
              onClick={() => setCreateMenuOpen(!createMenuOpen)}
              aria-expanded={createMenuOpen}
              aria-haspopup="menu"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="whitespace-nowrap">新增</span>
            </button>
          )}

          <AnimatePresence>
            {createMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                role="menu"
                aria-label="新增選單"
                className={`absolute top-full mt-2 bg-zinc-800 border border-border rounded-lg shadow-lg overflow-hidden z-50 ${
                  isCollapsed ? 'left-0 w-48' : 'left-0 right-0'
                }`}
              >
                {isAdmin && (
                  <Link
                    href="/projects/new"
                    onClick={() => setCreateMenuOpen(false)}
                    role="menuitem"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-zinc-700 transition-colors"
                  >
                    <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    新增課程
                  </Link>
                )}
                <Link
                  href="/issues/new"
                  onClick={() => setCreateMenuOpen(false)}
                  role="menuitem"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-zinc-700 transition-colors"
                >
                  <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  新增問題
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              {isCollapsed ? (
                <Tooltip content={item.name} side="right" disabled={!isCollapsed}>
                  <Link
                    href={item.href}
                    className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                      item.isActive
                        ? 'bg-zinc-800 text-primary'
                        : 'text-zinc-400 hover:text-foreground hover:bg-zinc-800/50'
                    }`}
                  >
                    {item.icon}
                  </Link>
                </Tooltip>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    item.isActive
                      ? 'bg-zinc-800 text-foreground border-l-2 border-primary -ml-[2px] pl-[14px]'
                      : 'text-zinc-400 hover:text-foreground hover:bg-zinc-800/50'
                  }`}
                >
                  {item.icon}
                  <span className="whitespace-nowrap">{item.name}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* User Section */}
      <div className="px-3 py-3 border-t border-border" ref={userMenuRef}>
        <div className="relative">
          {isCollapsed ? (
            <Tooltip content={displayName} side="right" disabled={!isCollapsed}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-label="使用者選單"
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold hover:bg-primary/30 transition-colors"
              >
                {initials}
              </button>
            </Tooltip>
          ) : (
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              aria-expanded={userMenuOpen}
              aria-haspopup="menu"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {displayName}
                </p>
                {isAdmin && (
                  <p className="text-xs text-primary">管理員</p>
                )}
              </div>
              <svg
                className={`w-4 h-4 text-zinc-400 transition-transform flex-shrink-0 ${userMenuOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          )}

          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                role="menu"
                aria-label="使用者選單"
                className={`absolute bottom-full mb-2 bg-zinc-800 border border-border rounded-lg shadow-lg overflow-hidden z-50 ${
                  isCollapsed ? 'left-0 w-48' : 'left-0 right-0'
                }`}
              >
                <button
                  onClick={handleSignOut}
                  role="menuitem"
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-zinc-700 transition-colors"
                >
                  <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  登出
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  )
}

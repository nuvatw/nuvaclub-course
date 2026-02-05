'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export function NavigationProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isNavigating, setIsNavigating] = useState(false)
  const [progress, setProgress] = useState(0)

  // 導航完成時重置
  useEffect(() => {
    setIsNavigating(false)
    setProgress(100)

    const timer = setTimeout(() => {
      setProgress(0)
    }, 300)

    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  // 監聽點擊事件來偵測導航開始
  useEffect(() => {
    let progressInterval: NodeJS.Timeout | null = null

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')

      if (link) {
        const href = link.getAttribute('href')
        // 只處理內部連結
        if (href && href.startsWith('/') && !href.startsWith('//')) {
          // 檢查是否是不同頁面
          const currentPath = pathname + (searchParams.toString() ? '?' + searchParams.toString() : '')
          if (href !== currentPath && href !== pathname) {
            setIsNavigating(true)
            setProgress(20)

            // 模擬進度增長
            progressInterval = setInterval(() => {
              setProgress(prev => {
                if (prev >= 90) {
                  if (progressInterval) clearInterval(progressInterval)
                  return 90
                }
                return prev + Math.random() * 15
              })
            }, 150)
          }
        }
      }
    }

    document.addEventListener('click', handleClick, true)

    return () => {
      document.removeEventListener('click', handleClick, true)
      if (progressInterval) clearInterval(progressInterval)
    }
  }, [pathname, searchParams])

  return (
    <AnimatePresence>
      {progress > 0 && (
        <motion.div
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: progress / 100, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            scaleX: { duration: 0.2, ease: 'easeOut' },
            opacity: { duration: 0.3 }
          }}
          className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-blue-400 to-cyan-400 origin-left z-[100]"
          style={{
            boxShadow: '0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3)'
          }}
        />
      )}
    </AnimatePresence>
  )
}

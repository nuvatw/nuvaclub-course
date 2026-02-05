# PRD: 效能優化與繁體中文化

## 概述

本 PRD 旨在解決兩個主要問題：
1. **頁面切換緩慢** - 用戶在頁面之間導航時感受到明顯延遲
2. **英文文字殘留** - 部分 UI 仍顯示英文，需全面中文化

---

## 第一部分：效能優化

### 1.1 問題分析

目前系統存在以下效能瓶頸：

| 問題 | 影響 | 嚴重程度 |
|------|------|----------|
| RootLayout 每次導航都重新獲取用戶資料 | 阻塞渲染，增加 TTFB | 高 |
| 頁面無即時回饋 | 用戶感覺卡頓 | 高 |
| 未使用 Link 預取優化 | 導航延遲 | 中 |
| Server Actions 無 Optimistic UI | 操作感覺遲鈍 | 中 |
| 無路由級別 loading.tsx | 缺少骨架屏 | 中 |

### 1.2 優化策略

#### 策略 A：感知效能優化（Perceived Performance）

**A1. 全局導航進度指示器**
```
位置：頂部或側邊欄頂部
樣式：細長進度條，類似 YouTube/GitHub
觸發：useTransition 或 router 事件
```

**A2. 頁面切換動畫**
```
- 舊頁面：opacity 0.5 + 輕微縮放
- 新頁面：fade in
- 使用 Framer Motion 的 AnimatePresence
```

**A3. 骨架屏優化**
```
每個路由新增/完善 loading.tsx：
- /issues/[id]/loading.tsx（新增）
- /issues/[id]/edit/loading.tsx（新增）
- /issues/new/loading.tsx（新增）
- /projects/new/loading.tsx（新增）
```

#### 策略 B：實際效能優化（Actual Performance）

**B1. 用戶資料快取**
```typescript
// 目前問題：每次導航都調用 getUserData()
// 解決方案：使用 React cache() + 合理的 revalidate

// src/lib/auth.ts
import { cache } from 'react'

export const getUserData = cache(async () => {
  // ... 現有邏輯
})
```

**B2. 並行資料獲取**
```typescript
// 目前：串行獲取
const userData = await getUserData()
const projects = await getProjects()

// 改為：並行獲取
const [userData, projects] = await Promise.all([
  getUserData(),
  getProjects()
])
```

**B3. Streaming 與 Suspense**
```tsx
// 頁面結構優化
export default async function Page() {
  return (
    <>
      {/* 靜態內容立即顯示 */}
      <Header />

      {/* 動態內容用 Suspense 包裹 */}
      <Suspense fallback={<ProjectListSkeleton />}>
        <ProjectList />
      </Suspense>
    </>
  )
}
```

**B4. 預取優化**
```tsx
// Link 組件預設啟用預取
<Link href="/issues" prefetch={true}>
  Issues
</Link>

// 程式化預取
import { useRouter } from 'next/navigation'
const router = useRouter()

// 滑鼠懸停時預取
onMouseEnter={() => router.prefetch('/issues')}
```

**B5. 動態 import 延遲載入**
```typescript
// 延遲載入非關鍵組件
const ImageGallery = dynamic(() => import('./ImageGallery'), {
  loading: () => <ImageGallerySkeleton />,
  ssr: false // 僅客戶端渲染
})
```

### 1.3 實施細節

#### 1.3.1 全局導航進度條

**新增檔案：`src/components/ui/NavigationProgress.tsx`**
```tsx
'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export function NavigationProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isNavigating, setIsNavigating] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setIsNavigating(false)
    setProgress(100)

    const timer = setTimeout(() => setProgress(0), 200)
    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  // 監聽導航開始
  useEffect(() => {
    const handleStart = () => {
      setIsNavigating(true)
      setProgress(30)
      // 模擬進度
      const interval = setInterval(() => {
        setProgress(p => Math.min(p + 10, 90))
      }, 200)
      return () => clearInterval(interval)
    }

    // 可透過自定義事件觸發
    window.addEventListener('navigation-start', handleStart)
    return () => window.removeEventListener('navigation-start', handleStart)
  }, [])

  return (
    <AnimatePresence>
      {progress > 0 && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress / 100 }}
          exit={{ opacity: 0 }}
          className="fixed top-0 left-0 right-0 h-0.5 bg-primary origin-left z-50"
          style={{ transformOrigin: 'left' }}
        />
      )}
    </AnimatePresence>
  )
}
```

#### 1.3.2 優化 AppLayout

**修改：`src/components/layout/AppLayout.tsx`**
```tsx
import { Suspense } from 'react'
import { NavigationProgress } from '@/components/ui/NavigationProgress'

export function AppLayout({ children, user, profile, isAdmin }) {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>

      {user && <Sidebar user={user} profile={profile} isAdmin={isAdmin} />}

      <main className={user ? 'pl-60' : ''}>
        {children}
      </main>
    </div>
  )
}
```

#### 1.3.3 新增缺失的 loading.tsx

**`src/app/issues/[id]/loading.tsx`**
```tsx
import { Skeleton } from '@/components/ui/Skeleton'

export default function IssueDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* 返回按鈕 */}
      <Skeleton className="h-5 w-20 mb-8" />

      {/* 標題 */}
      <Skeleton className="h-8 w-3/4 mb-4" />

      {/* 狀態列 */}
      <div className="flex gap-4 mb-6">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-24" />
      </div>

      {/* Meta info */}
      <div className="flex gap-4 mb-8 pb-8 border-b border-zinc-800">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-40" />
      </div>

      {/* Content sections */}
      <div className="space-y-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-lg border border-zinc-800 bg-card p-6">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 第二部分：繁體中文化

### 2.1 待修正項目清單

| 檔案 | 位置 | 原文 | 修正 |
|------|------|------|------|
| `layout.tsx` | L20 | `"Course Production & Issue Tracker"` | `"課程製作與問題追蹤系統"` |
| `layout.tsx` | L30 | `lang="en"` | `lang="zh-TW"` |
| `Sidebar.tsx` | L56 | `name: 'Course'` | `name: '課程'` |
| `Sidebar.tsx` | L66 | `name: 'Issues'` | `name: '問題'` |
| `Sidebar.tsx` | L118 | `新增 Course` | `新增課程` |
| `Sidebar.tsx` | L129 | `新增 Issue` | `新增問題` |
| `StepIndicator.tsx` | L73 | `complete` | `已完成` |
| `StepIndicator.tsx` | L75 | `Step {n}` | `第 {n} 步` |
| `Header.tsx` | L67 | `Issues` | `問題` |
| `Header.tsx` | L74 | `建立 Issue 單` | `建立問題單` |
| `issues/page.tsx` | L49 | `Issues` | `問題` |
| `issues/page.tsx` | L50 | `內部 Issue 追蹤系統` | `內部問題追蹤系統` |

### 2.2 術語對照表

| 英文 | 繁體中文 | 說明 |
|------|----------|------|
| Course | 課程 | 產品功能名稱 |
| Issue | 問題 / 問題單 | 問題追蹤功能 |
| Project | 專案 / 課程 | 在此系統中等同於 Course |
| Step | 步驟 | 製作流程步驟 |
| Comment | 留言 | 討論區留言 |
| Admin | 管理員 | 系統管理員 |
| Status | 狀態 | 進度狀態 |
| Priority | 優先度 | 問題優先級 |

---

## 第三部分：實施計畫

### 階段 1：即時感知優化（1-2 小時）

- [ ] 新增 NavigationProgress 組件
- [ ] 新增缺失的 loading.tsx 檔案
- [ ] 完成所有英文轉繁中

### 階段 2：核心效能優化（2-3 小時）

- [ ] 優化 getUserData 快取策略
- [ ] 實施並行資料獲取
- [ ] 優化 Link 預取設定
- [ ] 新增 Suspense boundaries

### 階段 3：進階優化（可選）

- [ ] 實施動態 import
- [ ] 優化圖片載入（blur placeholder）
- [ ] 分析 bundle size

---

## 預期成效

| 指標 | 目前 | 目標 |
|------|------|------|
| 頁面切換體感 | 明顯延遲（1-2秒） | 即時回饋（<100ms） |
| TTFB | ~500ms | <300ms |
| LCP | ~2s | <1.5s |
| 英文殘留 | 12+ 處 | 0 處 |

---

## 技術參考

- [Next.js App Router Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)
- [Streaming with Suspense](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)

Sources:
- [Next.js Performance Optimisation (2025)](https://pagepro.co/blog/nextjs-performance-optimization-in-9-steps/)
- [Next.js 14+ Performance Optimization](https://dev.to/hijazi313/nextjs-14-performance-optimization-modern-approaches-for-production-applications-3n65)

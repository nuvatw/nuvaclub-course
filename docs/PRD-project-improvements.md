# PRD: nuvaClub Project Improvements

**Version**: 1.0
**Date**: 2026-02-05
**Author**: Engineering Team
**Development Timeline**: 10 Weeks

---

## Executive Summary

This Product Requirements Document outlines a comprehensive improvement plan for the nuvaClub course production and issue tracking system. After thorough analysis of the codebase, documentation, and existing PRDs, we have identified critical issues, technical debt, and opportunities for enhancement across multiple areas.

The nuvaClub platform is a Next.js 16 application with App Router architecture, utilizing Supabase for authentication/database and Cloudflare R2 for image storage. The application serves internal teams for tracking course production workflows (20-step process) and managing issues/bugs. The UI is in Traditional Chinese.

### Key Findings Summary

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| Code Quality | 2 | 4 | 5 | 3 | 14 |
| Performance | 1 | 3 | 2 | 1 | 7 |
| Security | 1 | 2 | 1 | 0 | 4 |
| UX/UI | 0 | 3 | 4 | 2 | 9 |
| Architecture | 0 | 2 | 3 | 1 | 6 |
| **Total** | **4** | **14** | **15** | **7** | **40** |

---

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [Problems Identified](#2-problems-identified)
3. [Proposed Solutions](#3-proposed-solutions)
4. [10-Week Implementation Roadmap](#4-10-week-implementation-roadmap)
5. [Success Metrics](#5-success-metrics)
6. [Technical Specifications](#6-technical-specifications)
7. [Risk Assessment](#7-risk-assessment)
8. [Appendix](#8-appendix)

---

## 1. Current State Analysis

### 1.1 Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Next.js | 16.1.6 |
| Runtime | React | 19.2.3 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | ^4 |
| Animation | Framer Motion | ^12.31.0 |
| Database | Supabase (PostgreSQL) | N/A |
| Auth | Supabase Auth (Google OAuth) | N/A |
| File Storage | Cloudflare R2 | N/A |
| Validation | Zod | ^4.3.6 |
| Linting | ESLint | ^9 |

### 1.2 Feature Overview

**Course Production Tracking**
- 20-step production workflow per project
- Step status management (not_started, in_progress, done)
- Time tracking with estimated vs actual hours
- Step links management (public/private)
- Project comments system

**Issue Management**
- Simplified issue creation with title, priority, status
- Image uploads via presigned URLs to Cloudflare R2
- Status workflow (not_started, in_progress, done, cancelled)
- Priority levels (low, medium, high)
- Pagination and filtering

**User Management**
- Google OAuth authentication
- Role-based access (admin/member)
- Onboarding flow
- Email domain restriction capability

### 1.3 Architecture Overview

```
src/
├── app/                    # Next.js App Router pages
│   ├── actions/           # Server Actions
│   ├── api/               # API Routes (image upload)
│   ├── auth/              # Auth callback
│   ├── issues/            # Issue pages
│   ├── onboarding/        # Onboarding flow
│   └── projects/          # Project pages
├── components/
│   ├── auth/              # Auth components
│   ├── home/              # Homepage components
│   ├── issues/            # Issue components
│   ├── layout/            # Layout (Sidebar, Header)
│   ├── projects/          # Project components
│   └── ui/                # Reusable UI components
├── lib/
│   ├── supabase/          # Supabase clients
│   ├── validations/       # Zod schemas
│   ├── constants/         # Step definitions
│   └── utils.ts           # Utility functions
└── types/                 # TypeScript definitions
```

### 1.4 Database Schema

The system uses 8 main tables:
- `profiles` - User profiles linked to auth.users
- `app_admins` - Admin email whitelist
- `projects` - Course projects
- `project_steps` - 20 steps per project
- `step_links` - Links attached to steps
- `project_comments` - Comment wall per project
- `step_time_averages` - Historical time data
- `issues` + `issue_images` - Issue tracking system

---

## 2. Problems Identified

### 2.1 Critical Priority (P0)

#### CRIT-001: React Compiler Memoization Errors
**Location**: Multiple components
**Impact**: Build warnings, potential performance issues, blocked React Compiler optimizations

The React Compiler is failing to preserve manual memoization in several components due to dependency mismatches:

| File | Line | Issue |
|------|------|-------|
| `IssueForm.tsx` | 33 | `handleRemoveExisting` dependency mismatch |
| `IssueForm.tsx` | 70 | `handleSubmit` dependency mismatch |

**Root Cause**: Using `issue?.id` in dependency array when `issue` object is referenced inside callback.

#### CRIT-002: Synchronous setState in useEffect
**Location**: Multiple components
**Impact**: Cascading renders, performance degradation, lint errors

| File | Line | Issue |
|------|------|-------|
| `Sidebar.tsx` | 44-45 | Setting menu state in effect |
| `SidebarContext.tsx` | 29, 34 | Setting collapsed state in effect |
| `NavigationProgress.tsx` | 15-16 | Setting navigation state in effect |

**Root Cause**: Direct state updates within useEffect bodies instead of using proper patterns.

#### CRIT-003: TypeScript `any` Type Usage
**Location**: `src/app/issues/page.tsx:35-36`
**Impact**: Type safety compromised, potential runtime errors

```typescript
const filters = {
  status: params.status as any,   // Line 35
  priority: params.priority as any,  // Line 36
  ...
}
```

#### CRIT-004: Missing Environment Variable Validation
**Location**: `src/lib/r2.ts`, `src/lib/supabase/client.ts`
**Impact**: Runtime crashes if environment variables are not set

The R2 client uses non-null assertions (`!`) for environment variables without proper validation:
```typescript
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!
```

---

### 2.2 High Priority (P1)

#### HIGH-001: Missing `<Image>` Component Usage
**Location**: Image components
**Impact**: Slower LCP, higher bandwidth, reduced performance scores

| File | Line |
|------|------|
| `ImageGallery.tsx` | 79 |
| `ImageUploader.tsx` | 307, 355 |

Using `<img>` elements instead of Next.js `<Image>` component bypasses automatic image optimization.

#### HIGH-002: Unused Variables and Imports
**Location**: Multiple files
**Impact**: Code bloat, maintainability issues, confusion

| File | Variable | Line |
|------|----------|------|
| `auth/callback/route.ts` | `profileError` | 19 |
| `ProjectDetailClient.tsx` | `isAuthenticated`, `userId` | 41, 43 |
| `IssueList.tsx` | `useState` | 3 |
| `NavigationProgress.tsx` | `useCallback`, `isNavigating` | 3, 10 |
| `ProjectCard.tsx` | `currentStepIndex`, `isPending` | 21, 99 |

#### HIGH-003: Duplicate Data Fetching in Layout
**Location**: `src/app/layout.tsx`, `src/app/page.tsx`
**Impact**: Unnecessary database calls, slower page loads

Both RootLayout and Home page call `getUserData()`. While React's `cache()` helps within a single request, navigation between pages triggers new requests.

#### HIGH-004: No Error Boundaries
**Location**: Application-wide
**Impact**: Poor error handling UX, crashes propagate to entire page

No React Error Boundaries are implemented. Errors in one component can crash the entire page.

#### HIGH-005: Missing Loading States for All Routes
**Location**: Several routes
**Impact**: Poor perceived performance, jarring transitions

Routes needing loading.tsx:
- `/issues/[id]` - Has loading.tsx
- `/issues/[id]/edit` - Has loading.tsx
- `/issues/new` - Has loading.tsx
- `/projects/new` - Has loading.tsx

**Status**: All critical routes have loading states, but some could be improved.

#### HIGH-006: No Rate Limiting on API Routes
**Location**: `/api/issues/images/*`
**Impact**: Potential abuse, DoS vulnerability

Image upload endpoints lack rate limiting, allowing potential abuse.

#### HIGH-007: Alert() Usage for User Feedback
**Location**: Multiple components
**Impact**: Poor UX, blocks UI thread, not customizable

Using browser `alert()` for error messages in:
- `IssueForm.tsx`
- `IssueDetail.tsx`
- `ImageGallery.tsx`

---

### 2.3 Medium Priority (P2)

#### MED-001: Inconsistent Error Handling Patterns
**Location**: Server Actions
**Impact**: Inconsistent UX, harder debugging

Some server actions throw errors, others return `{ success, error }` objects:

```typescript
// Throws (projects.ts)
throw new Error('Only admins can create projects')

// Returns object (issues.ts)
return { success: false, error: '發生未知錯誤' }
```

#### MED-002: Hardcoded Strings in Components
**Location**: Throughout codebase
**Impact**: Harder to maintain, no i18n support

Chinese strings are hardcoded throughout components. While i18n is not a current goal, centralizing strings would improve maintainability.

#### MED-003: Missing Input Sanitization for SQL Queries
**Location**: `src/app/actions/issues.ts:157`
**Impact**: Potential SQL injection (mitigated by Supabase but not ideal)

```typescript
query = query.ilike('title', `%${search}%`)
```

The search term is directly interpolated. While Supabase parameterizes queries, explicit sanitization is better practice.

#### MED-004: No Optimistic UI Updates
**Location**: All form submissions
**Impact**: Perceived slowness, poor UX

Status changes, priority updates, and other actions wait for server response before updating UI.

#### MED-005: Missing Accessibility Features
**Location**: Multiple components
**Impact**: Poor accessibility for screen readers, keyboard users

Issues found:
- Missing `aria-labels` on icon-only buttons (partial implementation)
- No skip links for navigation
- Focus management issues in modals
- Color contrast in some status badges

#### MED-006: Incomplete TypeScript Strict Mode
**Location**: `tsconfig.json`
**Impact**: Potential runtime errors from type mismatches

Not all strict TypeScript checks are enabled. Consider enabling:
- `noUncheckedIndexedAccess`
- `exactOptionalPropertyTypes`

#### MED-007: Large Bundle Size from Framer Motion
**Location**: Build output
**Impact**: Slower initial page load

Framer Motion is imported fully. Consider using modular imports or lazy loading for non-critical animations.

#### MED-008: No Database Migrations Version Control
**Location**: `supabase/migrations/`
**Impact**: Risk of migration conflicts, difficult rollbacks

Migrations exist but there's no clear versioning strategy or rollback procedures documented.

#### MED-009: Missing Realtime Subscriptions
**Location**: Issue and Project pages
**Impact**: Stale data, users need to refresh for updates

No Supabase realtime subscriptions for collaborative features. Multiple users editing same project won't see each other's changes.

---

### 2.4 Low Priority (P3)

#### LOW-001: Console.log Statements in Production Code
**Location**: Server actions and components
**Impact**: Log pollution, potential information leakage

Multiple `console.error` statements that should use a proper logging service in production.

#### LOW-002: Magic Numbers in Code
**Location**: Various files
**Impact**: Harder to understand and maintain

Examples:
- `900` seconds for presigned URL expiry
- `10 * 1024 * 1024` for max file size
- `20` steps hardcoded in various places

#### LOW-003: Inconsistent Import Ordering
**Location**: Throughout codebase
**Impact**: Code readability, developer experience

Some files follow React -> Next -> Third-party -> Local pattern, others don't.

#### LOW-004: No Unit Tests
**Location**: N/A
**Impact**: Code quality, regression risk

No test files exist. Key business logic in server actions lacks test coverage.

#### LOW-005: Missing JSDoc Comments
**Location**: Server actions and utilities
**Impact**: Developer onboarding, code understanding

Some functions have comments, many don't. Inconsistent documentation.

#### LOW-006: Deprecated or Unused PRD Sections
**Location**: `docs/PRD-UI-UX-Enhancement.md`
**Impact**: Documentation debt, potential confusion

Some PRD features are already implemented but documents not updated.

#### LOW-007: No Caching Headers for Static Assets
**Location**: API routes
**Impact**: Suboptimal caching, repeated downloads

---

## 3. Proposed Solutions

### 3.1 Critical Fixes

#### Solution CRIT-001: Fix React Compiler Memoization

**IssueForm.tsx handleRemoveExisting:**
```typescript
// Current (problematic)
const handleRemoveExisting = useCallback(
  async (imageId: string) => {
    if (!issue?.id) return
    const result = await deleteIssueImage(issue.id, imageId)
    if (!result.success) {
      alert(result.error || '刪除圖片失敗')
    }
  },
  [issue?.id]  // Mismatch: uses issue?.id but accesses issue object
)

// Fixed
const issueId = issue?.id
const handleRemoveExisting = useCallback(
  async (imageId: string) => {
    if (!issueId) return
    const result = await deleteIssueImage(issueId, imageId)
    if (!result.success) {
      showToast({ type: 'error', message: result.error || '刪除圖片失敗' })
    }
  },
  [issueId]
)
```

#### Solution CRIT-002: Refactor useEffect State Updates

**SidebarContext.tsx:**
```typescript
// Current (problematic)
useEffect(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved !== null) {
    setIsCollapsed(saved === 'true')
  }
  setIsHydrated(true)
}, [])

// Fixed - use useSyncExternalStore or initialization function
const [isCollapsed, setIsCollapsed] = useState(() => {
  if (typeof window === 'undefined') return defaultCollapsed
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved !== null ? saved === 'true' : defaultCollapsed
  } catch {
    return defaultCollapsed
  }
})
```

#### Solution CRIT-003: Fix TypeScript Any Usage

```typescript
// Current
const filters = {
  status: params.status as any,
  priority: params.priority as any,
}

// Fixed
import type { IssueStatus, IssuePriority } from '@/types/issues'

function isValidStatus(s: string | undefined): s is IssueStatus | 'all' {
  return !s || ['all', 'not_started', 'in_progress', 'done', 'cancelled'].includes(s)
}

function isValidPriority(p: string | undefined): p is IssuePriority | 'all' {
  return !p || ['all', 'low', 'medium', 'high'].includes(p)
}

const filters = {
  status: isValidStatus(params.status) ? params.status : 'all',
  priority: isValidPriority(params.priority) ? params.priority : 'all',
  search: params.search,
  page: params.page ? parseInt(params.page) : 1,
}
```

#### Solution CRIT-004: Environment Variable Validation

**New file: `src/lib/env.ts`**
```typescript
import { z } from 'zod'

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),

  // R2 (optional - only needed if using image uploads)
  R2_ACCOUNT_ID: z.string().min(1).optional(),
  R2_ACCESS_KEY_ID: z.string().min(1).optional(),
  R2_SECRET_ACCESS_KEY: z.string().min(1).optional(),
  R2_BUCKET_NAME: z.string().min(1).optional(),
  R2_PUBLIC_BASE_URL: z.string().url().optional(),
})

export type Env = z.infer<typeof envSchema>

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    console.error('Invalid environment variables:', result.error.format())
    throw new Error('Invalid environment variables')
  }
  return result.data
}

export const env = validateEnv()
```

### 3.2 High Priority Fixes

#### Solution HIGH-001: Implement Next.js Image Component

**ImageGallery.tsx:**
```typescript
import Image from 'next/image'

// Replace <img> with <Image>
<Image
  src={image.url || ''}
  alt={image.filename}
  fill
  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
  className="object-cover transition-transform group-hover:scale-105"
  unoptimized={image.url?.includes('r2.dev')}  // Skip optimization for R2 URLs
/>
```

Note: For R2 images, may need to configure `remotePatterns` in `next.config.js` or use `unoptimized` prop.

#### Solution HIGH-002: Remove Unused Variables

Run automated cleanup:
```bash
# Use ESLint autofix where possible
npm run lint -- --fix

# For remaining issues, manually remove or prefix with underscore
```

#### Solution HIGH-003: Implement Toast Notification System

**New file: `src/components/ui/Toast.tsx`**
```typescript
'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Toast {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { ...toast, id }])

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={`px-4 py-3 rounded-lg shadow-lg ${
                toast.type === 'error' ? 'bg-red-600' :
                toast.type === 'success' ? 'bg-success' :
                'bg-primary'
              } text-white`}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}
```

#### Solution HIGH-004: Implement Error Boundaries

**New file: `src/components/ErrorBoundary.tsx`**
```typescript
'use client'

import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/Button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
    // TODO: Send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <h2 className="text-xl font-semibold text-foreground mb-2">發生錯誤</h2>
          <p className="text-zinc-400 mb-4">請重新整理頁面或稍後再試</p>
          <Button onClick={() => this.setState({ hasError: false })}>
            重試
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
```

### 3.3 Medium Priority Fixes

#### Solution MED-001: Standardize Error Handling

Create a consistent Result type pattern:

```typescript
// src/lib/result.ts
export type Result<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E }

export function ok<T>(data: T): Result<T> {
  return { success: true, data }
}

export function err<E = string>(error: E): Result<never, E> {
  return { success: false, error }
}
```

Update all server actions to use this pattern consistently.

#### Solution MED-004: Implement Optimistic Updates

```typescript
// Example for status update
const handleStatusChange = useCallback(
  (newStatus: IssueStatus) => {
    // Optimistic update
    setLocalStatus(newStatus)
    setShowStatusDropdown(false)

    startTransition(async () => {
      const result = await updateIssueStatus(issue.id, { status: newStatus })
      if (!result.success) {
        // Revert on failure
        setLocalStatus(issue.status)
        showToast({ type: 'error', message: result.error || '更新狀態失敗' })
      }
    })
  },
  [issue.id, issue.status, showToast]
)
```

---

## 4. 10-Week Implementation Roadmap

### Week 1: Critical Bug Fixes & Environment Setup

**Objectives:**
- Fix all critical lint errors (P0)
- Set up environment validation
- Remove all `any` types

**Tasks:**
| Task | Priority | Estimate | Owner |
|------|----------|----------|-------|
| Fix React Compiler memoization errors | P0 | 4h | Dev |
| Refactor useEffect state patterns | P0 | 6h | Dev |
| Fix TypeScript any usage | P0 | 2h | Dev |
| Implement environment validation | P0 | 3h | Dev |
| Set up proper error logging | P1 | 4h | Dev |
| Code review & testing | - | 4h | Team |

**Deliverables:**
- [ ] Zero critical lint errors
- [ ] Environment validation module
- [ ] Stricter TypeScript configuration

---

### Week 2: Image Optimization & Performance Foundation

**Objectives:**
- Replace all `<img>` with Next.js `<Image>`
- Set up proper image optimization pipeline
- Configure Next.js for R2 images

**Tasks:**
| Task | Priority | Estimate | Owner |
|------|----------|----------|-------|
| Configure remotePatterns for R2 | P1 | 2h | Dev |
| Update ImageGallery.tsx | P1 | 4h | Dev |
| Update ImageUploader.tsx | P1 | 4h | Dev |
| Create image optimization utility | P2 | 3h | Dev |
| Performance baseline measurement | P1 | 3h | Dev |
| Testing on various image sizes | - | 4h | QA |

**Deliverables:**
- [ ] All images use Next.js Image component
- [ ] Image loading performance improved by 30%+
- [ ] Performance baseline documented

---

### Week 3: Error Handling & User Feedback

**Objectives:**
- Implement Toast notification system
- Add Error Boundaries
- Replace all alert() usage

**Tasks:**
| Task | Priority | Estimate | Owner |
|------|----------|----------|-------|
| Create Toast component & context | P1 | 6h | Dev |
| Implement Error Boundary component | P1 | 4h | Dev |
| Replace alert() in IssueForm | P1 | 2h | Dev |
| Replace alert() in IssueDetail | P1 | 2h | Dev |
| Replace alert() in other components | P1 | 2h | Dev |
| Standardize error handling in actions | P2 | 4h | Dev |

**Deliverables:**
- [ ] Toast notification system
- [ ] Error boundaries on critical pages
- [ ] Consistent error handling patterns

---

### Week 4: Accessibility & UX Improvements

**Objectives:**
- Fix accessibility issues
- Improve keyboard navigation
- Add focus management to modals

**Tasks:**
| Task | Priority | Estimate | Owner |
|------|----------|----------|-------|
| Add aria-labels to all icon buttons | P2 | 4h | Dev |
| Implement skip navigation link | P2 | 2h | Dev |
| Fix modal focus trapping | P2 | 4h | Dev |
| Improve color contrast for badges | P2 | 3h | Dev |
| Add keyboard shortcuts | P3 | 4h | Dev |
| Accessibility audit with axe-core | - | 4h | QA |

**Deliverables:**
- [ ] WCAG 2.1 AA compliance for critical flows
- [ ] Keyboard-navigable UI
- [ ] Screen reader compatibility

---

### Week 5: Performance Optimization Phase 1

**Objectives:**
- Implement optimistic updates
- Reduce unnecessary re-renders
- Optimize bundle size

**Tasks:**
| Task | Priority | Estimate | Owner |
|------|----------|----------|-------|
| Implement optimistic updates for status | P2 | 4h | Dev |
| Implement optimistic updates for priority | P2 | 3h | Dev |
| Optimize Framer Motion imports | P2 | 4h | Dev |
| Add React.memo to list items | P2 | 3h | Dev |
| Analyze and reduce bundle size | P2 | 4h | Dev |
| Performance testing | - | 4h | QA |

**Deliverables:**
- [ ] Optimistic UI for all status changes
- [ ] Bundle size reduced by 20%+
- [ ] Improved interaction latency

---

### Week 6: API Security & Rate Limiting

**Objectives:**
- Add rate limiting to image upload APIs
- Improve input sanitization
- Security audit

**Tasks:**
| Task | Priority | Estimate | Owner |
|------|----------|----------|-------|
| Implement rate limiting middleware | P1 | 6h | Dev |
| Add input sanitization utilities | P2 | 4h | Dev |
| Review and fix SQL injection risks | P2 | 3h | Dev |
| Add CSRF protection review | P2 | 3h | Dev |
| Security audit documentation | - | 4h | Security |
| Penetration testing basics | - | 4h | QA |

**Deliverables:**
- [ ] Rate limiting on all API routes
- [ ] Input sanitization utilities
- [ ] Security audit report

---

### Week 7: Testing Infrastructure

**Objectives:**
- Set up testing framework
- Write tests for critical paths
- Add CI/CD integration

**Tasks:**
| Task | Priority | Estimate | Owner |
|------|----------|----------|-------|
| Set up Vitest/Jest | P2 | 4h | Dev |
| Configure React Testing Library | P2 | 2h | Dev |
| Write tests for server actions | P2 | 8h | Dev |
| Write tests for critical components | P2 | 6h | Dev |
| Set up GitHub Actions for CI | P2 | 4h | DevOps |

**Deliverables:**
- [ ] Testing framework configured
- [ ] 60%+ coverage on server actions
- [ ] CI pipeline running tests

---

### Week 8: Database & Backend Improvements

**Objectives:**
- Add realtime subscriptions
- Optimize database queries
- Improve migration workflow

**Tasks:**
| Task | Priority | Estimate | Owner |
|------|----------|----------|-------|
| Implement realtime for issues | P2 | 6h | Dev |
| Implement realtime for project steps | P2 | 6h | Dev |
| Optimize slow queries | P2 | 4h | Dev |
| Document migration procedures | P2 | 3h | Dev |
| Create rollback scripts | P2 | 3h | Dev |

**Deliverables:**
- [ ] Realtime updates for collaborative features
- [ ] Query optimization report
- [ ] Migration documentation

---

### Week 9: Code Quality & Documentation

**Objectives:**
- Clean up unused code
- Add JSDoc comments
- Update PRDs and documentation

**Tasks:**
| Task | Priority | Estimate | Owner |
|------|----------|----------|-------|
| Remove all unused variables/imports | P1 | 4h | Dev |
| Add JSDoc to server actions | P3 | 6h | Dev |
| Add JSDoc to utility functions | P3 | 4h | Dev |
| Update ARCHITECTURE.md | P3 | 3h | Dev |
| Update existing PRDs | P3 | 3h | PM |
| Create CONTRIBUTING.md | P3 | 2h | Dev |

**Deliverables:**
- [ ] Zero unused variable warnings
- [ ] Documented public APIs
- [ ] Updated documentation

---

### Week 10: Final Polish & Release

**Objectives:**
- Final bug fixes
- Performance verification
- Release preparation

**Tasks:**
| Task | Priority | Estimate | Owner |
|------|----------|----------|-------|
| Bug triage and fixes | P1 | 8h | Dev |
| Final performance testing | P1 | 4h | QA |
| Lighthouse audit | P1 | 2h | Dev |
| Create release notes | P2 | 2h | PM |
| Deploy to staging | P1 | 2h | DevOps |
| Production deployment | P1 | 2h | DevOps |

**Deliverables:**
- [ ] All P0/P1 issues resolved
- [ ] Performance targets met
- [ ] Production deployment

---

## 5. Success Metrics

### 5.1 Code Quality Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| ESLint Errors | 7 | 0 | `npm run lint` |
| ESLint Warnings | 11 | < 5 | `npm run lint` |
| TypeScript `any` usage | 2+ | 0 | Grep for `: any` |
| Test Coverage | 0% | 60% | Coverage report |
| Unused variables | 8 | 0 | ESLint report |

### 5.2 Performance Metrics

| Metric | Current | Target | Tool |
|--------|---------|--------|------|
| Lighthouse Performance | ~75 | > 90 | Lighthouse |
| First Contentful Paint | ~1.5s | < 1.2s | Web Vitals |
| Largest Contentful Paint | ~2.5s | < 2.0s | Web Vitals |
| Cumulative Layout Shift | ~0.1 | < 0.05 | Web Vitals |
| Time to Interactive | ~3s | < 2.5s | Lighthouse |
| Bundle Size (JS) | TBD | -20% | Bundle analyzer |

### 5.3 User Experience Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Page navigation feel | Noticeable delay | Instant | User feedback |
| Form submission feedback | Browser alert | Toast | Code review |
| Error recovery | Page crash | Graceful | Testing |
| Accessibility Score | TBD | > 90 | Lighthouse |

### 5.4 Security Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Rate limiting | All API routes | Code review |
| Input validation | 100% server actions | Code review |
| OWASP Top 10 | No critical vulnerabilities | Security audit |

---

## 6. Technical Specifications

### 6.1 Toast Notification System

**API:**
```typescript
interface ToastOptions {
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number  // Default: 4000ms
  action?: {
    label: string
    onClick: () => void
  }
}

// Usage
const { showToast } = useToast()
showToast({ type: 'success', message: '儲存成功' })
```

**Implementation Requirements:**
- Max 3 toasts visible at once
- Auto-dismiss after duration
- Manual dismiss on click
- Accessible announcements (aria-live)
- Queue system for multiple toasts

### 6.2 Error Boundary Implementation

**Placement Strategy:**
```
RootLayout
├── ErrorBoundary (Global - catches unhandled errors)
│   └── AppLayout
│       └── Page
│           ├── ErrorBoundary (Section - issues list)
│           └── ErrorBoundary (Section - comments)
```

**Recovery Options:**
1. Retry button - attempt to re-render
2. Refresh page - full reload
3. Report issue - send error to tracking

### 6.3 Rate Limiting Specification

**Algorithm:** Token Bucket

**Limits:**
| Endpoint | Requests | Window |
|----------|----------|--------|
| `/api/issues/images/presign` | 10 | 1 minute |
| `/api/issues/images/confirm` | 10 | 1 minute |
| `/api/issues/images/[id]` DELETE | 20 | 1 minute |

**Implementation:**
```typescript
// Using Upstash Redis for distributed rate limiting
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
})
```

### 6.4 Image Optimization Configuration

**next.config.js:**
```javascript
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.r2.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
}
```

### 6.5 Environment Variable Schema

```typescript
// Required for basic functionality
NEXT_PUBLIC_SUPABASE_URL: string      // Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY: string // Supabase anonymous key

// Required for image upload feature
R2_ACCOUNT_ID: string                 // Cloudflare account ID
R2_ACCESS_KEY_ID: string              // R2 API key ID
R2_SECRET_ACCESS_KEY: string          // R2 API secret
R2_BUCKET_NAME: string                // R2 bucket name

// Optional
R2_PUBLIC_BASE_URL?: string           // Public bucket URL (if configured)
ALLOWED_EMAIL_DOMAINS?: string        // Comma-separated list of allowed domains
```

---

## 7. Risk Assessment

### 7.1 Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| React 19 compatibility issues | High | Low | Test thoroughly, have rollback plan |
| Framer Motion bundle size | Medium | Medium | Use dynamic imports, tree shaking |
| Supabase realtime complexity | Medium | Medium | Start with simple use case, iterate |
| R2 image optimization limitations | Low | Medium | Use unoptimized prop as fallback |
| Migration data loss | High | Low | Always backup, test migrations in staging |

### 7.2 Resource Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Scope creep | High | Medium | Strict prioritization, weekly reviews |
| Developer availability | Medium | Low | Cross-train team members |
| Third-party service outages | Medium | Low | Implement graceful degradation |

### 7.3 Timeline Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Underestimated complexity | Medium | Medium | Add buffer to estimates |
| Dependencies between tasks | Medium | High | Identify early, parallelize where possible |
| Testing delays | Medium | Medium | Start testing early in each week |

---

## 8. Appendix

### 8.1 Current Lint Output Summary

```
Total Problems: 18 (7 errors, 11 warnings)

Errors:
- 2x @typescript-eslint/no-explicit-any
- 3x react-hooks/preserve-manual-memoization
- 3x react-hooks/set-state-in-effect

Warnings:
- 6x @typescript-eslint/no-unused-vars
- 3x @next/next/no-img-element
```

### 8.2 File Change Summary

**Files Requiring Modification:**
1. `src/app/issues/page.tsx` - Type fixes
2. `src/components/issues/IssueForm.tsx` - Memoization fixes
3. `src/components/issues/ImageGallery.tsx` - Image component
4. `src/components/issues/ImageUploader.tsx` - Image component
5. `src/components/layout/Sidebar.tsx` - Effect refactor
6. `src/components/layout/SidebarContext.tsx` - Effect refactor
7. `src/components/ui/NavigationProgress.tsx` - Effect refactor
8. `src/components/projects/ProjectCard.tsx` - Unused vars
9. `src/app/auth/callback/route.ts` - Unused vars
10. `src/app/projects/[id]/ProjectDetailClient.tsx` - Unused vars

**New Files to Create:**
1. `src/lib/env.ts` - Environment validation
2. `src/components/ui/Toast.tsx` - Toast notifications
3. `src/components/ErrorBoundary.tsx` - Error boundary
4. `src/lib/result.ts` - Result type utilities
5. Test files for server actions

### 8.3 Related Documents

- `/docs/ARCHITECTURE.md` - System architecture
- `/docs/SETUP.md` - Setup guide
- `/docs/INTEGRATION.md` - Integration guide
- `/docs/PRD-UI-UX-Enhancement.md` - UI/UX enhancement plan
- `/docs/PRD-UI-OVERHAUL.md` - UI overhaul plan
- `/docs/prd-collapsible-sidebar.md` - Sidebar specification
- `/docs/PRD-performance-optimization.md` - Performance optimization

### 8.4 Glossary

| Term | Definition |
|------|------------|
| LCP | Largest Contentful Paint - Core Web Vital metric |
| CLS | Cumulative Layout Shift - Core Web Vital metric |
| TTI | Time to Interactive - Performance metric |
| RSC | React Server Components |
| RLS | Row Level Security (Supabase) |
| SSR | Server-Side Rendering |
| ISR | Incremental Static Regeneration |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-05 | Engineering Team | Initial document |

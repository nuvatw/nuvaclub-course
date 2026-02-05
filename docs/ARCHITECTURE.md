# nuvaClub Course Production Tracker - Architecture Overview

## System Architecture

```
+---------------------------------------------------------------------------+
|                              CLIENT (Next.js 16)                           |
+---------------------------------------------------------------------------+
|                                                                            |
|  +------------------+  +------------------+  +------------------+          |
|  |   Projects       |  |     Issues       |  |   Onboarding     |          |
|  |   /projects/*    |  |    /issues/*     |  |   /onboarding    |          |
|  +------------------+  +------------------+  +------------------+          |
|                                                                            |
|  +----------------------------------------------------------------------+ |
|  |                      Shared Components                                | |
|  |  +------------+  +------------+  +------------+  +--------------+     | |
|  |  |   Toast    |  |   Modal    |  |  Sidebar   |  | ErrorBoundary|     | |
|  |  +------------+  +------------+  +------------+  +--------------+     | |
|  +----------------------------------------------------------------------+ |
|                                                                            |
|  +----------------------------------------------------------------------+ |
|  |                      Server Actions                                   | |
|  |  - issues.ts    - projects.ts    - comments.ts    - auth.ts           | |
|  +----------------------------------------------------------------------+ |
|                                                                            |
|  +----------------------------------------------------------------------+ |
|  |                      Custom Hooks (Realtime)                          | |
|  |  - useRealtimeIssue  - useRealtimeSteps  - useRealtimeComments        | |
|  +----------------------------------------------------------------------+ |
|                                                                            |
+---------------------------------------------------------------------------+
                                    |
         +--------------------------+---------------------------+
         |                          |                           |
         v                          v                           v
+------------------+    +--------------------+    +------------------------+
|    Supabase      |    |   Cloudflare R2    |    |    Supabase Auth       |
|    PostgreSQL    |    |  (Image Storage)   |    |   (Google OAuth)       |
+------------------+    +--------------------+    +------------------------+
| - profiles       |    | - Bucket:          |    | - Session management   |
| - projects       |    |   nuvaclub-issues  |    | - Domain restriction   |
| - project_steps  |    | - Presigned URLs   |    | - Admin whitelist      |
| - step_links     |    | - Direct upload    |    +------------------------+
| - project_comments|   +--------------------+
| - issues         |
| - issue_images   |
| - app_admins     |
| - step_time_avgs |
+------------------+
```

## Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| Runtime | React | 19.2.3 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | ^4 |
| Animation | Framer Motion | ^12.31.0 |
| Database | Supabase (PostgreSQL) | - |
| Auth | Supabase Auth (Google OAuth) | - |
| File Storage | Cloudflare R2 | - |
| Validation | Zod | ^4.3.6 |
| Testing | Vitest + React Testing Library | ^4.0.18 |

## Directory Structure

```
src/
+-- app/                          # Next.js App Router pages
|   +-- actions/                  # Server Actions
|   |   +-- auth.ts               # Authentication actions
|   |   +-- comments.ts           # Comment CRUD
|   |   +-- issues.ts             # Issue CRUD
|   |   +-- projects.ts           # Project CRUD
|   +-- api/                      # API Routes
|   |   +-- issues/images/        # Image upload endpoints
|   +-- auth/callback/            # OAuth callback
|   +-- issues/                   # Issue pages
|   |   +-- [id]/                 # Issue detail & edit
|   |   +-- new/                  # New issue
|   +-- onboarding/               # User onboarding
|   +-- projects/                 # Project pages
|   |   +-- [id]/                 # Project detail
|   |   +-- new/                  # New project
|   +-- layout.tsx                # Root layout with providers
|   +-- page.tsx                  # Homepage
|   +-- loading.tsx               # Global loading state
|
+-- components/
|   +-- auth/                     # Auth components
|   |   +-- AuthButton.tsx        # Sign in button
|   |   +-- GuestButton.tsx       # Guest access
|   +-- home/                     # Homepage components
|   |   +-- HeroSection.tsx       # Landing hero
|   +-- issues/                   # Issue components
|   |   +-- IssueCard.tsx         # Issue list item
|   |   +-- IssueDetail.tsx       # Issue detail view
|   |   +-- IssueForm.tsx         # Create/edit form
|   |   +-- IssueList.tsx         # Issue list container
|   |   +-- ImageGallery.tsx      # Image viewer with lightbox
|   |   +-- ImageUploader.tsx     # Drag-and-drop uploader
|   |   +-- StatusBadge.tsx       # Status indicator
|   +-- layout/                   # Layout components
|   |   +-- AppLayout.tsx         # Main app wrapper
|   |   +-- Header.tsx            # Top navigation
|   |   +-- Sidebar.tsx           # Collapsible sidebar
|   |   +-- SidebarContext.tsx    # Sidebar state management
|   |   +-- Footer.tsx            # Page footer
|   +-- projects/                 # Project components
|   |   +-- ProjectCard.tsx       # Project list item
|   |   +-- ProjectList.tsx       # Project list container
|   |   +-- StepDetail.tsx        # Step detail panel
|   |   +-- StepList.tsx          # Step list view
|   |   +-- CommentWall.tsx       # Project comments
|   |   +-- LinkCard.tsx          # Step link display
|   |   +-- LinkModal.tsx         # Add/edit link modal
|   |   +-- CompleteStepModal.tsx # Step completion dialog
|   +-- ui/                       # Reusable UI components
|   |   +-- Button.tsx            # Button variants
|   |   +-- Card.tsx              # Card container
|   |   +-- Input.tsx             # Form input
|   |   +-- Modal.tsx             # Modal dialog
|   |   +-- NavigationProgress.tsx # Page transition indicator
|   |   +-- ProgressBar.tsx       # Progress indicator
|   |   +-- RadioGroup.tsx        # Radio button group
|   |   +-- Skeleton.tsx          # Loading placeholder
|   |   +-- StepIndicator.tsx     # Step status icon
|   |   +-- Toast.tsx             # Toast notification system
|   |   +-- Tooltip.tsx           # Hover tooltip
|   +-- ErrorBoundary.tsx         # Error boundary wrapper
|
+-- lib/
|   +-- supabase/                 # Supabase client setup
|   |   +-- client.ts             # Browser client
|   |   +-- server.ts             # Server client
|   |   +-- middleware.ts         # Auth middleware
|   +-- constants/
|   |   +-- steps.ts              # 20-step production workflow
|   +-- validations/
|   |   +-- issue.ts              # Zod schemas for issues
|   +-- __tests__/                # Unit tests
|   +-- animations.ts             # Framer Motion presets
|   +-- auth.ts                   # Auth utilities
|   +-- env.ts                    # Environment validation
|   +-- r2.ts                     # Cloudflare R2 client
|   +-- rateLimit.ts              # Rate limiting utility
|   +-- sanitize.ts               # Input sanitization
|   +-- useFocusTrap.ts           # Focus trap hook
|   +-- useRealtimeComments.ts    # Realtime comments hook
|   +-- useRealtimeIssue.ts       # Realtime issue hook
|   +-- useRealtimeSteps.ts       # Realtime steps hook
|   +-- utils.ts                  # General utilities
|
+-- types/
|   +-- database.ts               # Database types
|   +-- issues.ts                 # Issue-related types
|
+-- middleware.ts                 # Next.js middleware (auth)
```

## Key Features

### 1. Toast Notification System

Location: `src/components/ui/Toast.tsx`

The Toast system provides non-blocking user feedback:

```tsx
const { showToast } = useToast()

showToast({
  type: 'success',  // 'success' | 'error' | 'info'
  message: 'Operation completed'
})
```

Features:
- Auto-dismiss after 4 seconds
- Animated entrance/exit via Framer Motion
- Stacks multiple toasts
- Accessible with aria-live regions

### 2. Error Boundary

Location: `src/components/ErrorBoundary.tsx`

Graceful error handling that prevents crashes from propagating:

```tsx
<ErrorBoundary fallback={<CustomError />}>
  <ComponentThatMightError />
</ErrorBoundary>
```

Features:
- Catches React rendering errors
- Displays user-friendly error message (Traditional Chinese)
- Retry button to attempt recovery
- Logs errors for debugging

### 3. Realtime Subscriptions

Hooks for live data updates via Supabase Realtime:

| Hook | Purpose | Events |
|------|---------|--------|
| `useRealtimeIssue` | Single issue updates | UPDATE, DELETE |
| `useRealtimeSteps` | Project step changes | UPDATE, INSERT, DELETE |
| `useRealtimeComments` | Comment wall updates | INSERT, DELETE, UPDATE |

```tsx
const { issue, isConnected, error } = useRealtimeIssue(initialIssue, {
  onDelete: () => router.push('/issues'),
  onUpdate: (updated) => console.log('Updated:', updated),
})
```

### 4. Focus Trap Hook

Location: `src/lib/useFocusTrap.ts`

Accessibility-compliant focus management for modals:

```tsx
const containerRef = useFocusTrap({
  isOpen: modalOpen,
  onClose: closeModal
})

return <div ref={containerRef}>{/* Modal content */}</div>
```

Features:
- Traps Tab/Shift+Tab within modal
- Handles Escape key to close
- Restores focus on close
- Auto-focuses first focusable element

### 5. Rate Limiting

Location: `src/lib/rateLimit.ts`

In-memory rate limiter using sliding window algorithm:

```tsx
const result = checkRateLimit(userId, 'imagePresign', RATE_LIMIT_CONFIGS.imagePresign)

if (!result.success) {
  return NextResponse.json(createRateLimitResponse(result))
}
```

Preset limits:
- Image presign: 10/minute
- Image confirm: 10/minute
- Image delete: 20/minute

### 6. Environment Validation

Location: `src/lib/env.ts`

Zod-based validation of environment variables at startup:

```tsx
import { env, isR2Configured, getR2Config } from '@/lib/env'

// Typed access to validated env vars
console.log(env.NEXT_PUBLIC_SUPABASE_URL)

// Check if optional features are configured
if (isR2Configured()) {
  const r2 = getR2Config()
}
```

### 7. Input Sanitization

Location: `src/lib/sanitize.ts`

Security utilities for user input:

| Function | Purpose |
|----------|---------|
| `sanitizeSearchInput` | Escapes SQL LIKE patterns |
| `escapeRegex` | Escapes regex special chars |
| `sanitizeForDisplay` | XSS protection |
| `removeControlCharacters` | Removes null bytes |
| `sanitizeUserInput` | Comprehensive sanitization |
| `sanitizeUUID` | Validates UUID format |

## Data Flow

### Issue Creation Flow

```
User -> /issues/new
         |
         v
    IssueForm.tsx
         |
    +----+----+
    |         |
    v         v
ImageUploader   Form Submit
    |              |
    v              v
/api/images/   createIssue()
presign           |
    |              v
    v         Link images
Direct to R2      |
    |              v
    v         Redirect to
Confirm       /issues/[id]
```

### Realtime Data Flow

```
Database Change (UPDATE/INSERT/DELETE)
         |
         v
Supabase Realtime Channel
         |
         v
useRealtime* Hook
         |
         v
Local State Update
         |
         v
React Re-render
```

## Database Schema

### Main Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles linked to auth.users |
| `app_admins` | Admin email whitelist |
| `projects` | Course projects |
| `project_steps` | 20 steps per project |
| `step_links` | Links attached to steps |
| `project_comments` | Comment wall per project |
| `step_time_averages` | Historical time data |
| `issues` | Issue tracking |
| `issue_images` | Images attached to issues |

### Permission Model

| Action | Member | Creator | Admin |
|--------|--------|---------|-------|
| Create Issue | Yes | - | Yes |
| View Issues | Yes | Yes | Yes |
| Edit Issue | No | Yes | Yes |
| Delete Issue | No | Yes | Yes |
| Change Status | Yes | Yes | Yes |
| Upload Images | Yes | Yes | Yes |
| Delete Images | No | Yes | Yes |
| Create Project | No | - | Yes |
| Delete Project | No | Yes | Yes |

## Environment Variables

```bash
# Required - Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# Required for Image Upload - Cloudflare R2
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=nuvaclub-issues
R2_PUBLIC_BASE_URL=https://pub-xxx.r2.dev  # Optional

# Optional - Auth
ALLOWED_EMAIL_DOMAINS=example.com,company.com
```

## Testing

The project uses Vitest with React Testing Library:

```bash
npm test              # Watch mode
npm run test:run      # Single run
npm run test:coverage # Coverage report
```

Test locations:
- `src/lib/__tests__/*.test.ts` - Utility tests
- `src/lib/validations/__tests__/*.test.ts` - Schema tests

## Related Documentation

- `/docs/SETUP.md` - Development setup guide
- `/docs/INTEGRATION.md` - Integration guide
- `/docs/PRD-project-improvements.md` - Improvement roadmap
- `/docs/PRD-UI-UX-Enhancement.md` - UI/UX enhancement plan
- `/CONTRIBUTING.md` - Contribution guidelines

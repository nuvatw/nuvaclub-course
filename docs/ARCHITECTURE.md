# Internal Issue Ticket System - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Next.js)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Issue List  │  │ Create Issue │  │ Issue Detail │  │  Edit Issue  │    │
│  │  /issues     │  │ /issues/new  │  │ /issues/[id] │  │/issues/[id]/ │    │
│  │              │  │              │  │              │  │    edit      │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                 │                 │                 │            │
│         └─────────────────┴────────┬────────┴─────────────────┘            │
│                                    │                                        │
│  ┌─────────────────────────────────▼────────────────────────────────────┐  │
│  │                     Server Actions (src/app/actions/issues.ts)       │  │
│  │  - createIssue()     - getIssues()      - getIssueById()            │  │
│  │  - updateIssue()     - deleteIssue()    - updateIssueStatus()       │  │
│  └─────────────────────────────────┬────────────────────────────────────┘  │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │
┌────────────────────────────────────┼────────────────────────────────────────┐
│                              API ROUTES                                      │
│  ┌─────────────────────────────────▼────────────────────────────────────┐  │
│  │                Image Upload API (src/app/api/issues/...)              │  │
│  │  - POST /api/issues/images/presign  → Generate presigned URL          │  │
│  │  - POST /api/issues/images/confirm  → Confirm upload completion       │  │
│  │  - DELETE /api/issues/images/[id]   → Delete image from R2            │  │
│  └─────────────────────────────────┬────────────────────────────────────┘  │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         │                           │                           │
         ▼                           ▼                           ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────────────┐
│    Supabase     │      │ Cloudflare R2   │      │  Supabase Auth          │
│    PostgreSQL   │      │ (Image Storage) │      │  (Google OAuth)         │
├─────────────────┤      ├─────────────────┤      ├─────────────────────────┤
│ - issues        │      │ - Bucket:       │      │ - Session management    │
│ - issue_images  │      │   nuvaclub-     │      │ - Domain restriction    │
│ - profiles      │      │   issues        │      │   via env variable      │
│ - app_admins    │      │ - Presigned PUT │      │ - Admin whitelist       │
└─────────────────┘      └─────────────────┘      └─────────────────────────┘
```

## Data Flow

### 1. Issue Creation Flow
```
User clicks "建立 Issue 單"
         │
         ▼
┌─────────────────────────────────┐
│  Navigate to /issues/new        │
└─────────────────┬───────────────┘
                  │
                  ▼
┌─────────────────────────────────┐
│  Fill form with:                │
│  - Type (Bug/Feat/Chore)        │
│  - Short description            │
│  - Scope (Web/iOS/Android/etc)  │
│  - Priority (Low/Medium/High)   │
│  - Severity (Blocker/Critical/  │
│              High/Low)          │
│  - Background & Purpose         │
│  - Current vs Expected behavior │
│  - Acceptance Criteria          │
└─────────────────┬───────────────┘
                  │
                  ▼
┌─────────────────────────────────┐
│  Upload Images (optional)       │
│  1. Select files                │
│  2. Client validates type/size  │
│  3. Request presigned URL       │
│  4. Direct upload to R2         │
│  5. Confirm upload to server    │
└─────────────────┬───────────────┘
                  │
                  ▼
┌─────────────────────────────────┐
│  Submit → createIssue()         │
│  - Server validates all fields  │
│  - Creates issue record         │
│  - Links uploaded images        │
│  - Returns issue ID             │
└─────────────────┬───────────────┘
                  │
                  ▼
┌─────────────────────────────────┐
│  Redirect to /issues/[id]       │
└─────────────────────────────────┘
```

### 2. Image Upload Flow (Presigned URL Pattern)
```
┌───────────┐         ┌───────────────┐         ┌─────────────────┐
│  Client   │         │  API Server   │         │  Cloudflare R2  │
└─────┬─────┘         └───────┬───────┘         └────────┬────────┘
      │                       │                          │
      │ POST /api/issues/     │                          │
      │   images/presign      │                          │
      │ {filename, contentType, size}                    │
      │──────────────────────▶│                          │
      │                       │                          │
      │                       │ Generate presigned PUT URL
      │                       │ with 15min expiry        │
      │                       │                          │
      │ {uploadUrl, objectKey,│                          │
      │  imageId}             │                          │
      │◀──────────────────────│                          │
      │                       │                          │
      │ PUT (direct upload)   │                          │
      │ with file binary      │                          │
      │─────────────────────────────────────────────────▶│
      │                       │                          │
      │ 200 OK                │                          │
      │◀─────────────────────────────────────────────────│
      │                       │                          │
      │ POST /api/issues/     │                          │
      │   images/confirm      │                          │
      │ {imageId}             │                          │
      │──────────────────────▶│                          │
      │                       │ Mark image as uploaded   │
      │                       │ in database              │
      │ 200 OK                │                          │
      │◀──────────────────────│                          │
```

## Database Schema

### Entity Relationship Diagram
```
┌─────────────────────────────────────────────────────────────────┐
│                          profiles                                │
├─────────────────────────────────────────────────────────────────┤
│ id: UUID (PK)                                                    │
│ email: TEXT (UNIQUE)                                             │
│ full_name: TEXT                                                  │
│ role: 'admin' | 'member'                                         │
│ onboarding_completed: BOOLEAN                                    │
│ created_at: TIMESTAMP                                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ created_by (FK)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                           issues                                 │
├─────────────────────────────────────────────────────────────────┤
│ id: UUID (PK)                                                    │
│ title: TEXT (auto-generated)                                     │
│ type: 'bug' | 'feat' | 'chore'                                  │
│ short_description: TEXT                                          │
│ scope: 'web' | 'ios' | 'android' | 'admin' | 'api' | 'other'    │
│ priority: 'low' | 'medium' | 'high'                             │
│ severity: 'blocker' | 'critical' | 'high' | 'low'               │
│ status: 'not_started' | 'in_progress' | 'done' | 'cancelled'    │
│ why_background: TEXT (markdown)                                  │
│ current_behavior: TEXT (markdown)                                │
│ expected_behavior: TEXT (markdown)                               │
│ acceptance_criteria: TEXT (markdown)                             │
│ created_by: UUID (FK → profiles.id)                             │
│ created_at: TIMESTAMP                                            │
│ updated_at: TIMESTAMP                                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ issue_id (FK)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        issue_images                              │
├─────────────────────────────────────────────────────────────────┤
│ id: UUID (PK)                                                    │
│ issue_id: UUID (FK → issues.id, nullable for pending uploads)   │
│ object_key: TEXT (R2 path)                                       │
│ filename: TEXT (original filename)                               │
│ content_type: TEXT (mime type)                                   │
│ size: INTEGER (bytes)                                            │
│ url: TEXT (public URL)                                           │
│ uploaded: BOOLEAN (default false)                                │
│ uploaded_by: UUID (FK → profiles.id)                            │
│ created_at: TIMESTAMP                                            │
└─────────────────────────────────────────────────────────────────┘
```

## Authentication & Authorization

### Auth Flow
1. User signs in via Google OAuth (Supabase Auth)
2. Middleware checks session on protected routes
3. Email domain validation via `ALLOWED_EMAIL_DOMAINS` env var
4. Admin status checked via `app_admins` table

### Permission Matrix
| Action | Any Member | Creator | Admin |
|--------|-----------|---------|-------|
| Create Issue | ✅ | - | ✅ |
| View Issues | ✅ | ✅ | ✅ |
| Edit Issue | ❌ | ✅ | ✅ |
| Delete Issue | ❌ | ✅ | ✅ |
| Change Status | ✅ | ✅ | ✅ |
| Upload Images | ✅ | ✅ | ✅ |
| Delete Images | ❌ | ✅ | ✅ |

## File Structure
```
src/
├── app/
│   ├── actions/
│   │   └── issues.ts              # Server actions for issues
│   ├── api/
│   │   └── issues/
│   │       └── images/
│   │           ├── presign/route.ts    # Generate presigned URL
│   │           ├── confirm/route.ts    # Confirm upload
│   │           └── [id]/route.ts       # Delete image
│   └── issues/
│       ├── page.tsx               # Issue list
│       ├── new/
│       │   └── page.tsx           # Create issue
│       └── [id]/
│           ├── page.tsx           # Issue detail
│           └── edit/
│               └── page.tsx       # Edit issue
├── components/
│   └── issues/
│       ├── IssueList.tsx
│       ├── IssueCard.tsx
│       ├── IssueForm.tsx
│       ├── IssueDetail.tsx
│       ├── ImageUploader.tsx
│       ├── ImageGallery.tsx
│       └── StatusBadge.tsx
├── lib/
│   ├── r2.ts                      # Cloudflare R2 client
│   └── validations/
│       └── issue.ts               # Zod schemas
└── types/
    └── issues.ts                  # TypeScript types
```

## Environment Variables
```bash
# Database (existing)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Auth (new - for domain restriction)
ALLOWED_EMAIL_DOMAINS=nuvaclub.com,company.com

# Cloudflare R2 (new)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=nuvaclub-issues
R2_PUBLIC_BASE_URL=https://pub-xxx.r2.dev
```

## Integration Points

### Existing Homepage Button
The "建立 Issue 單" button should be added to:
1. **Header.tsx** - Add navigation link for authenticated users
2. **HeroSection.tsx** - Can add a secondary action button
3. **StepDetail.tsx** - Add contextual issue creation for a step

### Code to Add Button (Header.tsx example)
```tsx
{userData?.user && (
  <Link href="/issues/new" className="...">
    建立 Issue 單
  </Link>
)}
```

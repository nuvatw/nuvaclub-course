# Integration Guide

## Integrating the Issue System with the Existing Site

The issue tracking system has been designed to integrate seamlessly with the existing Course Production Tracker. Here's how it works:

## 1. Navigation Integration

The "建立 Issue 單" button has been added to the `Header.tsx` component. When a user is logged in, they will see:

- **Issues** link - navigates to the issue list (`/issues`)
- **建立 Issue 單** button - navigates to create a new issue (`/issues/new`)

### Code Location
`src/components/layout/Header.tsx`

```tsx
{user ? (
  <>
    <Link
      href="/issues"
      className="text-sm text-zinc-400 hover:text-foreground transition-colors"
    >
      Issues
    </Link>
    <Link href="/issues/new">
      <Button variant="primary" size="sm">
        <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        建立 Issue 單
      </Button>
    </Link>
    {/* ... rest of header */}
  </>
)}
```

## 2. Route Structure

The issue system adds the following routes:

| Route | Description |
|-------|-------------|
| `/issues` | Issue list with filters and search |
| `/issues/new` | Create a new issue |
| `/issues/[id]` | View issue details |
| `/issues/[id]/edit` | Edit an existing issue |

## 3. Authentication Integration

The issue system uses the existing Supabase authentication:

- All `/issues/*` routes require authentication
- The middleware (`src/lib/supabase/middleware.ts`) has been updated to protect these routes
- Users must complete onboarding before accessing issues (existing behavior)

### Permission Model

| Action | Who Can Do It |
|--------|---------------|
| View issues | Any authenticated member |
| Create issues | Any authenticated member |
| Edit issues | Creator or admin |
| Delete issues | Creator or admin |
| Change status | Any authenticated member |

## 4. Database Integration

The issue system adds two new tables to the existing Supabase schema:

- `issues` - Main issue records
- `issue_images` - Image attachments for issues

Both tables use:
- The existing `profiles` table for user references
- The existing `is_current_user_admin()` function for permission checks
- Row Level Security (RLS) policies consistent with the existing system

## 5. Styling Integration

The issue components use the same:
- Tailwind CSS classes
- CSS variables (defined in `globals.css`)
- Design patterns (dark theme, card styles, button variants)
- Framer Motion animations

## 6. API Integration

### Server Actions
New server actions are in `src/app/actions/issues.ts`:
- `createIssue()`
- `getIssues()`
- `getIssueById()`
- `updateIssue()`
- `updateIssueStatus()`
- `deleteIssue()`
- `deleteIssueImage()`
- `canEditIssue()`

### API Routes (for image uploads)
- `POST /api/issues/images/presign` - Get presigned upload URL
- `POST /api/issues/images/confirm` - Confirm upload completed
- `DELETE /api/issues/images/[id]` - Delete an image

## 7. Component Reuse

The issue system reuses existing components:
- `Button` from `@/components/ui/Button`
- `Skeleton` from `@/components/ui/Skeleton`
- `formatDate` from `@/lib/utils`

And adds new components in `src/components/issues/`:
- `IssueList` - List with filters
- `IssueCard` - Card display for issues
- `IssueForm` - Create/edit form
- `IssueDetail` - Full detail view
- `StatusBadge` - Status/priority/severity badges
- `ImageUploader` - Upload component
- `ImageGallery` - Image display with lightbox

## 8. Adding the Button Elsewhere

If you want to add the "建立 Issue 單" button in other locations (e.g., on a project detail page), use:

```tsx
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

// Basic link
<Link href="/issues/new">
  <Button>建立 Issue 單</Button>
</Link>

// With pre-filled data (e.g., from a specific step)
<Link href={`/issues/new?scope=web&type=bug`}>
  <Button>回報問題</Button>
</Link>
```

## 9. Extending the System

### Adding Comments

To add a comment system to issues:

1. Create a new table `issue_comments` in the database
2. Add a new component `IssueComments.tsx`
3. Add server actions for comment CRUD
4. Include the component in `IssueDetail.tsx`

### Adding Activity Log

To track changes and status updates:

1. Create an `issue_activities` table
2. Add triggers to log changes
3. Display activity in the issue detail view

### Linking Issues to Projects/Steps

To associate issues with specific projects or steps:

1. Add `project_id` and `step_id` columns to the `issues` table
2. Update the form to allow selecting a project/step
3. Update filters to show issues per project

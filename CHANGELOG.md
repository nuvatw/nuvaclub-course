# Changelog

All notable changes to the nuvaClub Course Production Tracker will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-02-05

### Summary

This release completes a comprehensive 10-week improvement sprint, addressing 40 issues across code quality, performance, security, and UX. The application is now production-ready with enhanced reliability, accessibility, and real-time collaboration features.

### Features

- **Real-time Collaboration**: Added Supabase Realtime subscriptions for issues, project steps, and comments. Multiple users can now see updates instantly without refreshing.
- **Toast Notification System**: Implemented a polished toast notification system with support for success, error, info, and warning messages. Includes auto-dismiss, manual dismiss, and queue management.
- **Error Boundaries**: Added React Error Boundaries throughout the application for graceful error handling. Users see friendly error messages with retry options instead of blank screens.
- **Focus Trap Hook**: Created `useFocusTrap` hook for proper modal focus management and accessibility.

### Improvements

#### Performance
- **Optimistic Updates**: Implemented `useOptimistic` for issue status, issue priority, step status, and comment operations. UI updates instantly while server syncs in background.
- **React.memo Optimization**: Applied `React.memo` to list components (`IssueCard`, `ProjectCard`, `StepList`) to prevent unnecessary re-renders.
- **Next.js Image Component**: Replaced all `<img>` elements with Next.js `<Image>` for automatic optimization, lazy loading, and better Core Web Vitals.
- **Framer Motion Optimization**: Configured modular imports and animation presets to reduce bundle size.

#### Security
- **Rate Limiting**: Implemented sliding window rate limiting for all image upload API routes (presign, confirm, delete).
- **Input Sanitization**: Added comprehensive sanitization utilities for SQL patterns, regex, XSS prevention, and UUID validation.
- **Environment Validation**: Created Zod-based environment variable validation with clear error messages for missing or invalid configuration.

#### Code Quality
- **Zero ESLint Errors**: Resolved all linting issues including React Compiler memoization warnings and useEffect state patterns.
- **TypeScript Strict Mode**: Eliminated all `any` types with proper type guards and validation functions.
- **JSDoc Documentation**: Added comprehensive documentation to all server actions, hooks, and utility functions.
- **Consistent Error Handling**: Standardized on Result type pattern (`{ success, data/error }`) across all server actions.

#### Accessibility
- **ARIA Labels**: Added proper `aria-label` attributes to all icon-only buttons.
- **Focus Management**: Improved focus handling in modals and dropdowns.
- **Keyboard Navigation**: Enhanced keyboard support throughout the application.
- **Screen Reader Support**: Added `aria-live` regions for dynamic content updates.

#### User Experience
- **Loading States**: Added skeleton loading states for all routes.
- **Navigation Progress**: Implemented visual navigation progress indicator.
- **Collapsible Sidebar**: Added persistent sidebar collapse state with localStorage.

### Bug Fixes

- Fixed React Compiler memoization errors in `IssueForm.tsx` by extracting primitive values for dependency arrays.
- Fixed synchronous setState warnings in `Sidebar.tsx`, `SidebarContext.tsx`, and `NavigationProgress.tsx`.
- Fixed TypeScript `any` type usage in `issues/page.tsx` filter handling.
- Removed unused variables and imports throughout the codebase.
- Fixed potential SQL pattern injection in search queries.

### Technical Debt

- **Testing Infrastructure**: Set up Vitest with React Testing Library. Added unit tests for sanitization utilities, rate limiting, and validation schemas.
- **Constants Extraction**: Moved magic numbers to named constants (file sizes, URL expiry times, step definitions).
- **Import Organization**: Standardized import ordering across all files.

### Dependencies

- Updated to Next.js 16.1.6
- Updated to React 19.2.3
- Updated to Tailwind CSS 4
- Updated to Zod 4.3.6
- Added Vitest for testing

### Documentation

- Updated PRD with completion status for all 40 items
- Added JSDoc comments to all public APIs
- Created this CHANGELOG

### Migration Notes

No breaking changes. This release is backward compatible with v1.0.0 data.

---

## [1.0.0] - 2026-01-01

### Initial Release

- Course production tracking with 20-step workflow
- Issue management system with image uploads
- Google OAuth authentication via Supabase
- Cloudflare R2 integration for image storage
- Role-based access control (admin/member)
- Traditional Chinese UI

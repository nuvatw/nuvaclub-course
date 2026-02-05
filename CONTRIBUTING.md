# Contributing to nuvaClub Course Production Tracker

Thank you for your interest in contributing to the nuvaClub Course Production Tracker. This document provides guidelines and instructions for contributing.

## Table of Contents

- [Development Setup](#development-setup)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)

## Development Setup

### Prerequisites

- Node.js 18.x or later
- npm or pnpm
- A Supabase project (for database and authentication)
- Cloudflare R2 bucket (optional, for image uploads)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/nuvaclub-course.git
   cd nuvaclub-course
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Configure your `.env.local` with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

   # Optional - for image uploads
   R2_ACCOUNT_ID=your-account-id
   R2_ACCESS_KEY_ID=your-access-key
   R2_SECRET_ACCESS_KEY=your-secret-key
   R2_BUCKET_NAME=nuvaclub-issues
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

### Database Setup

1. Create a new Supabase project
2. Run the migrations in `supabase/migrations/` in order
3. Set up Google OAuth in Supabase Auth settings
4. Add yourself to the `app_admins` table if needed

## Code Style Guidelines

### General Principles

- Write clear, readable code over clever, compact code
- Prefer explicit over implicit
- Keep functions focused and small
- Add JSDoc comments to exported functions

### TypeScript

- Use strict TypeScript - avoid `any` type
- Define explicit return types for exported functions
- Use type guards for runtime type checking
- Prefer interfaces over type aliases for object shapes

```typescript
// Good
export function getIssueById(id: string): Promise<Issue | null> {
  // ...
}

// Avoid
export function getIssueById(id: any) {
  // ...
}
```

### React Components

- Use the `function` keyword for component definitions
- Define explicit Props interfaces
- Prefer named exports over default exports
- Use `'use client'` directive only when necessary

```typescript
// Good
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
}

export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>
}
```

### Import Order

Organize imports in this order:
1. React/Next.js imports
2. Third-party libraries
3. Internal modules (absolute paths)
4. Relative imports
5. Type imports

```typescript
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { formatDate } from './utils'
import type { Issue } from '@/types/issues'
```

### Server Actions

- Return consistent `{ success, data?, error? }` objects
- Validate all inputs with Zod schemas
- Handle errors gracefully - never expose internal errors
- Revalidate affected paths after mutations

```typescript
export async function updateIssue(
  id: string,
  input: UpdateIssueInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = updateIssueSchema.parse(input)
    // ... update logic
    revalidatePath('/issues')
    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Unknown error' }
  }
}
```

### Styling

- Use Tailwind CSS for styling
- Follow existing color conventions (see `globals.css`)
- Use CSS variables for theme colors
- Avoid inline styles

### Error Handling

- Prefer returning error objects over throwing
- Use try/catch only when necessary
- Provide user-friendly error messages (in Traditional Chinese for UI)
- Log errors with context for debugging

## Testing Requirements

### Running Tests

```bash
# Watch mode (during development)
npm test

# Single run (for CI)
npm run test:run

# With coverage
npm run test:coverage
```

### What to Test

- **Server Actions**: Test business logic and validation
- **Utility Functions**: Test all edge cases
- **Validation Schemas**: Test valid and invalid inputs
- **Custom Hooks**: Test state management and effects

### Test Structure

```typescript
import { describe, it, expect } from 'vitest'
import { sanitizeSearchInput } from '../sanitize'

describe('sanitizeSearchInput', () => {
  it('should escape percent signs', () => {
    expect(sanitizeSearchInput('50%')).toBe('50\\%')
  })

  it('should handle empty input', () => {
    expect(sanitizeSearchInput('')).toBe('')
  })
})
```

### Coverage Requirements

- Aim for 60%+ coverage on server actions
- All utility functions should have tests
- All validation schemas should have tests

## Pull Request Process

### Before Submitting

1. Ensure all tests pass: `npm run test:run`
2. Ensure linting passes: `npm run lint`
3. Ensure build succeeds: `npm run build`
4. Update documentation if needed

### PR Guidelines

1. **Keep PRs focused** - One feature or fix per PR
2. **Write descriptive titles** - Use conventional commits format
3. **Provide context** - Explain what and why in the description
4. **Include screenshots** - For UI changes
5. **Reference issues** - Link related issues

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:
```
feat(issues): add image upload functionality
fix(auth): handle expired session gracefully
docs(readme): update setup instructions
```

### Review Process

1. Open a PR against `main`
2. Fill out the PR template
3. Request review from maintainers
4. Address feedback
5. Squash and merge once approved

## Project Structure

For detailed project structure, see [ARCHITECTURE.md](./docs/ARCHITECTURE.md).

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `src/app/actions/` | Server Actions for data mutations |
| `src/components/` | React components organized by feature |
| `src/lib/` | Utilities, hooks, and shared code |
| `src/types/` | TypeScript type definitions |
| `docs/` | Project documentation |
| `supabase/` | Database migrations and config |

## Getting Help

- Check existing [documentation](./docs/)
- Search [existing issues](https://github.com/your-org/nuvaclub-course/issues)
- Ask in the team Slack channel

## License

By contributing, you agree that your contributions will be licensed under the project's license.

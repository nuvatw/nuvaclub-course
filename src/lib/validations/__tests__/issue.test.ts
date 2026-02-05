import { describe, it, expect } from 'vitest'
import {
  issuePrioritySchema,
  issueStatusSchema,
  createIssueSchema,
  updateIssueSchema,
  updateStatusSchema,
  updatePrioritySchema,
  presignImageSchema,
  confirmUploadSchema,
  issueFiltersSchema,
} from '../issue'

describe('issuePrioritySchema', () => {
  it('accepts valid priorities', () => {
    expect(issuePrioritySchema.parse('low')).toBe('low')
    expect(issuePrioritySchema.parse('medium')).toBe('medium')
    expect(issuePrioritySchema.parse('high')).toBe('high')
  })

  it('rejects invalid priorities', () => {
    expect(() => issuePrioritySchema.parse('critical')).toThrow()
    expect(() => issuePrioritySchema.parse('')).toThrow()
    expect(() => issuePrioritySchema.parse('HIGH')).toThrow()
  })
})

describe('issueStatusSchema', () => {
  it('accepts valid statuses', () => {
    expect(issueStatusSchema.parse('not_started')).toBe('not_started')
    expect(issueStatusSchema.parse('in_progress')).toBe('in_progress')
    expect(issueStatusSchema.parse('done')).toBe('done')
    expect(issueStatusSchema.parse('cancelled')).toBe('cancelled')
  })

  it('rejects invalid statuses', () => {
    expect(() => issueStatusSchema.parse('pending')).toThrow()
    expect(() => issueStatusSchema.parse('')).toThrow()
    expect(() => issueStatusSchema.parse('DONE')).toThrow()
  })
})

describe('createIssueSchema', () => {
  const validIssue = {
    title: 'Valid issue title here',
    priority: 'medium',
    why_background: 'This is the background explanation for the issue',
    current_behavior: 'This is what currently happens in the system',
    expected_behavior: 'This is what should happen instead',
    acceptance_criteria: 'These are the acceptance criteria for the fix',
  }

  it('accepts valid issue data', () => {
    const result = createIssueSchema.safeParse(validIssue)
    expect(result.success).toBe(true)
  })

  it('accepts issue with optional image_ids', () => {
    const issueWithImages = {
      ...validIssue,
      image_ids: ['550e8400-e29b-41d4-a716-446655440000'],
    }
    const result = createIssueSchema.safeParse(issueWithImages)
    expect(result.success).toBe(true)
  })

  describe('title validation', () => {
    it('rejects title shorter than 5 characters', () => {
      const result = createIssueSchema.safeParse({
        ...validIssue,
        title: 'abc',
      })
      expect(result.success).toBe(false)
    })

    it('rejects title longer than 200 characters', () => {
      const result = createIssueSchema.safeParse({
        ...validIssue,
        title: 'a'.repeat(201),
      })
      expect(result.success).toBe(false)
    })

    it('accepts title at minimum length', () => {
      const result = createIssueSchema.safeParse({
        ...validIssue,
        title: 'abcde',
      })
      expect(result.success).toBe(true)
    })

    it('accepts title at maximum length', () => {
      const result = createIssueSchema.safeParse({
        ...validIssue,
        title: 'a'.repeat(200),
      })
      expect(result.success).toBe(true)
    })
  })

  describe('text field validation', () => {
    const textFields = [
      'why_background',
      'current_behavior',
      'expected_behavior',
      'acceptance_criteria',
    ] as const

    textFields.forEach((field) => {
      it(`rejects ${field} shorter than 10 characters`, () => {
        const result = createIssueSchema.safeParse({
          ...validIssue,
          [field]: 'short',
        })
        expect(result.success).toBe(false)
      })

      it(`rejects ${field} longer than 5000 characters`, () => {
        const result = createIssueSchema.safeParse({
          ...validIssue,
          [field]: 'a'.repeat(5001),
        })
        expect(result.success).toBe(false)
      })

      it(`accepts ${field} at minimum length`, () => {
        const result = createIssueSchema.safeParse({
          ...validIssue,
          [field]: 'a'.repeat(10),
        })
        expect(result.success).toBe(true)
      })
    })
  })

  describe('image_ids validation', () => {
    it('accepts valid UUIDs', () => {
      const result = createIssueSchema.safeParse({
        ...validIssue,
        image_ids: [
          '550e8400-e29b-41d4-a716-446655440000',
          '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        ],
      })
      expect(result.success).toBe(true)
    })

    it('rejects invalid UUIDs', () => {
      const result = createIssueSchema.safeParse({
        ...validIssue,
        image_ids: ['not-a-uuid'],
      })
      expect(result.success).toBe(false)
    })

    it('accepts empty array', () => {
      const result = createIssueSchema.safeParse({
        ...validIssue,
        image_ids: [],
      })
      expect(result.success).toBe(true)
    })
  })
})

describe('updateIssueSchema', () => {
  it('accepts partial updates', () => {
    const result = updateIssueSchema.safeParse({ title: 'Updated title here' })
    expect(result.success).toBe(true)
  })

  it('accepts empty object', () => {
    const result = updateIssueSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('accepts status update', () => {
    const result = updateIssueSchema.safeParse({ status: 'done' })
    expect(result.success).toBe(true)
  })

  it('accepts multiple field updates', () => {
    const result = updateIssueSchema.safeParse({
      title: 'New title here',
      priority: 'high',
      status: 'in_progress',
    })
    expect(result.success).toBe(true)
  })

  it('validates title length when provided', () => {
    const result = updateIssueSchema.safeParse({ title: 'abc' })
    expect(result.success).toBe(false)
  })
})

describe('updateStatusSchema', () => {
  it('accepts valid status', () => {
    expect(updateStatusSchema.parse({ status: 'done' })).toEqual({
      status: 'done',
    })
  })

  it('rejects missing status', () => {
    const result = updateStatusSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('rejects invalid status', () => {
    const result = updateStatusSchema.safeParse({ status: 'invalid' })
    expect(result.success).toBe(false)
  })
})

describe('updatePrioritySchema', () => {
  it('accepts valid priority', () => {
    expect(updatePrioritySchema.parse({ priority: 'high' })).toEqual({
      priority: 'high',
    })
  })

  it('rejects missing priority', () => {
    const result = updatePrioritySchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('rejects invalid priority', () => {
    const result = updatePrioritySchema.safeParse({ priority: 'urgent' })
    expect(result.success).toBe(false)
  })
})

describe('presignImageSchema', () => {
  const validPresign = {
    filename: 'test.jpg',
    content_type: 'image/jpeg',
    size: 1024,
  }

  it('accepts valid presign request', () => {
    const result = presignImageSchema.safeParse(validPresign)
    expect(result.success).toBe(true)
  })

  it('accepts all supported image types', () => {
    const types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    types.forEach((type) => {
      const result = presignImageSchema.safeParse({
        ...validPresign,
        content_type: type,
      })
      expect(result.success).toBe(true)
    })
  })

  it('rejects unsupported image types', () => {
    const result = presignImageSchema.safeParse({
      ...validPresign,
      content_type: 'image/gif',
    })
    expect(result.success).toBe(false)
  })

  it('accepts optional issue_id', () => {
    const result = presignImageSchema.safeParse({
      ...validPresign,
      issue_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid issue_id', () => {
    const result = presignImageSchema.safeParse({
      ...validPresign,
      issue_id: 'not-a-uuid',
    })
    expect(result.success).toBe(false)
  })

  describe('filename validation', () => {
    it('rejects empty filename', () => {
      const result = presignImageSchema.safeParse({
        ...validPresign,
        filename: '',
      })
      expect(result.success).toBe(false)
    })

    it('rejects filename longer than 255 characters', () => {
      const result = presignImageSchema.safeParse({
        ...validPresign,
        filename: 'a'.repeat(256),
      })
      expect(result.success).toBe(false)
    })
  })

  describe('size validation', () => {
    it('rejects size of 0', () => {
      const result = presignImageSchema.safeParse({
        ...validPresign,
        size: 0,
      })
      expect(result.success).toBe(false)
    })

    it('rejects negative size', () => {
      const result = presignImageSchema.safeParse({
        ...validPresign,
        size: -1,
      })
      expect(result.success).toBe(false)
    })

    it('rejects size over 10MB', () => {
      const result = presignImageSchema.safeParse({
        ...validPresign,
        size: 10 * 1024 * 1024 + 1,
      })
      expect(result.success).toBe(false)
    })

    it('accepts size at exactly 10MB', () => {
      const result = presignImageSchema.safeParse({
        ...validPresign,
        size: 10 * 1024 * 1024,
      })
      expect(result.success).toBe(true)
    })
  })
})

describe('confirmUploadSchema', () => {
  it('accepts valid UUID', () => {
    const result = confirmUploadSchema.safeParse({
      image_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid UUID', () => {
    const result = confirmUploadSchema.safeParse({
      image_id: 'not-a-uuid',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing image_id', () => {
    const result = confirmUploadSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe('issueFiltersSchema', () => {
  it('accepts empty object with defaults', () => {
    const result = issueFiltersSchema.parse({})
    expect(result.status).toBe('all')
    expect(result.priority).toBe('all')
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  it('accepts valid status filter', () => {
    const result = issueFiltersSchema.parse({ status: 'done' })
    expect(result.status).toBe('done')
  })

  it('accepts all as status', () => {
    const result = issueFiltersSchema.parse({ status: 'all' })
    expect(result.status).toBe('all')
  })

  it('accepts valid priority filter', () => {
    const result = issueFiltersSchema.parse({ priority: 'high' })
    expect(result.priority).toBe('high')
  })

  it('accepts all as priority', () => {
    const result = issueFiltersSchema.parse({ priority: 'all' })
    expect(result.priority).toBe('all')
  })

  it('accepts search string', () => {
    const result = issueFiltersSchema.parse({ search: 'test query' })
    expect(result.search).toBe('test query')
  })

  it('accepts valid created_by UUID', () => {
    const result = issueFiltersSchema.parse({
      created_by: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.created_by).toBe('550e8400-e29b-41d4-a716-446655440000')
  })

  it('coerces page to number', () => {
    const result = issueFiltersSchema.parse({ page: '5' })
    expect(result.page).toBe(5)
  })

  it('coerces limit to number', () => {
    const result = issueFiltersSchema.parse({ limit: '50' })
    expect(result.limit).toBe(50)
  })

  it('enforces minimum page of 1', () => {
    const result = issueFiltersSchema.safeParse({ page: 0 })
    expect(result.success).toBe(false)
  })

  it('enforces minimum limit of 1', () => {
    const result = issueFiltersSchema.safeParse({ limit: 0 })
    expect(result.success).toBe(false)
  })

  it('enforces maximum limit of 100', () => {
    const result = issueFiltersSchema.safeParse({ limit: 101 })
    expect(result.success).toBe(false)
  })

  it('accepts limit at maximum', () => {
    const result = issueFiltersSchema.parse({ limit: 100 })
    expect(result.limit).toBe(100)
  })
})

import { describe, it, expect } from 'vitest'
import {
  sanitizeSearchInput,
  escapeRegex,
  sanitizeForDisplay,
  removeControlCharacters,
  sanitizeUserInput,
  sanitizeUUID,
} from '../sanitize'

describe('sanitizeSearchInput', () => {
  it('returns empty string for empty input', () => {
    expect(sanitizeSearchInput('')).toBe('')
  })

  it('returns empty string for null/undefined', () => {
    expect(sanitizeSearchInput(null as unknown as string)).toBe('')
    expect(sanitizeSearchInput(undefined as unknown as string)).toBe('')
  })

  it('escapes percent character', () => {
    expect(sanitizeSearchInput('100%')).toBe('100\\%')
    expect(sanitizeSearchInput('%test%')).toBe('\\%test\\%')
  })

  it('escapes underscore character', () => {
    expect(sanitizeSearchInput('test_name')).toBe('test\\_name')
    expect(sanitizeSearchInput('_prefix')).toBe('\\_prefix')
  })

  it('escapes backslash character', () => {
    expect(sanitizeSearchInput('path\\to\\file')).toBe('path\\\\to\\\\file')
  })

  it('escapes multiple special characters', () => {
    expect(sanitizeSearchInput('%_\\')).toBe('\\%\\_\\\\')
    expect(sanitizeSearchInput('100%_done\\')).toBe('100\\%\\_done\\\\')
  })

  it('preserves normal characters', () => {
    expect(sanitizeSearchInput('normal text')).toBe('normal text')
    expect(sanitizeSearchInput('Search Query 123')).toBe('Search Query 123')
  })
})

describe('escapeRegex', () => {
  it('returns empty string for empty input', () => {
    expect(escapeRegex('')).toBe('')
  })

  it('returns empty string for null/undefined', () => {
    expect(escapeRegex(null as unknown as string)).toBe('')
    expect(escapeRegex(undefined as unknown as string)).toBe('')
  })

  it('escapes dot character', () => {
    expect(escapeRegex('file.txt')).toBe('file\\.txt')
  })

  it('escapes asterisk and plus', () => {
    expect(escapeRegex('a*b+c')).toBe('a\\*b\\+c')
  })

  it('escapes question mark and caret', () => {
    expect(escapeRegex('a?b^c')).toBe('a\\?b\\^c')
  })

  it('escapes dollar sign', () => {
    expect(escapeRegex('$100')).toBe('\\$100')
  })

  it('escapes braces and parentheses', () => {
    expect(escapeRegex('{a}(b)')).toBe('\\{a\\}\\(b\\)')
  })

  it('escapes pipe and brackets', () => {
    expect(escapeRegex('a|b[c]')).toBe('a\\|b\\[c\\]')
  })

  it('escapes backslash', () => {
    expect(escapeRegex('a\\b')).toBe('a\\\\b')
  })

  it('escapes all special regex characters', () => {
    expect(escapeRegex('.*+?^${}()|[]\\')).toBe('\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\')
  })

  it('preserves normal characters', () => {
    expect(escapeRegex('normal text 123')).toBe('normal text 123')
  })
})

describe('sanitizeForDisplay', () => {
  it('returns empty string for empty input', () => {
    expect(sanitizeForDisplay('')).toBe('')
  })

  it('returns empty string for null/undefined', () => {
    expect(sanitizeForDisplay(null as unknown as string)).toBe('')
    expect(sanitizeForDisplay(undefined as unknown as string)).toBe('')
  })

  it('escapes ampersand', () => {
    expect(sanitizeForDisplay('A & B')).toBe('A &amp; B')
  })

  it('escapes less than sign', () => {
    expect(sanitizeForDisplay('<script>')).toBe('&lt;script&gt;')
  })

  it('escapes greater than sign', () => {
    expect(sanitizeForDisplay('a > b')).toBe('a &gt; b')
  })

  it('escapes double quotes', () => {
    expect(sanitizeForDisplay('say "hello"')).toBe('say &quot;hello&quot;')
  })

  it('escapes single quotes', () => {
    expect(sanitizeForDisplay("it's")).toBe('it&#x27;s')
  })

  it('escapes XSS attack vectors', () => {
    expect(sanitizeForDisplay('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    )
  })

  it('escapes event handlers', () => {
    expect(sanitizeForDisplay('<img onerror="alert(1)">')).toBe(
      '&lt;img onerror=&quot;alert(1)&quot;&gt;'
    )
  })

  it('preserves normal characters', () => {
    expect(sanitizeForDisplay('Hello World 123')).toBe('Hello World 123')
  })
})

describe('removeControlCharacters', () => {
  it('returns empty string for empty input', () => {
    expect(removeControlCharacters('')).toBe('')
  })

  it('returns empty string for null/undefined', () => {
    expect(removeControlCharacters(null as unknown as string)).toBe('')
    expect(removeControlCharacters(undefined as unknown as string)).toBe('')
  })

  it('removes null byte', () => {
    expect(removeControlCharacters('hello\x00world')).toBe('helloworld')
  })

  it('removes bell character', () => {
    expect(removeControlCharacters('test\x07test')).toBe('testtest')
  })

  it('removes backspace character', () => {
    expect(removeControlCharacters('test\x08test')).toBe('testtest')
  })

  it('preserves tab character', () => {
    expect(removeControlCharacters('hello\tworld')).toBe('hello\tworld')
  })

  it('preserves newline character', () => {
    expect(removeControlCharacters('hello\nworld')).toBe('hello\nworld')
  })

  it('preserves carriage return', () => {
    expect(removeControlCharacters('hello\rworld')).toBe('hello\rworld')
  })

  it('removes DEL character', () => {
    expect(removeControlCharacters('test\x7Ftest')).toBe('testtest')
  })

  it('removes multiple control characters', () => {
    expect(removeControlCharacters('\x00\x01\x02hello\x03\x04')).toBe('hello')
  })

  it('preserves normal text', () => {
    expect(removeControlCharacters('Normal Text 123!')).toBe('Normal Text 123!')
  })
})

describe('sanitizeUserInput', () => {
  it('returns empty string for empty input', () => {
    expect(sanitizeUserInput('')).toBe('')
  })

  it('returns empty string for null/undefined', () => {
    expect(sanitizeUserInput(null as unknown as string)).toBe('')
    expect(sanitizeUserInput(undefined as unknown as string)).toBe('')
  })

  it('removes control characters', () => {
    expect(sanitizeUserInput('hello\x00world')).toBe('helloworld')
  })

  it('trims whitespace', () => {
    expect(sanitizeUserInput('  hello world  ')).toBe('hello world')
  })

  it('limits length to default max of 1000', () => {
    const longString = 'a'.repeat(1500)
    expect(sanitizeUserInput(longString)).toBe('a'.repeat(1000))
  })

  it('limits length to custom max', () => {
    const longString = 'a'.repeat(100)
    expect(sanitizeUserInput(longString, 50)).toBe('a'.repeat(50))
  })

  it('combines control char removal, trim, and length limit', () => {
    const input = '  \x00hello world\x01  '
    expect(sanitizeUserInput(input, 10)).toBe('hello worl')
  })

  it('preserves normal input under limit', () => {
    expect(sanitizeUserInput('Hello World')).toBe('Hello World')
  })
})

describe('sanitizeUUID', () => {
  it('returns null for empty input', () => {
    expect(sanitizeUUID('')).toBeNull()
  })

  it('returns null for null/undefined', () => {
    expect(sanitizeUUID(null as unknown as string)).toBeNull()
    expect(sanitizeUUID(undefined as unknown as string)).toBeNull()
  })

  it('returns valid UUID in lowercase', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000'
    expect(sanitizeUUID(uuid)).toBe(uuid)
  })

  it('converts uppercase UUID to lowercase', () => {
    const uuid = '550E8400-E29B-41D4-A716-446655440000'
    expect(sanitizeUUID(uuid)).toBe('550e8400-e29b-41d4-a716-446655440000')
  })

  it('handles mixed case UUID', () => {
    const uuid = '550E8400-e29b-41D4-a716-446655440000'
    expect(sanitizeUUID(uuid)).toBe('550e8400-e29b-41d4-a716-446655440000')
  })

  it('trims whitespace from valid UUID', () => {
    const uuid = '  550e8400-e29b-41d4-a716-446655440000  '
    expect(sanitizeUUID(uuid)).toBe('550e8400-e29b-41d4-a716-446655440000')
  })

  it('returns null for invalid UUID format', () => {
    expect(sanitizeUUID('not-a-uuid')).toBeNull()
    expect(sanitizeUUID('550e8400-e29b-41d4-a716')).toBeNull()
    expect(sanitizeUUID('550e8400e29b41d4a716446655440000')).toBeNull()
  })

  it('returns null for UUID with invalid characters', () => {
    expect(sanitizeUUID('550g8400-e29b-41d4-a716-446655440000')).toBeNull()
    expect(sanitizeUUID('550e8400-e29b-41d4-a716-44665544000z')).toBeNull()
  })

  it('returns null for UUID with extra characters', () => {
    expect(sanitizeUUID('550e8400-e29b-41d4-a716-446655440000-extra')).toBeNull()
    expect(sanitizeUUID('prefix-550e8400-e29b-41d4-a716-446655440000')).toBeNull()
  })
})

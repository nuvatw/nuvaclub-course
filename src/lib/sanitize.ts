/**
 * Input sanitization utilities for security
 * Provides functions to sanitize user input before using in queries or display
 */

/**
 * Escapes special characters used in SQL LIKE/ILIKE patterns
 * Prevents SQL pattern injection in search queries
 *
 * @param input - The search string to sanitize
 * @returns Sanitized string safe for use in LIKE/ILIKE queries
 */
export function sanitizeSearchInput(input: string): string {
  if (!input) return ''

  // Escape special LIKE pattern characters: % _ \
  return input.replace(/[%_\\]/g, (char) => `\\${char}`)
}

/**
 * Escapes special regex characters in a string
 * Use when building dynamic regex patterns from user input
 *
 * @param input - The string to escape
 * @returns String safe for use in RegExp constructor
 */
export function escapeRegex(input: string): string {
  if (!input) return ''

  // Escape special regex characters
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Sanitizes user input for safe display by removing/escaping potentially dangerous characters
 * Primarily protects against XSS when rendering user-provided content
 *
 * Note: React already escapes content in JSX, but this provides additional safety
 * for cases where dangerouslySetInnerHTML might be used
 *
 * @param input - The user input to sanitize
 * @returns Sanitized string safe for display
 */
export function sanitizeForDisplay(input: string): string {
  if (!input) return ''

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/**
 * Removes null bytes and other control characters from input
 * Protects against null byte injection attacks
 *
 * @param input - The string to clean
 * @returns String with control characters removed
 */
export function removeControlCharacters(input: string): string {
  if (!input) return ''

  // Remove null bytes and other control characters (ASCII 0-31 except tab, newline, carriage return)
   
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
}

/**
 * Comprehensive sanitization for general user input
 * Combines control character removal with length limiting
 *
 * @param input - The user input to sanitize
 * @param maxLength - Maximum allowed length (default: 1000)
 * @returns Sanitized and truncated string
 */
export function sanitizeUserInput(input: string, maxLength = 1000): string {
  if (!input) return ''

  // Remove control characters
  let sanitized = removeControlCharacters(input)

  // Trim whitespace
  sanitized = sanitized.trim()

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength)
  }

  return sanitized
}

/**
 * Validates and sanitizes a UUID string
 * Returns null if the input is not a valid UUID format
 *
 * @param input - The potential UUID string
 * @returns Validated UUID string or null
 */
export function sanitizeUUID(input: string): string | null {
  if (!input) return null

  // Standard UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  const trimmed = input.trim().toLowerCase()

  if (uuidRegex.test(trimmed)) {
    return trimmed
  }

  return null
}

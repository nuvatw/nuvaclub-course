/**
 * Formats a date into a human-readable string (e.g., "Jan 15, 2024")
 *
 * @param date - Date string or Date object to format
 * @returns Formatted date string in en-US locale
 *
 * @example
 * formatDate('2024-01-15') // "Jan 15, 2024"
 * formatDate(new Date()) // "Feb 5, 2026"
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

/**
 * Formats a date with time into a human-readable string (e.g., "Jan 15, 2024, 3:30 PM")
 *
 * @param date - Date string or Date object to format
 * @returns Formatted date and time string in en-US locale
 *
 * @example
 * formatDateTime('2024-01-15T15:30:00') // "Jan 15, 2024, 3:30 PM"
 */
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date))
}

/**
 * Returns the CSS color class for a step status
 *
 * @param status - The step status: 'not_started', 'in_progress', or 'done'
 * @returns Tailwind CSS color class for the status
 *
 * @example
 * <span className={getStepStatusColor(step.status)}>{step.name}</span>
 * // 'done' -> 'text-success'
 * // 'in_progress' -> 'text-warning'
 * // 'not_started' -> 'text-muted'
 */
export function getStepStatusColor(status: 'not_started' | 'in_progress' | 'done'): string {
  switch (status) {
    case 'done':
      return 'text-success'
    case 'in_progress':
      return 'text-warning'
    default:
      return 'text-muted'
  }
}

/**
 * Returns the Tailwind CSS background color class for a production step category
 *
 * Maps category names to distinctive colors for visual differentiation
 * in the project workflow UI.
 *
 * @param category - The step category name
 * @returns Tailwind CSS background color class
 *
 * @example
 * <span className={getCategoryColor(step.category)}>{step.category}</span>
 * // 'Pre-Production' -> 'bg-purple-600'
 * // 'QA' -> 'bg-red-600'
 * // Unknown -> 'bg-muted'
 */
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Pre-Production': 'bg-purple-600',
    'Research': 'bg-blue-600',
    'Planning': 'bg-cyan-600',
    'Content': 'bg-emerald-600',
    'Creative': 'bg-pink-600',
    'Production': 'bg-orange-600',
    'Post-Production': 'bg-amber-600',
    'QA': 'bg-red-600',
    'Delivery': 'bg-green-600',
    'Marketing': 'bg-violet-600',
  }
  return colors[category] || 'bg-muted'
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date))
}

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

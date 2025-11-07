/**
 * Utility functions for formatting data
 */

/**
 * Format currency
 * @param amount - The amount to format
 * @param currency - The currency code (default: 'USD')
 * @returns Formatted currency string
 * @example
 * formatCurrency(1234.56) // '$1,234.56'
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Format date
 * @param date - The date to format
 * @param format - The format to use ('short', 'long', 'time', or 'iso')
 * @returns Formatted date string
 * @example
 * formatDate(new Date(), 'short') // 'Jan 1, 2023'
 */
export function formatDate(date: Date | string, format = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  if (format === 'short') {
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }
  
  if (format === 'long') {
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }
  
  if (format === 'time') {
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }
  
  return d.toISOString()
}

/**
 * Format duration
 * @param minutes - The duration in minutes
 * @returns Formatted duration string
 * @example
 * formatDuration(90) // '1 hr 30 min'
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`
  }
  
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (mins === 0) {
    return `${hours} hr`
  }
  
  return `${hours} hr ${mins} min`
}

/**
 * Format a date as relative time (e.g., "5 min ago", "2 days ago")
 * @param date - The date to format
 * @returns Relative time string or em dash if invalid
 * @example
 * formatTimeAgo(new Date(Date.now() - 3600_000)) // '1 hour ago'
 */
export function formatTimeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (!(d instanceof Date) || isNaN(d.getTime())) return '—'

  const now = new Date()
  const diffMs = d.getTime() - now.getTime() // past dates will be negative

  const rtf = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' })

  const seconds = Math.round(diffMs / 1000)
  const minutes = Math.round(seconds / 60)
  const hours = Math.round(minutes / 60)
  const days = Math.round(hours / 24)
  const weeks = Math.round(days / 7)
  const months = Math.round(days / 30)
  const years = Math.round(days / 365)

  const absSeconds = Math.abs(seconds)
  const absMinutes = Math.abs(minutes)
  const absHours = Math.abs(hours)
  const absDays = Math.abs(days)
  const absWeeks = Math.abs(weeks)
  const absMonths = Math.abs(months)

  if (absSeconds < 60) return rtf.format(seconds, 'second')
  if (absMinutes < 60) return rtf.format(minutes, 'minute')
  if (absHours < 24) return rtf.format(hours, 'hour')
  if (absDays < 7) return rtf.format(days, 'day')
  if (absWeeks < 4) return rtf.format(weeks, 'week')
  if (absMonths < 12) return rtf.format(months, 'month')
  return rtf.format(years, 'year')
}
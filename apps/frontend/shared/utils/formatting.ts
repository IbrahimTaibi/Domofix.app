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
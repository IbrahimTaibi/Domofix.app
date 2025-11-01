/**
 * Format a date to ISO string
 */
export function formatDateToISO(date: Date): string {
  return date.toISOString();
}

/**
 * Parse an ISO date string to Date object
 */
export function parseISODate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Get the current timestamp
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Check if a date is in the past
 */
export function isDateInPast(date: Date): boolean {
  return date < new Date();
}

/**
 * Check if a date is in the future
 */
export function isDateInFuture(date: Date): boolean {
  return date > new Date();
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Calculate the difference in days between two dates
 */
export function daysDifference(date1: Date, date2: Date): number {
  const timeDifference = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(timeDifference / (1000 * 3600 * 24));
}
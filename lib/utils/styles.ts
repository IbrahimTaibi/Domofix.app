import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes
 * @param inputs - Class values to merge
 * @returns Merged class string
 * @example
 * cn('text-red-500', isActive && 'bg-blue-500') // 'text-red-500 bg-blue-500' (if isActive is true)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
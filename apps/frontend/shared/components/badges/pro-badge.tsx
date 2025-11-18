import React from 'react'

interface ProBadgeProps {
  size?: 'sm' | 'md'
  className?: string
}

export default function ProBadge({ size = 'sm', className }: ProBadgeProps) {
  const base = 'inline-flex items-center justify-center rounded-md font-semibold uppercase tracking-wider transition-all duration-200'
  const tone = 'bg-gradient-to-br from-primary-50 to-indigo-50 text-primary-700 border border-primary-200/60 shadow-sm hover:shadow-md hover:border-primary-300'
  const dim = size === 'md' ? 'text-[10px] px-2.5 py-1' : 'text-[9px] px-2 py-0.5'
  return (
    <span role="status" aria-label="Pro" className={[base, tone, dim, className || ''].join(' ').trim()}>
      Pro
    </span>
  )
}

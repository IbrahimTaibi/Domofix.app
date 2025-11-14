import React from 'react'

interface ProBadgeProps {
  size?: 'sm' | 'md'
  className?: string
}

export default function ProBadge({ size = 'sm', className }: ProBadgeProps) {
  const base = 'inline-flex items-center justify-center rounded-full font-semibold uppercase tracking-wide'
  const tone = 'bg-gradient-to-r from-primary-200 to-indigo-200 text-primary-900 border border-primary-300 shadow'
  const dim = size === 'md' ? 'text-[11px] px-3 py-0.5' : 'text-[10px] px-2.5 py-0.5'
  return (
    <span role="status" aria-label="Pro" className={[base, tone, dim, className || ''].join(' ').trim()}>
      Pro
    </span>
  )
}

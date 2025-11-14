import React from 'react'

interface NotificationDotProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function NotificationDot({ size = 'sm', className }: NotificationDotProps) {
  const dim = size === 'lg' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-3 h-3' : 'w-2.5 h-2.5'
  return (
    <span role="status" aria-label="Notification" className={["relative inline-flex", dim, className || ''].join(' ').trim()}>
      <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-50 animate-ping" />
      <span className="relative inline-flex rounded-full bg-red-600 h-full w-full ring-2 ring-white" />
    </span>
  )
}

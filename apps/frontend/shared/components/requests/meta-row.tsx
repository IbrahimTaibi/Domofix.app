import React from 'react'
import clsx from 'clsx'

export interface MetaRowProps {
  icon: React.ReactNode
  label: string
  value: string
  className?: string
}

export default function MetaRow({ icon, label, value, className }: MetaRowProps) {
  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gray-100">
        {icon}
      </span>
      <span className="text-sm text-gray-600">
        <span className="text-gray-500">{label}:</span> {value}
      </span>
    </div>
  )
}


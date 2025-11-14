import React from 'react'

export default function ListSkeleton() {
  return (
    <ul className="space-y-3" aria-live="polite" role="status">
      {Array.from({ length: 5 }).map((_, i) => (
        <li key={i} className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
          <div className="mt-3 space-y-2">
            <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-5/6 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
          </div>
        </li>
      ))}
    </ul>
  )
}


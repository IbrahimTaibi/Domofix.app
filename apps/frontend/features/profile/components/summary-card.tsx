'use client'

import { User } from '@darigo/shared-types'

type SummaryCardProps = {
  user: User
}

export default function SummaryCard({ user }: SummaryCardProps) {
  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4 sticky top-[calc(var(--navbar-height,4rem)+var(--secondary-navbar-height,0px)+0.75rem)]">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center font-semibold">
          {(user.firstName?.charAt(0) || '').toUpperCase()}
          {(user.lastName?.charAt(0) || '').toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate">
            {user.firstName} {user.lastName}
          </div>
          <div className="text-xs text-gray-600 capitalize">{user.role}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center mb-3">
        <div className="rounded-md bg-gray-50 border border-gray-200 p-2 min-w-0">
          <div className="text-xs text-gray-500">Joined</div>
          <div
            className="text-sm font-medium text-gray-900 truncate"
            title={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
          >
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
          </div>
        </div>
        <div className="rounded-md bg-gray-50 border border-gray-200 p-2 min-w-0">
          <div className="text-xs text-gray-500">Updated</div>
          <div
            className="text-sm font-medium text-gray-900 truncate"
            title={user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : '—'}
          >
            {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : '—'}
          </div>
        </div>
        <div className="rounded-md bg-gray-50 border border-gray-200 p-2 min-w-0">
          <div className="text-xs text-gray-500">Status</div>
          <div
            className="text-sm font-medium text-gray-900 capitalize truncate"
            title={user.providerStatus || 'active'}
          >
            {user.providerStatus || 'active'}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          <span className="break-all">{user.email}</span>
        </div>
        {user.phoneNumber && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            <span>{user.phoneNumber}</span>
          </div>
        )}
      </div>
    </div>
  )
}
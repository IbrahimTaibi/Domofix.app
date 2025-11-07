'use client'

import { User } from '@darigo/shared-types'
import { Button } from '@/shared/components'

type ProfileHeroProps = {
  user: User
  onEdit?: () => void
}

export default function ProfileHero({ user, onEdit }: ProfileHeroProps) {
  const roleLabel = user.role === 'customer'
    ? 'Client'
    : user.role === 'provider'
    ? 'Prestataire'
    : user.role === 'admin'
    ? 'Administrateur'
    : user.role
  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
      {/* Slim cover */}
      <div className="h-14 bg-gradient-to-r from-primary-500 to-primary-700"></div>

      <div className="relative px-3 sm:px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Avatar + Name */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-md -mt-8">
              {user.avatar ? (
                <img src={user.avatar} alt={user.firstName ? `Photo de profil de ${user.firstName}` : 'Photo de profil'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary-600 flex items-center justify-center text-white text-base sm:text-lg font-semibold">
                  {(user.firstName?.charAt(0) || '').toUpperCase()}
                  {(user.lastName?.charAt(0) || '').toUpperCase()}
                </div>
              )}
            </div>
            <div className="leading-tight">
              <div className="text-base sm:text-lg font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 capitalize">{roleLabel}</div>
            </div>
          </div>

          {/* Primary action */}
          <Button variant="outline" size="sm" onClick={onEdit} className="hidden sm:inline-flex">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Modifier le profil
          </Button>
        </div>

        {/* Contact quick row */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-600">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="break-all">{user.email}</span>
          </div>
          {user.phoneNumber && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{user.phoneNumber}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
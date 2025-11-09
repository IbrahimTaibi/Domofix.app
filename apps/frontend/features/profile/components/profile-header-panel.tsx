"use client"

import React from 'react'
import type { User as UserType } from '@darigo/shared-types'
import { Button } from '@/shared/components'
import { User as UserIcon } from 'lucide-react'

interface ProfileHeaderPanelProps {
  user: UserType
  onEdit?: () => void
}

export default function ProfileHeaderPanel({ user, onEdit }: ProfileHeaderPanelProps) {
  const roleLabel = user.role === 'customer'
    ? 'Client'
    : user.role === 'provider'
    ? 'Prestataire'
    : user.role === 'admin'
    ? 'Administrateur'
    : user.role

  return (
    <div className="rounded-xl bg-gradient-to-r from-primary-50 to-indigo-50 p-4 mb-6 border border-gray-200">
      <div className="flex items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white shadow flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Mon profil</h1>
            <p className="text-sm text-gray-600">{user.firstName} {user.lastName} · <span className="capitalize">{roleLabel}</span></p>
          </div>
        </div>
        <div className="hidden sm:block">
          <Button variant="outline" size="sm" onClick={onEdit}>Modifier le profil</Button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-700">
        <div className="flex items-center">
          <span className="font-medium text-gray-600 mr-1">Email:</span> <span className="break-all">{user.email}</span>
        </div>
        {user.phoneNumber && (
          <div className="flex items-center">
            <span className="font-medium text-gray-600 mr-1">Téléphone:</span> <span>{user.phoneNumber}</span>
          </div>
        )}
      </div>
    </div>
  )
}
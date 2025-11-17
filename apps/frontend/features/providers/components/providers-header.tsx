"use client"

import React from 'react'
import { Users } from 'lucide-react'

export interface ProvidersHeaderProps {
  request?: { id: string; category?: string; estimatedTimeOfService?: string } | null
}

export default function ProvidersHeader({ request }: ProvidersHeaderProps) {
  return (
    <div className="rounded-xl bg-gradient-to-r from-primary-50 to-indigo-50 p-4 mb-6 border border-gray-200">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-white shadow flex items-center justify-center">
          <Users className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Choisir un prestataire</h1>
          {request?.category ? (
            <p className="text-sm text-gray-600">Service: {String(request.category)}</p>
          ) : null}
          {request?.estimatedTimeOfService ? (
            <p className="text-xs text-gray-600">ETS: {new Date(request.estimatedTimeOfService as any).toLocaleString()}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
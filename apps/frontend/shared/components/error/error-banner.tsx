"use client"

import React from 'react'
import { isAppHttpError } from '@/shared/utils/error-types'

interface ErrorBannerProps {
  error: unknown
}

export default function ErrorBanner({ error }: ErrorBannerProps) {
  if (!error) return null
  const err: any = error
  const message = isAppHttpError(err)
    ? (err.payload?.message || err.message)
    : (err?.message || 'Une erreur inattendue est survenue.')
  const code = isAppHttpError(err) ? err.statusCode : undefined
  const errorId = isAppHttpError(err) ? err.errorId : undefined

  return (
    <div className="rounded-md border border-red-200 bg-red-50 text-red-800 p-3 text-sm">
      <div className="flex items-center justify-between">
        <div>
          <strong className="mr-2">Erreur{code ? ` ${code}` : ''}:</strong>
          <span>{message}</span>
          {errorId && (
            <span className="ml-2 text-xs text-red-600">ID: {errorId}</span>
          )}
        </div>
      </div>
    </div>
  )
}
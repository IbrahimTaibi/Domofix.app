"use client"

import ErrorView from '@/shared/components/error/error-view'
import { trackError } from '@/shared/utils/error-tracking'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { statusCode?: number }, reset: () => void }) {
  useEffect(() => {
    trackError(error, { source: 'route-error' })
  }, [error])

  const code = typeof error?.statusCode === 'number' ? error.statusCode : 500
  const description = process.env.NODE_ENV === 'development'
    ? `${error?.message || 'Une erreur inattendue est survenue.'}`
    : 'Une erreur inattendue est survenue.'

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 text-center">
        <ErrorView
          code={code}
          title={code === 500 ? 'Erreur interne du serveur' : 'Erreur'}
          description={description}
          actions={[{ label: 'Retour à l’accueil', href: '/' }]}
        />
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Réessayer
          </button>
        </div>
      </div>
    </div>
  )
}
"use client"

import ErrorView from '@/shared/components/error/error-view'
import { trackError } from '@/shared/utils/error-tracking'
import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error & { statusCode?: number }, reset: () => void }) {
  useEffect(() => {
    trackError(error, { source: 'global-error' })
  }, [error])

  const code = typeof error?.statusCode === 'number' ? error.statusCode : 500

  return (
    <html>
      <body>
        <ErrorView
          code={code}
          title={code === 500 ? 'Erreur interne du serveur' : 'Erreur'}
          description={'Une erreur critique est survenue.'}
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
      </body>
    </html>
  )
}
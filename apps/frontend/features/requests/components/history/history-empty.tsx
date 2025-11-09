import React from 'react'
import Link from 'next/link'
import { Inbox } from 'lucide-react'
import Button from '@/shared/components/button'

export function HistoryEmpty() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <Inbox className="h-6 w-6 text-gray-500" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-gray-900">Aucune demande pour le moment</h3>
      <p className="mt-2 text-sm text-gray-600 max-w-md">
        Créez votre première demande pour recevoir des candidatures de prestataires qualifiés.
      </p>
      <div className="mt-6">
        <Link href="/request-service" className="inline-block">
          <Button variant="primary">Créer une demande</Button>
        </Link>
      </div>
    </div>
  )
}

export default HistoryEmpty
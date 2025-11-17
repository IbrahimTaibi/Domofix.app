"use client"

import React from 'react'
import { Info } from 'lucide-react'

export default function ContactPolicyCard() {
  return (
    <section aria-labelledby="policy-title" className="mt-4">
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-primary-600" aria-hidden="true" />
          <h2 id="policy-title" className="text-sm font-semibold text-gray-900">Règles de contact et de chat</h2>
        </div>
        <ul className="mt-3 space-y-2 text-sm text-gray-700">
          <li>
            Vous pouvez contacter uniquement les prestataires que vous avez approuvés pour votre service.
          </li>
          <li>
            Le chat est automatiquement fermé lorsque la commande est <span className="font-medium">terminée</span>, <span className="font-medium">annulée</span> ou <span className="font-medium">clôturée</span>.
          </li>
        </ul>
      </div>
    </section>
  )
}
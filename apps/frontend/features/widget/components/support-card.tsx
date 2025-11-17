"use client"

import React from 'react'
import { Phone, Mail, MapPin } from 'lucide-react'

export default function SupportCard() {
  return (
    <section aria-labelledby="support-title" className="mt-6">
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 id="support-title" className="text-sm font-semibold text-gray-900">Contact Support</h2>
        <ul className="mt-3 space-y-2">
          <li className="flex items-center gap-2 text-sm text-gray-700">
            <Phone className="h-4 w-4 text-primary-600" aria-hidden="true" />
            <a href="tel:+21612345678" className="hover:underline">+216 12 345 678</a>
          </li>
          <li className="flex items-center gap-2 text-sm text-gray-700">
            <Mail className="h-4 w-4 text-primary-600" aria-hidden="true" />
            <a href="mailto:support@domofix.tn" className="hover:underline">support@domofix.tn</a>
          </li>
          <li className="flex items-center gap-2 text-sm text-gray-700">
            <MapPin className="h-4 w-4 text-primary-600" aria-hidden="true" />
            <span>Rue des Services, Tunis, TN</span>
          </li>
        </ul>
      </div>
    </section>
  )
}
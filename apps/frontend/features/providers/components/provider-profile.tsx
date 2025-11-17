import React from 'react'
import { Star } from 'lucide-react'

export interface ProviderProfileProps {
  provider: {
    id: string
    name: string
    title?: string
    avatar?: string | null
    bio?: string | null
    address?: { fullAddress?: string | null; city?: string | null; country?: string | null } | null
    timezone?: string | null
    locale?: string | null
    status?: string | null
    providerStatus?: string | null
    rating?: number
    reviewCount?: number
    completedCount?: number
    specialties?: string[]
    proposedEts?: string | null
    proposedPrice?: number | null
    proposedPriceRange?: { min: number; max: number } | null
  }
  request?: { id: string; category?: string; status?: string; estimatedTimeOfService?: string }
}

export default function ProviderProfile({ provider, request }: ProviderProfileProps) {
  return (
    <article className="rounded-2xl border bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <div className="flex items-start gap-4">
        <span className="inline-block w-16 h-16 rounded-full overflow-hidden bg-gray-100 ring-1 ring-gray-200">
          {provider.avatar ? <img src={provider.avatar} alt={provider.name} className="w-full h-full object-cover" /> : null}
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-900">{provider.name}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-700 ring-1 ring-yellow-200">
              <Star className="h-3.5 w-3.5" aria-hidden="true" />
              {provider.rating ?? 'N/A'}
              <span className="text-[10px] text-yellow-600">({provider.reviewCount ?? 0})</span>
            </span>
          </div>
          <div className="text-xs text-gray-600">{provider.title || 'Prestataire'}</div>
          {provider.bio ? (
            <p className="mt-2 text-sm text-gray-700">{provider.bio}</p>
          ) : null}
          {provider.specialties?.length ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {provider.specialties.map((s) => (
                <span key={s} className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700 ring-1 ring-gray-200">{s}</span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="text-gray-700">
          Prix proposé: {provider.proposedPriceRange ? `${provider.proposedPriceRange.min}–${provider.proposedPriceRange.max} DT` : (provider.proposedPrice != null ? `${provider.proposedPrice} DT` : 'N/A')}
        </div>
        <div className="text-gray-700">Terminés: {provider.completedCount ?? 0}</div>
        {provider.proposedEts ? (
          <div className="text-gray-700">ETS proposé: {new Date(provider.proposedEts as any).toLocaleString()}</div>
        ) : null}
        {provider.address?.fullAddress ? (
          <div className="text-gray-700">Localisation: {provider.address.fullAddress}</div>
        ) : provider.address?.city || provider.address?.country ? (
          <div className="text-gray-700">Localisation: {[provider.address.city, provider.address.country].filter(Boolean).join(', ')}</div>
        ) : null}
        {provider.timezone ? (
          <div className="text-gray-700">Fuseau horaire: {provider.timezone}</div>
        ) : null}
        {provider.locale ? (
          <div className="text-gray-700">Langue: {provider.locale}</div>
        ) : null}
        {provider.status ? (
          <div className="text-gray-700">Statut: {provider.status}</div>
        ) : null}
        {provider.providerStatus ? (
          <div className="text-gray-700">Statut prestataire: {provider.providerStatus}</div>
        ) : null}
        {request?.estimatedTimeOfService ? (
          <div className="text-gray-700">ETS demande: {new Date(request.estimatedTimeOfService as any).toLocaleString()}</div>
        ) : null}
        {request?.category ? (
          <div className="text-gray-700">Service: {String(request.category)}</div>
        ) : null}
      </div>
    </article>
  )
}
"use client"

import React from 'react'
import type { Request, RequestStatus } from '@domofix/shared-types'
import { ClipboardList, CalendarClock, Phone, MapPin, X, Image as Images } from 'lucide-react'
import { format } from 'date-fns'
import StatusBadge from '@/shared/components/requests/status-badge'
import Button from '@/shared/components/button'

export interface RequestDetailsProps {
  request: Request | any
  onClose: () => void
}

export default function RequestDetails({ request, onClose }: RequestDetailsProps) {
  const createdAt = request?.createdAt ? new Date(request.createdAt) : null
  const ets = request?.estimatedTimeOfService ? new Date(request.estimatedTimeOfService) : null
  const details = typeof request?.details === 'string' ? request.details : ''
  const photos: string[] = Array.isArray(request?.photos) ? request.photos : []
  const status: RequestStatus | undefined = request?.status
  const apps: any[] = Array.isArray(request?.applications) ? request.applications : []
  const appsMeta: Record<string, { name?: string; avatar?: string }> = request?.applicationsMeta || {}

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full sm:w-[640px] bg-white shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary-50 text-primary-600">
              <ClipboardList className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{String(request?.category)}</h2>
              <div className="mt-1 flex items-center gap-2">
                {status ? <StatusBadge status={status} /> : null}
                {request?.id || request?._id ? (
                  <span className="text-xs text-gray-500">ID: {String(request?.id || request?._id)}</span>
                ) : null}
              </div>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-700" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-6 overflow-y-auto h-[calc(100%-56px)]">
          {details ? (
            <div>
              <h3 className="text-sm font-medium text-gray-900">Description</h3>
              <p className="mt-1 text-sm text-gray-700">{details}</p>
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {createdAt && (
              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-gray-600" aria-hidden="true" />
                  <span className="text-xs text-gray-500">Créée</span>
                </div>
                <div className="mt-1 text-sm text-gray-800">{format(createdAt, 'dd/MM/yyyy HH:mm')}</div>
              </div>
            )}
            {ets && (
              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-gray-600" aria-hidden="true" />
                  <span className="text-xs text-gray-500">Intervention</span>
                </div>
                <div className="mt-1 text-sm text-gray-800">{format(ets, 'dd/MM/yyyy HH:mm')}</div>
              </div>
            )}
          </div>

          {request?.location?.address ? (
            <div>
              <h3 className="text-sm font-medium text-gray-900">Adresse</h3>
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
                <MapPin className="h-4 w-4 text-gray-600" aria-hidden="true" />
                <span className="truncate">{request.location.address}</span>
              </div>
            </div>
          ) : null}

          {request?.phone ? (
            <div>
              <h3 className="text-sm font-medium text-gray-900">Contact</h3>
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
                <Phone className="h-4 w-4 text-gray-600" aria-hidden="true" />
                <span>{request.phone}</span>
              </div>
            </div>
          ) : null}

          <div>
            <h3 className="text-sm font-medium text-gray-900">Candidatures ({apps.length})</h3>
            {apps.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {apps.map((a: any, i: number) => {
                  const key = String(a.providerId)
                  const meta = appsMeta[key] || {}
                  const name = meta.name || 'Prestataire'
                  const avatar = meta.avatar || ''
                  return (
                    <li key={i} className="flex items-center gap-3">
                      <span className="inline-block w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                        {avatar ? <img src={avatar} alt={name} className="w-full h-full object-cover" /> : null}
                      </span>
                      <div className="text-sm text-gray-800">{name}</div>
                      <div className="text-xs text-gray-500 ml-auto">{new Date(a.appliedAt).toLocaleString()}</div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-gray-600">Aucune candidature pour le moment.</p>
            )}
          </div>

          {photos.length > 0 ? (
            <div>
              <h3 className="text-sm font-medium text-gray-900">Photos</h3>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {photos.map((src) => (
                  <img key={src} src={src} alt="Photo de la demande" className="h-24 w-full object-cover rounded" />
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Fermer</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

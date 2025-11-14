"use client"

import React from 'react'
import { RequestStatus, ServiceCategory } from '@darigo/shared-types'
import clsx from 'clsx'

export interface FiltersBarProps {
  status?: RequestStatus
  category?: ServiceCategory
  search?: string
  sort?: 'newest' | 'eta' | 'category'
  onChange: (next: { status?: RequestStatus; category?: ServiceCategory; search?: string; sort?: 'newest' | 'eta' | 'category' }) => void
}

const STATUS_OPTIONS: { value?: RequestStatus; label: string }[] = [
  { value: undefined, label: 'Tous les statuts' },
  { value: RequestStatus.OPEN, label: 'Ouverte' },
  { value: RequestStatus.PENDING, label: 'En attente' },
  { value: RequestStatus.ACCEPTED, label: 'Acceptée' },
  { value: RequestStatus.COMPLETED, label: 'Terminée' },
  { value: RequestStatus.CLOSED, label: 'Fermée' },
]

const CATEGORY_OPTIONS: { value?: ServiceCategory; label: string }[] = [
  { value: undefined, label: 'Toutes catégories' },
  { value: ServiceCategory.PLUMBER, label: 'Plombier' },
  { value: ServiceCategory.ELECTRICIAN, label: 'Électricien' },
  { value: ServiceCategory.CLEANER, label: 'Agent d’entretien' },
  { value: ServiceCategory.CARPENTER, label: 'Menuisier' },
  { value: ServiceCategory.PAINTER, label: 'Peintre' },
  { value: ServiceCategory.GARDENER, label: 'Jardinier' },
  { value: ServiceCategory.BARBER, label: 'Coiffeur/Barbier' },
  { value: ServiceCategory.DELIVERY, label: 'Livraison' },
  { value: ServiceCategory.TUTOR, label: 'Tuteur' },
  { value: ServiceCategory.OTHER, label: 'Autre' },
]

export default function FiltersBar({ status, category, search, sort = 'newest', onChange }: FiltersBarProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" aria-label="Filtres de demandes">
      <div className="flex flex-col gap-1">
          <label htmlFor="status" className="text-sm font-medium text-gray-700">Statut</label>
          <select
            id="status"
            name="status"
            className={clsx('w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500')}
            value={String(status ?? '')}
            onChange={(e) => {
              const raw = e.target.value
              onChange({ status: raw === '' ? undefined : (raw as RequestStatus), category, search, sort })
            }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.value ?? ''}>{opt.label}</option>
            ))}
          </select>
        </div>
      <div className="flex flex-col gap-1">
          <label htmlFor="category" className="text-sm font-medium text-gray-700">Catégorie</label>
          <select
            id="category"
            name="category"
            className={clsx('w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500')}
            value={String(category ?? '')}
            onChange={(e) => {
              const raw = e.target.value
              onChange({ status, category: raw === '' ? undefined : (raw as ServiceCategory), search, sort })
            }}
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.value ?? ''}>{opt.label}</option>
            ))}
          </select>
      </div>
      <div className="flex flex-col gap-1">
          <label htmlFor="search" className="text-sm font-medium text-gray-700">Recherche</label>
          <input
            id="search"
            name="search"
            type="text"
            placeholder="Téléphone, adresse..."
            className={clsx('w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500')}
            value={search || ''}
            onChange={(e) => onChange({ status, category, search: e.target.value, sort })}
          />
      </div>
      <div className="flex flex-col gap-1">
          <label htmlFor="sort" className="text-sm font-medium text-gray-700">Tri</label>
          <select
            id="sort"
            name="sort"
            className={clsx('w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500')}
            value={sort}
            onChange={(e) => onChange({ status, category, search, sort: e.target.value as any })}
          >
            <option value="newest">Plus récent</option>
            <option value="eta">Intervention</option>
            <option value="category">Catégorie</option>
          </select>
      </div>
    </div>
  )
}

"use client"

import React, { useEffect } from 'react'
import { useRequestsHistory } from '@/features/requests/hooks/useRequestsHistory'
import HistoryFilters from '@/features/requests/components/history/history-filters'
import HistorySkeleton from '@/features/requests/components/history/history-skeleton'
import HistoryEmpty from '@/features/requests/components/history/history-empty'
import RequestHistoryList from '@/features/requests/components/history/request-history-list'
import Button from '@/shared/components/button'
import { AlertTriangle, ClipboardList } from 'lucide-react'
import { useToast } from '@/shared/hooks/use-toast'
import HistoryToolbar from '@/features/requests/components/history/history-toolbar'

export default function HistoriquePage() {
  const { items, loading, error, status, setStatus, page, setPage, refresh } = useRequestsHistory({ limit: 10 })
  const { error: showError } = useToast()

  useEffect(() => {
    if (error) {
      showError(error, { title: 'Historique', duration: 6000 })
    }
  }, [error, showError])

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-primary-50 to-indigo-50 p-4 mb-6 border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white shadow flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Historique des demandes</h1>
            <p className="text-sm text-gray-600">Consultez vos demandes passées et en cours.</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <HistoryToolbar status={status as any} onChangeStatus={setStatus} onRefresh={refresh} />

      {/* Error */}
      {error ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium">{error}</p>
            <p className="text-xs">Conseil: assurez-vous d’être connecté et que l’API est accessible.</p>
          </div>
        </div>
      ) : null}

      {/* List */}
      <div className="mt-6">
        {loading ? (
          <HistorySkeleton />
        ) : items.length ? (
          <RequestHistoryList items={items} />
        ) : (
          <HistoryEmpty />
        )}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex items-center justify-between">
        <Button
          variant="outline"
          disabled={page <= 1 || loading}
          onClick={() => setPage(Math.max(1, page - 1))}
        >
          Précédent
        </Button>
        <div className="text-sm text-gray-600">Page {page}</div>
        <Button
          variant="outline"
          disabled={loading || items.length < 10}
          onClick={() => setPage(page + 1)}
        >
          Suivant
        </Button>
      </div>
    </section>
  )
}
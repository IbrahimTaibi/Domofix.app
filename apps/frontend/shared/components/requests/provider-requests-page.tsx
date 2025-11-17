"use client"

import React from 'react'
import { useProviderRequests } from '@/shared/hooks/use-provider-requests'
import RequestsToolbar from '@/shared/components/requests/requests-toolbar'
import RequestsList from '@/shared/components/requests/requests-list'
import ListSkeleton from '@/shared/components/requests/list-skeleton'
import ListEmpty from '@/shared/components/requests/list-empty'
import ErrorView from '@/shared/components/error/error-view'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { applyForRequest } from '@/features/requests/services/requests-service'
import { useToastStore } from '@/shared/store/toast-store'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { getProviderRequestById } from '@/features/requests/services/requests-service'
import RequestDetails from '@/shared/components/requests/request-details'
import { useRequestsUiStore } from '@/shared/store/requests-ui-store'
import RequestsListRows from '@/shared/components/requests/requests-list-rows'

export default function ProviderRequestsPage() {
  const { items, loading, error, status, setStatus, page, setPage, refresh } = useProviderRequests()
  const { viewMode, setViewMode, appliedIds, addApplied, removeApplied, statusOverrides, setStatusOverride, removeStatusOverride } = useRequestsUiStore()
  const { user } = useAuthStore()
  const { show } = useToastStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selected, setSelected] = React.useState<any | null>(null)
  const [applyFor, setApplyFor] = React.useState<any | null>(null)
  const [applyMin, setApplyMin] = React.useState<string>('')
  const [applyMax, setApplyMax] = React.useState<string>('')
  const [applyEts, setApplyEts] = React.useState<string>('')
  const requestId = searchParams.get('request')

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      if (!requestId) { setSelected(null); return }
      try {
        const req = await getProviderRequestById(requestId)
        if (!cancelled) setSelected(req)
      } catch (err: any) {
        const msg = typeof err?.message === 'string' ? err.message : 'Impossible de charger la demande'
        show({ message: msg, variant: 'error' })
        if (!cancelled) setSelected(null)
      }
    }
    load()
    return () => { cancelled = true }
  }, [requestId])

  function onApply(req: any) {
    setApplyFor(req)
    setApplyMin('')
    setApplyMax('')
    setApplyEts('')
  }

  async function submitApplication() {
    try {
      const id = String(applyFor?.id || applyFor?._id || '')
      if (!id) return
      const min = Number(applyMin)
      const max = Number(applyMax)
      const hasRange = Number.isFinite(min) && Number.isFinite(max) && min > 0 && max >= min
      const proposedEts = applyEts ? new Date(applyEts).toISOString() : undefined
      addApplied(id)
      if (String(applyFor?.status) === 'open') setStatusOverride(id, 'pending')
      await applyForRequest(id, {
        message: '',
        proposedEts,
        ...(hasRange ? { proposedPriceMin: min, proposedPriceMax: max } : {}),
      })
      show({ message: 'Candidature envoyée', variant: 'success' })
      setApplyFor(null)
    } catch (err: any) {
      const msg = typeof err?.message === 'string' ? err.message : 'Échec de la candidature'
      show({ message: msg, variant: 'error' })
      const id = String(applyFor?.id || applyFor?._id || '')
      if (id) removeApplied(id)
      if (id) removeStatusOverride(id)
    }
  }

  function onView(req: any) {
    const id = String(req?.id || req?._id || '')
    if (!id) return
    router.push(`/dashboard/provider/requests/all?request=${encodeURIComponent(id)}`)
  }

  return (
    <>
    <section className="py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Toutes les demandes</h1>
      </header>

      <div className="mt-4">
        <RequestsToolbar
          status={status}
          onChange={(next) => setStatus(next.status)}
          onRefresh={refresh}
          viewMode={viewMode}
          onChangeViewMode={(m) => setViewMode(m)}
        />
      </div>

      <div className="mt-6">
        {loading && <ListSkeleton />}
        {!loading && error && (
          <ErrorView title="Erreur" description={error} />
        )}
        {!loading && !error && items.length === 0 && <ListEmpty />}
        {!loading && !error && items.length > 0 && (
          viewMode === 'grid' ? (
            <RequestsList items={items} currentProviderId={user?.id} onApply={onApply} onView={onView} appliedIds={appliedIds} statusOverrideById={Object.fromEntries(statusOverrides)} />
          ) : (
            <RequestsListRows items={items} currentProviderId={user?.id} onApply={onApply} onView={onView} appliedIds={appliedIds} statusOverrideById={Object.fromEntries(statusOverrides)} />
          )
        )}
      </div>

      <footer className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-600">Page {page}</div>
        <div className="flex items-center gap-2" aria-label="Pagination">
          <button
            type="button"
            onClick={() => setPage(Math.max(1, page - 1))}
            className="px-3 py-2 rounded border border-gray-300 bg-white text-sm hover:bg-gray-50"
            aria-label="Page précédente"
          >
            Précédent
          </button>
          <button
            type="button"
            onClick={() => setPage(page + 1)}
            className="px-3 py-2 rounded border border-gray-300 bg-white text-sm hover:bg-gray-50"
            aria-label="Page suivante"
          >
            Suivant
          </button>
        </div>
      </footer>
    </section>
    {selected && (
      <RequestDetails request={selected} onClose={() => router.push('/dashboard/provider/requests/all')} />
    )}
    {applyFor && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-md">
          <h2 className="text-base font-semibold text-gray-900">Postuler</h2>
          <p className="mt-1 text-xs text-gray-600">Indiquez votre plage de prix et ETS proposé (facultatif).</p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600">Prix min (DT)</label>
              <input type="number" min="0" step="1" value={applyMin} onChange={(e) => setApplyMin(e.target.value)} className="mt-1 w-full rounded border px-2 py-1 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-600">Prix max (DT)</label>
              <input type="number" min="0" step="1" value={applyMax} onChange={(e) => setApplyMax(e.target.value)} className="mt-1 w-full rounded border px-2 py-1 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-gray-600">ETS proposé</label>
              <input type="datetime-local" value={applyEts} onChange={(e) => setApplyEts(e.target.value)} className="mt-1 w-full rounded border px-2 py-1 text-sm" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-end gap-2">
            <button type="button" className="px-3 py-2 rounded border border-gray-300 bg-white text-sm hover:bg-gray-50" onClick={() => setApplyFor(null)}>Annuler</button>
            <button type="button" className="px-3 py-2 rounded bg-primary-600 text-white text-sm hover:bg-primary-700" onClick={submitApplication}>Envoyer</button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { fetchProvidersForService } from '@/features/providers/services/provider-service'
import { useToast } from '@/shared/hooks/use-toast'
import Button from '@/shared/components/button'
import { Users } from 'lucide-react'
import ProviderProfile from '@/features/providers/components/provider-profile'

export default function ProviderProfilePage() {
  const params = useParams() as { serviceId?: string; providerId?: string }
  const router = useRouter()
  const serviceId = String(params?.serviceId || '')
  const providerId = String(params?.providerId || '')
  const { error: showError } = useToast()
  const [loading, setLoading] = useState(false)
  const [provider, setProvider] = useState<any | null>(null)
  const [requestMeta, setRequestMeta] = useState<any | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!serviceId || !providerId) return
      setLoading(true)
      try {
        const res = await fetchProvidersForService(serviceId)
        const p = res.providers.find((x) => String(x.id) === String(providerId)) || null
        if (!mounted) return
        setProvider(p)
        setRequestMeta(res.request)
      } catch (err: any) {
        const msg = typeof err?.message === 'string' ? err.message : 'Impossible de charger le profil prestataire'
        showError(msg, { title: 'Prestataire', duration: 6000 })
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [serviceId, providerId, showError])

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="rounded-xl bg-gradient-to-r from-primary-50 to-indigo-50 p-4 mb-6 border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white shadow flex items-center justify-center">
            <Users className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Profil du prestataire</h1>
            {requestMeta?.category ? (
              <p className="text-sm text-gray-600">Service: {String(requestMeta.category)}</p>
            ) : null}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-4">
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="mt-2 h-3 w-2/3 rounded bg-gray-200" />
          </div>
        </div>
      ) : provider ? (
        <>
          <ProviderProfile provider={provider} request={requestMeta} />
          <div className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-2">
            <Button variant="outline" onClick={() => router.back()}>Retour</Button>
            <Button>Contacter (via chat après approbation)</Button>
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-600">Prestataire introuvable.</p>
      )}
    </section>
  )
}
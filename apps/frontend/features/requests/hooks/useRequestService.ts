"use client"

import { useCallback, useState } from 'react'
import type { CreateRequestRequest, Request } from '@domofix/shared-types'
import { createRequest, cacheLastRequest, getCachedLastRequest } from '../services/requests-service'

export interface UseRequestServiceResult {
  create: (payload: CreateRequestRequest) => Promise<Request | null>
  loading: boolean
  error: string | null
  lastRequest: Request | null
  clearError: () => void
  fieldErrors: Record<string, string>
  clearFieldErrors: () => void
}

/**
 * useRequestService
 * - Encapsulates request creation flow with loading/error handling
 * - Caches the last created request for continuity
 */
export function useRequestService(): UseRequestServiceResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRequest, setLastRequest] = useState<Request | null>(getCachedLastRequest())
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const clearError = useCallback(() => setError(null), [])
  const clearFieldErrors = useCallback(() => setFieldErrors({}), [])

  const create = useCallback(async (payload: CreateRequestRequest) => {
    setLoading(true)
    setError(null)
    setFieldErrors({})
    try {
      const req = await createRequest(payload)
      cacheLastRequest(req)
      setLastRequest(req)
      return req
    } catch (err: any) {
      let msg = 'Échec de la création de la demande'
      const status = typeof err?.statusCode === 'number' ? err.statusCode : 0
      if (status === 401) msg = 'Non autorisé. Veuillez vous connecter en tant que client.'
      else if (status === 403) msg = 'Accès refusé. Seuls les clients peuvent créer des demandes.'
      else if (typeof err?.message === 'string') msg = err.message
      // Append backend field validation details when available
      const details = (err?.payload && (err.payload as any).details) || (err?.details)
      if (details && typeof details === 'object') {
        const parts: string[] = []
        const mapped: Record<string, string> = {}
        for (const [field, messages] of Object.entries(details as Record<string, string[]>)) {
          const first = Array.isArray(messages) ? messages[0] : String(messages)
          parts.push(`${field}: ${first}`)
          mapped[field] = first
        }
        setFieldErrors(mapped)
        if (parts.length) {
          msg = `${msg} — ${parts.join(' | ')}`
        }
      }
      setError(msg)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { create, loading, error, lastRequest, clearError, fieldErrors, clearFieldErrors }
}
"use client"

import { useEffect, useMemo, useState, useCallback } from 'react'
import type { Request, RequestStatus } from '@darigo/shared-types'
import { listMyRequests, type ListRequestsParams } from '../services/requests-service'

export interface UseRequestsHistoryFilters {
  status?: RequestStatus
  limit?: number
}

export interface UseRequestsHistoryResult {
  items: Request[]
  loading: boolean
  error: string | null
  status?: RequestStatus
  setStatus: (s?: RequestStatus) => void
  page: number
  setPage: (p: number) => void
  refresh: () => Promise<void>
}

export function useRequestsHistory(initial: UseRequestsHistoryFilters = {}): UseRequestsHistoryResult {
  const [items, setItems] = useState<Request[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<RequestStatus | undefined>(initial.status)
  const [page, setPage] = useState(1)
  const limit = typeof initial.limit === 'number' ? initial.limit : 10

  const offset = useMemo(() => (page - 1) * limit, [page, limit])

  const fetchList = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: ListRequestsParams = { status, offset, limit }
      const res = await listMyRequests(params)
      setItems(res)
    } catch (err: any) {
      let msg = 'Impossible de charger votre historique des demandes'
      const statusCode = typeof err?.statusCode === 'number' ? err.statusCode : 0
      if (statusCode === 401) msg = 'Veuillez vous connecter pour voir votre historique.'
      else if (statusCode === 403) msg = 'Accès refusé. Historique réservé aux clients.'
      else if (typeof err?.message === 'string') msg = err.message
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [status, offset, limit])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  return { items, loading, error, status, setStatus, page, setPage, refresh: fetchList }
}
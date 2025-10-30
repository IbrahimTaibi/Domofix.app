'use client'

import { useState, useEffect, useCallback } from 'react'
import { ApiResponse } from '@/types'

interface UseFetchOptions<T> {
  dependencies?: any[]
  initialData?: T
  onSuccess?: (data: T) => void
  onError?: (error: string) => void
  enabled?: boolean
}

export function useFetch<T>(
  url: string,
  options: UseFetchOptions<T> = {}
) {
  const {
    dependencies = [],
    initialData,
    onSuccess,
    onError,
    enabled = true
  } = options

  const [data, setData] = useState<T | undefined>(initialData)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const fetchData = useCallback(async () => {
    if (!enabled) return
    
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(url)
      const result = await response.json() as ApiResponse<T>
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'An error occurred')
      }
      
      setData(result.data)
      if (onSuccess && result.data) {
        onSuccess(result.data)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      if (onError) {
        onError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }, [url, enabled, onSuccess, onError])

  useEffect(() => {
    fetchData()
  }, [fetchData, ...dependencies])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return { data, error, isLoading, refetch }
}
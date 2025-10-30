import { renderHook, act, waitFor } from '@testing-library/react'
import { useFetch } from '@/hooks/use-fetch'

// Mock fetch
global.fetch = jest.fn()

describe('useFetch', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('fetches data successfully', async () => {
    const mockData = { id: 1, name: 'Test' }
    const mockResponse = {
      success: true,
      data: mockData,
      error: null,
      message: 'Success'
    }
    
    // Mock successful fetch
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })
    
    const onSuccess = jest.fn()
    const { result } = renderHook(() => 
      useFetch('/api/test', { onSuccess })
    )
    
    // Initial state
    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
    expect(result.current.error).toBeNull()
    
    // Wait for the fetch to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    // After fetch completes
    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toEqual(mockData)
    expect(result.current.error).toBeNull()
    expect(onSuccess).toHaveBeenCalledWith(mockData)
  })
  
  test('handles fetch errors', async () => {
    const mockError = 'API Error'
    const mockResponse = {
      success: false,
      data: null,
      error: mockError,
      message: 'Error occurred'
    }
    
    // Mock failed fetch
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => mockResponse
    })
    
    const onError = jest.fn()
    const { result } = renderHook(() => 
      useFetch('/api/test', { onError })
    )
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBeUndefined()
    expect(result.current.error).toBe(mockError)
    expect(onError).toHaveBeenCalledWith(mockError)
  })
  
  test('does not fetch when enabled is false', () => {
    renderHook(() => useFetch('/api/test', { enabled: false }))
    
    expect(global.fetch).not.toHaveBeenCalled()
  })
  
  test('refetches data when refetch is called', async () => {
    const mockData = { id: 1, name: 'Test' }
    const mockResponse = {
      success: true,
      data: mockData,
      error: null,
      message: 'Success'
    }
    
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    })
    
    const { result } = renderHook(() => useFetch('/api/test'))
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    // Reset mock to verify refetch call
    jest.clearAllMocks()
    
    act(() => {
      result.current.refetch()
    })
    
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })
})
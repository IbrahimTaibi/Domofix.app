import { renderHook, act } from '@testing-library/react'
import { useRequests } from '@/shared/hooks/use-requests'

jest.mock('@/features/requests/services/requests-service', () => ({
  listMyRequests: jest.fn(async () => ([])),
}))

describe('useRequests', () => {
  it('initializes and fetches list', async () => {
    const { result } = renderHook(() => useRequests())
    expect(result.current.loading).toBe(true)
    await act(async () => {})
    expect(result.current.loading).toBe(false)
    expect(result.current.items).toEqual([])
  })
})


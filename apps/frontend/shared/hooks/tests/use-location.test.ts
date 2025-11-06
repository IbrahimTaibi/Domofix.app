import { renderHook, act, waitFor } from '@testing-library/react'
import { useLocation } from '@/shared/hooks/use-location'

describe('useLocation Hook', () => {
  const mockGeolocation: Geolocation = {
    getCurrentPosition: jest.fn() as jest.MockedFunction<Geolocation['getCurrentPosition']>,
    clearWatch: jest.fn(),
    watchPosition: jest.fn(),
  }
  
  // Save original navigator.geolocation
  const originalNavigator = global.navigator

  beforeEach(() => {
    // Mock navigator.geolocation
    // @ts-ignore - mocking navigator
    global.navigator = {
      geolocation: mockGeolocation,
    }
  })

  afterEach(() => {
    // Restore original navigator
    global.navigator = originalNavigator
    jest.clearAllMocks()
  })

  it('should return loading state initially', () => {
    const { result } = renderHook(() => useLocation())
    
    expect(result.current.loading).toBe(true)
    expect(result.current.location).toBe(null)
    expect(result.current.error).toBe(null)
  })

  it('should update location when geolocation succeeds', async () => {
    // Mock successful geolocation
    (mockGeolocation.getCurrentPosition as jest.MockedFunction<Geolocation['getCurrentPosition']>)
      .mockImplementation((success: PositionCallback) => {
        success({
          coords: {
            latitude: 40.7128,
            longitude: -74.0060,
          },
        } as GeolocationPosition)
      })

    const { result } = renderHook(() => useLocation())
    
    // Wait for the effect to run
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.location).toEqual({
      latitude: 40.7128,
      longitude: -74.0060,
    })
    expect(result.current.error).toBe(null)
  })

  it('should handle geolocation errors', async () => {
    // Mock geolocation error
    (mockGeolocation.getCurrentPosition as jest.MockedFunction<Geolocation['getCurrentPosition']>)
      .mockImplementation((success: PositionCallback, error?: PositionErrorCallback | null) => {
        if (error) {
          error({ message: 'User denied geolocation' } as GeolocationPositionError)
        }
      })

    const { result } = renderHook(() => useLocation())
    
    // Wait for the effect to run
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.location).toBe(null)
    expect(result.current.error).toBe('User denied geolocation')
  })

  it('should handle browsers without geolocation support', () => {
    // Mock browser without geolocation
    // @ts-ignore - mocking navigator
    global.navigator = {}

    const { result } = renderHook(() => useLocation())
    
    expect(result.current.loading).toBe(false)
    expect(result.current.location).toBe(null)
    expect(result.current.error).toBe('Geolocation is not supported by your browser')
  })
})
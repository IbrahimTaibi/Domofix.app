import { renderHook, act } from '@testing-library/react'
import { useMobile } from '../../hooks/use-mobile'

// Mock window resize
const mockResize = (width: number) => {
  window.innerWidth = width
  window.dispatchEvent(new Event('resize'))
}

describe('useMobile Hook', () => {
  it('should return true when viewport is smaller than breakpoint', () => {
    const { result } = renderHook(() => useMobile(768))
    
    act(() => {
      mockResize(500)
    })
    
    expect(result.current).toBe(true)
  })
  
  it('should return false when viewport is larger than breakpoint', () => {
    const { result } = renderHook(() => useMobile(768))
    
    act(() => {
      mockResize(1024)
    })
    
    expect(result.current).toBe(false)
  })
  
  it('should use default breakpoint of 768px', () => {
    const { result } = renderHook(() => useMobile())
    
    act(() => {
      mockResize(800)
    })
    
    expect(result.current).toBe(false)
    
    act(() => {
      mockResize(700)
    })
    
    expect(result.current).toBe(true)
  })
})
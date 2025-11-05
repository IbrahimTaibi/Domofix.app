import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from '@/shared/hooks/use-local-storage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear()
    
    // Mock localStorage
    jest.spyOn(window, 'localStorage', 'get')
  })
  
  test('initializes with default value when no stored value exists', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'))
    
    expect(result.current[0]).toBe('defaultValue')
    expect(window.localStorage.getItem).toHaveBeenCalledWith('testKey')
  })
  
  test('initializes with stored value when it exists', () => {
    window.localStorage.setItem('testKey', JSON.stringify('storedValue'))
    
    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'))
    
    expect(result.current[0]).toBe('storedValue')
  })
  
  test('updates value and localStorage when setValue is called', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'initialValue'))
    
    act(() => {
      result.current[1]('newValue')
    })
    
    expect(result.current[0]).toBe('newValue')
    expect(window.localStorage.setItem).toHaveBeenCalledWith('testKey', JSON.stringify('newValue'))
  })
  
  test('handles complex objects correctly', () => {
    const complexObject = { name: 'John', age: 30, preferences: { theme: 'dark' } }
    
    const { result } = renderHook(() => useLocalStorage('complexKey', complexObject))
    
    expect(result.current[0]).toEqual(complexObject)
    
    const updatedObject = { ...complexObject, age: 31 }
    
    act(() => {
      result.current[1](updatedObject)
    })
    
    expect(result.current[0]).toEqual(updatedObject)
    expect(window.localStorage.setItem).toHaveBeenCalledWith('complexKey', JSON.stringify(updatedObject))
  })
})
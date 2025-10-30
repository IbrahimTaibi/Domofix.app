import { renderHook, act } from '@testing-library/react'
import { useAuth } from '../../../hooks/use-auth'
import { useAuthStore } from '@/store'

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

// Mock zustand store
jest.mock('@/store', () => ({
  useAuthStore: jest.fn()
}))

describe('useAuth Hook', () => {
  const mockSetUser = jest.fn()
  const mockLogin = jest.fn()
  const mockLogout = jest.fn()
  
  beforeEach(() => {
    // Setup mocks
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })
    mockLocalStorage.clear()
    
    // Reset all mocks
    jest.clearAllMocks()
    
    // Setup zustand store mock
    ;(useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: mockSetUser,
      login: mockLogin,
      logout: mockLogout
    })
  })
  
  it('should check localStorage for stored user on mount', () => {
    // Arrange
    const mockUser = { id: '123', name: 'Test User', email: 'test@example.com' }
    mockLocalStorage.setItem('user', JSON.stringify(mockUser))
    
    // Act
    renderHook(() => useAuth())
    
    // Assert
    expect(mockSetUser).toHaveBeenCalledWith(mockUser)
  })
  
  it('should handle invalid JSON in localStorage', () => {
    // Arrange
    mockLocalStorage.setItem('user', 'invalid-json')
    
    // Act
    renderHook(() => useAuth())
    
    // Assert
    expect(mockSetUser).toHaveBeenCalledWith(null)
    expect(mockLocalStorage.getItem('user')).toBeNull()
  })
  
  it('should set user to null if no stored user', () => {
    // Act
    renderHook(() => useAuth())
    
    // Assert
    expect(mockSetUser).toHaveBeenCalledWith(null)
  })
  
  it('should store user in localStorage when logging in', () => {
    // Arrange
    const mockUser = { 
      id: '123', 
      name: 'Test User', 
      email: 'test@example.com',
      userType: 'customer' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    const { result } = renderHook(() => useAuth())
    
    // Act
    act(() => {
      result.current.login(mockUser)
    })
    
    // Assert
    expect(mockLogin).toHaveBeenCalledWith(mockUser)
    expect(mockLocalStorage.getItem('user')).toBe(JSON.stringify(mockUser))
  })
  
  it('should remove user from localStorage when logging out', () => {
    // Arrange
    const mockUser = { 
      id: '123', 
      name: 'Test User', 
      email: 'test@example.com',
      userType: 'customer' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    mockLocalStorage.setItem('user', JSON.stringify(mockUser))
    const { result } = renderHook(() => useAuth())
    
    // Act
    act(() => {
      result.current.logout()
    })
    
    // Assert
    expect(mockLogout).toHaveBeenCalled()
    expect(mockLocalStorage.getItem('user')).toBeNull()
  })
  
  it('should return auth state and methods', () => {
    // Arrange
    const mockUser = { 
      id: '123', 
      name: 'Test User', 
      email: 'test@example.com',
      userType: 'customer' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    ;(useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      setUser: mockSetUser,
      login: mockLogin,
      logout: mockLogout
    })
    
    // Act
    const { result } = renderHook(() => useAuth())
    
    // Assert
    expect(result.current).toEqual({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      login: expect.any(Function),
      logout: expect.any(Function)
    })
  })
})
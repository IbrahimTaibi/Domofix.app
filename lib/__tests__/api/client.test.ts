import { apiClient } from '../../api/client'

// Mock fetch globally
global.fetch = jest.fn()

describe('API Client', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
  })

  describe('GET requests', () => {
    it('should handle successful GET requests', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ 
          data: { id: 1, name: 'Test' },
          message: 'Success'
        })
      }
      
      // @ts-ignore - mocking fetch
      global.fetch.mockResolvedValue(mockResponse)
      
      const response = await apiClient.get('/users/1')
      
      expect(fetch).toHaveBeenCalledWith('/api/users/1', expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      }))
      
      expect(response).toEqual({
        success: true,
        data: { id: 1, name: 'Test' },
        message: 'Success'
      })
    })
    
    it('should handle failed GET requests', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ 
          error: 'Not found',
          message: 'User not found'
        })
      }
      
      // @ts-ignore - mocking fetch
      global.fetch.mockResolvedValue(mockResponse)
      
      const response = await apiClient.get('/users/999')
      
      expect(response).toEqual({
        success: false,
        error: 'Not found',
        message: 'User not found'
      })
    })
  })
  
  describe('POST requests', () => {
    it('should handle successful POST requests', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ 
          data: { id: 2, name: 'New User' },
          message: 'Created'
        })
      }
      
      // @ts-ignore - mocking fetch
      global.fetch.mockResolvedValue(mockResponse)
      
      const userData = { name: 'New User', email: 'new@example.com' }
      const response = await apiClient.post('/users', userData)
      
      expect(fetch).toHaveBeenCalledWith('/api/users', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(userData),
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      }))
      
      expect(response).toEqual({
        success: true,
        data: { id: 2, name: 'New User' },
        message: 'Created'
      })
    })
  })
  
  describe('Error handling', () => {
    it('should handle network errors', async () => {
      // @ts-ignore - mocking fetch
      global.fetch.mockRejectedValue(new Error('Network failure'))
      
      const response = await apiClient.get('/users')
      
      expect(response).toEqual({
        success: false,
        error: 'Network failure'
      })
    })
  })
})
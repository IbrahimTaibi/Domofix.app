import {
  cn,
  calculateDistance,
  formatCurrency,
  formatDate,
  formatDuration,
  debounce,
  truncate,
  getInitials,
  sleep
} from '../../utils'

describe('Utility Functions', () => {
  describe('cn (className utility)', () => {
    it('should merge class names correctly', () => {
      expect(cn('btn', 'btn-primary')).toBe('btn btn-primary')
      expect(cn('p-4', { 'text-red-500': true, 'bg-blue-500': false })).toBe('p-4 text-red-500')
    })
  })

  describe('calculateDistance', () => {
    it('should calculate distance between two coordinates', () => {
      // New York to Los Angeles (approximate coordinates)
      const nyLat = 40.7128
      const nyLon = -74.0060
      const laLat = 34.0522
      const laLon = -118.2437
      
      // Approximate distance is around 3,944 km
      const distance = calculateDistance(nyLat, nyLon, laLat, laLon)
      expect(distance).toBeCloseTo(3944, -2) // Within 100km is close enough for this test
    })
    
    it('should return 0 for same coordinates', () => {
      const lat = 40.7128
      const lon = -74.0060
      
      const distance = calculateDistance(lat, lon, lat, lon)
      expect(distance).toBe(0)
    })
  })
  
  describe('formatCurrency', () => {
    it('should format currency with default USD', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
      expect(formatCurrency(1000)).toBe('$1,000.00')
    })
    
    it('should format currency with specified currency', () => {
      expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56')
      expect(formatCurrency(1234.56, 'JPY')).toBe('¥1,235') // JPY doesn't use decimal places
    })
  })
  
  describe('formatDate', () => {
    it('should format date with short format', () => {
      const date = new Date('2023-05-15T12:00:00Z')
      expect(formatDate(date, 'short')).toMatch(/May \d+, 2023/)
    })
    
    it('should format date with long format', () => {
      const date = new Date('2023-05-15T12:00:00Z')
      expect(formatDate(date, 'long')).toMatch(/Monday, May \d+, 2023/)
    })
    
    it('should format date with time format', () => {
      const date = new Date('2023-05-15T12:00:00Z')
      // Time will vary by timezone, so just check format
      expect(formatDate(date, 'time')).toMatch(/\d+:\d+ [AP]M/)
    })
    
    it('should handle string dates', () => {
      expect(formatDate('2023-05-15T12:00:00Z', 'short')).toMatch(/May \d+, 2023/)
    })
  })
  
  describe('formatDuration', () => {
    it('should format minutes less than 60', () => {
      expect(formatDuration(30)).toBe('30 min')
      expect(formatDuration(1)).toBe('1 min')
    })
    
    it('should format hours with no minutes', () => {
      expect(formatDuration(60)).toBe('1 hr')
      expect(formatDuration(120)).toBe('2 hr')
    })
    
    it('should format hours and minutes', () => {
      expect(formatDuration(90)).toBe('1 hr 30 min')
      expect(formatDuration(125)).toBe('2 hr 5 min')
    })
  })
  
  describe('debounce', () => {
    jest.useFakeTimers()
    
    it('should debounce function calls', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 1000)
      
      // Call multiple times
      debouncedFn()
      debouncedFn()
      debouncedFn()
      
      // Function should not be called yet
      expect(mockFn).not.toHaveBeenCalled()
      
      // Fast forward time
      jest.advanceTimersByTime(1000)
      
      // Function should be called once
      expect(mockFn).toHaveBeenCalledTimes(1)
    })
  })
  
  describe('truncate', () => {
    it('should truncate text longer than specified length', () => {
      expect(truncate('This is a long text', 10)).toBe('This is a ...')
    })
    
    it('should not truncate text shorter than specified length', () => {
      expect(truncate('Short', 10)).toBe('Short')
    })
  })
  
  describe('getInitials', () => {
    it('should get initials from a name', () => {
      expect(getInitials('John Doe')).toBe('JD')
      expect(getInitials('Alice Bob Charlie')).toBe('AB') // Only takes first two
    })
    
    it('should handle single names', () => {
      expect(getInitials('John')).toBe('J')
    })
  })
  
  describe('sleep', () => {
    jest.useFakeTimers()
    
    it('should resolve after specified time', async () => {
      const mockFn = jest.fn()
      
      const promise = sleep(1000).then(mockFn)
      
      // Function should not be called yet
      expect(mockFn).not.toHaveBeenCalled()
      
      // Fast forward time
      jest.advanceTimersByTime(1000)
      
      // Wait for promise to resolve
      await promise
      
      // Function should be called
      expect(mockFn).toHaveBeenCalledTimes(1)
    })
  })
})
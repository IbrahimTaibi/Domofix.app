import { formatCurrency, formatDate, formatDuration } from '../../utils/formatting'

describe('Formatting Utils', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly with default USD', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
    })

    it('should format currency with specified currency code', () => {
      expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56')
    })
  })

  describe('formatDate', () => {
    const testDate = new Date('2023-01-15T12:30:00')
    
    it('should format date in short format by default', () => {
      expect(formatDate(testDate)).toMatch(/Jan 15, 2023/)
    })
    
    it('should format date in long format', () => {
      expect(formatDate(testDate, 'long')).toMatch(/Sunday, January 15, 2023/)
    })
    
    it('should format date with time', () => {
      expect(formatDate(testDate, 'time')).toMatch(/12:30/)
    })
  })

  describe('formatDuration', () => {
    it('should format minutes only', () => {
      expect(formatDuration(45)).toBe('45 min')
    })
    
    it('should format hours only', () => {
      expect(formatDuration(120)).toBe('2 hr')
    })
    
    it('should format hours and minutes', () => {
      expect(formatDuration(90)).toBe('1 hr 30 min')
    })
  })
})
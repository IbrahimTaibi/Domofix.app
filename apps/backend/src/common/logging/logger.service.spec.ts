import { AppLogger } from './logger.service'

describe('AppLogger', () => {
  const logger = new AppLogger()
  it('info does not throw', () => {
    expect(() => logger.info('x', { a: 1 })).not.toThrow()
  })
  it('warn does not throw', () => {
    expect(() => logger.warn('x', { a: 1 })).not.toThrow()
  })
  it('error does not throw', () => {
    expect(() => logger.error('x', { a: 1 })).not.toThrow()
  })
})


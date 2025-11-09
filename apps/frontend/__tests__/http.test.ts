import { httpRequest } from '@/shared/utils/http'
import { AppHttpError, isAppHttpError } from '@/shared/utils/error-types'

describe('httpRequest', () => {
  const originalFetch = global.fetch as any

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('maps backend standardized error payloads', async () => {
    const url = 'http://example.com/api/test'
    const backendError = {
      errorId: 'abc-123',
      type: 'ValidationError',
      statusCode: 400,
      message: 'Invalid input',
      timestamp: new Date().toISOString(),
      path: '/api/test',
      details: { fields: { email: ['email must be an email'] } },
    }

    global.fetch = jest.fn().mockResolvedValue(
      new Response(JSON.stringify(backendError), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    try {
      await httpRequest<any>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      expect(true).toBe(false)
    } catch (err) {
      expect(isAppHttpError(err)).toBe(true)
      const e = err as AppHttpError
      expect(e.statusCode).toBe(400)
      expect(e.payload?.errorId).toBe('abc-123')
      expect(e.payload?.type).toBe('ValidationError')
      expect(e.payload?.message).toBe('Invalid input')
    }
  })
})
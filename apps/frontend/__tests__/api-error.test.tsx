import { apiClient } from '@/shared/utils/api'

describe('ApiClient error handling', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch as any
    jest.restoreAllMocks()
  })

  it('throws HttpError with statusCode on 403', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: () => Promise.resolve({ message: 'Forbidden', statusCode: 403 }),
    }) as any

    await expect(apiClient.getProfile()).rejects.toMatchObject({
      name: 'HttpError',
      statusCode: 403,
      message: 'Forbidden',
    })
  })

  it('throws HttpError with statusCode on 500', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: 'Server error', statusCode: 500 }),
    }) as any

    await expect(apiClient.getProfile()).rejects.toMatchObject({
      name: 'HttpError',
      statusCode: 500,
      message: 'Server error',
    })
  })
})
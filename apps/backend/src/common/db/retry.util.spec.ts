import { executeWithRetry } from './retry.util'

describe('executeWithRetry', () => {
  it('retries on transient errors and eventually succeeds', async () => {
    let attempts = 0
    const fn = jest.fn(async () => {
      attempts++
      if (attempts < 3) throw Object.assign(new Error('NetworkError'), { name: 'MongoNetworkError' })
      return 'ok'
    })
    const res = await executeWithRetry(fn, 5)
    expect(res).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('fails fast on non-retryable errors', async () => {
    const fn = jest.fn(async () => { throw new Error('Bad') })
    await expect(executeWithRetry(fn, 2)).rejects.toThrow('Bad')
  })
})

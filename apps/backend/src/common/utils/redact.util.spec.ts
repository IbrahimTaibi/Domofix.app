import { redact } from './redact.util'

describe('redact', () => {
  it('masks sensitive keys', () => {
    const out: any = redact({ a: 1, token: 'abcdef' })
    expect(out.a).toBe(1)
    expect(out.token).toMatch(/\*\*\*/)
  })
  it('handles non-object', () => {
    expect(redact(null as any, ['x'])).toBeNull()
  })
})

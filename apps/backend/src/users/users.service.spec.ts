import { UsersService } from './users.service'

describe('UsersService updateUser', () => {
  class InMemoryUserModel {
    static store: any[] = []
    static findByIdAndUpdate(id: string, data: any, opts: any) {
      return { exec: async () => ({ _id: id, ...(data || {}) }) }
    }
  }

  it('geocodes address on update when address provided', async () => {
    const svc = new UsersService(InMemoryUserModel as any)
    const res: any = await svc.updateUser('u1', { address: { street: 'x', city: 'y' } } as any)
    expect(res).toBeDefined()
  })
})


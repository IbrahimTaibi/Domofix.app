import { runInTransaction } from './transaction.util';

describe('runInTransaction', () => {
  const connection: any = {
    startSession: async () => ({
      withTransaction: async (fn: Function) => {
        await fn();
      },
      endSession: async () => {},
    }),
  };

  it('runs callback in transaction and returns result', async () => {
    const res = await runInTransaction(connection, async () => 'done');
    expect(res).toBe('done');
  });

  it('propagates errors from callback', async () => {
    await expect(
      runInTransaction(connection, async () => {
        throw new Error('x');
      }),
    ).rejects.toThrow('x');
  });
});

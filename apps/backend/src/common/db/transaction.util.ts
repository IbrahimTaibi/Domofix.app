import { Connection } from 'mongoose';

export async function runInTransaction<T>(
  connection: Connection,
  fn: (session: any) => Promise<T>,
): Promise<T> {
  const session = await connection.startSession();
  let result: T;
  try {
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    // @ts-ignore result is set in transaction
    return result;
  } catch (err) {
    try {
      await session.abortTransaction();
    } catch {}
    throw err;
  } finally {
    await session.endSession();
  }
}

export async function backOff(attempt: number): Promise<void> {
  const base = 100; // ms
  const jitter = Math.floor(Math.random() * 50);
  const delay = base * Math.pow(2, attempt) + jitter;
  await new Promise((res) => setTimeout(res, delay));
}
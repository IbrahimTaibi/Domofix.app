const SENSITIVE_KEYS = [
  'password',
  'token',
  'access_token',
  'refresh_token',
  'authorization',
  'authorizationToken',
  'auth_token',
  'secret',
  'apiKey',
];

export function redact(obj: unknown): unknown {
  try {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map((v) => redact(v));

    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.includes(k.toLowerCase())) {
        out[k] = maskValue(v);
      } else if (typeof v === 'object' && v !== null) {
        out[k] = redact(v);
      } else {
        out[k] = v;
      }
    }
    return out;
  } catch {
    return obj;
  }
}

function maskValue(v: unknown): string {
  const s = String(v ?? '');
  if (s.length <= 4) return '***';
  return `${s.slice(0, 2)}***${s.slice(-2)}`;
}
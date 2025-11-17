export function makeRef(prefix: string, id?: string | null): string {
  const s = String(id || '')
  const tail = s.slice(-6).toUpperCase()
  return `${prefix}-${tail || 'XXXXXX'}`
}

export const makeRequestRef = (id?: string | null) => makeRef('R', id)
export const makeOrderRef = (id?: string | null) => makeRef('O', id)
export const makeApplicationRef = (id?: string | null) => makeRef('A', id)
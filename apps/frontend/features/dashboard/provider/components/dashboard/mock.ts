import type { ServiceCategory } from '@domofix/shared-types'
import { BookingStatus } from '@domofix/shared-types'
import type { TimePoint, OrdersStatusCount, RequestsCategoryCount, KPIItem, ActivityItem } from './types'

function mulberry32(a: number) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) | 0;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}
function randSeed(seed: number, min: number, max: number) {
  const r = mulberry32(seed)()
  return Math.floor(r * (max - min + 1)) + min
}

export function makeRevenueSeries(days = 30): TimePoint[] {
  const out: TimePoint[] = []
  const base = Date.UTC(2024, 0, 1)
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(base + i * 24 * 60 * 60 * 1000)
    out.push({ date: d.toISOString().slice(0, 10), value: randSeed(1000 + i, 100, 600) })
  }
  return out
}

export function makeOrdersStatus(): OrdersStatusCount[] {
  return [
    { status: BookingStatus.CONFIRMED, count: randSeed(2001, 10, 30) },
    { status: BookingStatus.IN_PROGRESS, count: randSeed(2002, 5, 20) },
    { status: BookingStatus.COMPLETED, count: randSeed(2003, 20, 50) },
    { status: BookingStatus.CANCELLED, count: randSeed(2004, 1, 10) },
  ]
}

export function makeRequestsByCategory(): RequestsCategoryCount[] {
  const cats: ServiceCategory[] = [
    'plumber',
    'cleaner',
    'electrician',
    'carpenter',
    'gardener',
  ] as any
  return cats.map((c, idx) => ({ category: c, count: randSeed(3000 + idx, 5, 25) }))
}

export function makeKPIs(): KPIItem[] {
  return [
    { title: 'Revenus (30j)', value: randSeed(4001, 2500, 7500).toLocaleString('fr-FR') + ' DT', delta: '+' + randSeed(4002, 2, 12) + '%' },
    { title: 'Demandes nouvelles', value: String(randSeed(4003, 20, 80)), delta: '+' + randSeed(4004, 1, 8) + '%' },
    { title: 'Commandes actives', value: String(randSeed(4005, 5, 20)) },
    { title: 'Taux d’acceptation', value: randSeed(4006, 60, 95) + '%', delta: '+' + randSeed(4007, 1, 4) + '%' },
    { title: 'Note moyenne', value: (3 + (mulberry32(4008)() * 2)).toFixed(1) },
  ]
}

export function makeRecentActivity(): ActivityItem[] {
  const base = Date.UTC(2024, 0, 2, 12, 0, 0)
  return [
    { type: 'request', title: 'Nouvelle demande reçue', timestamp: new Date(base - 60 * 60 * 1000).toISOString() },
    { type: 'order', title: 'Commande confirmée', timestamp: new Date(base - 2 * 60 * 60 * 1000).toISOString() },
    { type: 'message', title: 'Message client', timestamp: new Date(base - 3 * 60 * 60 * 1000).toISOString() },
    { type: 'order', title: 'Commande terminée', timestamp: new Date(base - 6 * 60 * 60 * 1000).toISOString() },
  ]
}

export function makeTopServices() {
  return [
    { title: 'Plomberie urgente', category: 'plumber', completed: randSeed(5001, 20, 80), rating: (4 + mulberry32(5002)()).toFixed(1), revenue: randSeed(5003, 1500, 4500) + ' DT' },
    { title: 'Nettoyage maison', category: 'cleaner', completed: randSeed(5004, 20, 80), rating: (4 + mulberry32(5005)()).toFixed(1), revenue: randSeed(5006, 1200, 3800) + ' DT' },
    { title: 'Électricité', category: 'electrician', completed: randSeed(5007, 20, 80), rating: (4 + mulberry32(5008)()).toFixed(1), revenue: randSeed(5009, 1800, 5200) + ' DT' },
  ]
}

export function makePerformanceRadial() {
  return [
    { name: 'Acceptation', value: rand(60, 95) },
    { name: 'Achèvement', value: rand(70, 98) },
    { name: 'Satisfaction', value: Number((Math.random() * 1 + 4).toFixed(1)) * 20 },
  ]
}

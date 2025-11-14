import type { ThreadSummary, Message, Participant } from './types'

function mulberry32(a: number) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0
    let t = Math.imul(a ^ a >>> 15, 1 | a)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) | 0
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

const avatars = [
  'https://i.pravatar.cc/150?img=12',
  'https://i.pravatar.cc/150?img=32',
  'https://i.pravatar.cc/150?img=56',
  'https://i.pravatar.cc/150?img=24',
  'https://i.pravatar.cc/150?img=66',
]

export function makeParticipants(): Participant[] {
  return [
    { id: 'u1', name: 'Jean Dupont', avatarUrl: avatars[0], role: 'customer' },
    { id: 'u2', name: 'Sami Ben Ali', avatarUrl: avatars[1], role: 'customer' },
    { id: 'prov', name: 'Moi (Prestataire)', avatarUrl: avatars[2], role: 'provider' },
  ]
}

export function makeThreads(): ThreadSummary[] {
  const rand = mulberry32(101)
  const now = Date.UTC(2024, 4, 1, 12, 0, 0)
  const people = makeParticipants().filter(p => p.role === 'customer')
  return people.map((p, idx) => ({
    id: `t-${idx+1}`,
    title: p.name,
    avatarUrl: p.avatarUrl,
    lastMessage: idx % 2 === 0 ? 'Merci, à bientôt!' : 'Pouvez-vous venir cet après-midi?',
    lastTime: new Date(now - (idx+1) * 3600_000).toISOString(),
    unreadCount: Math.floor(rand() * 3),
  }))
}

export function makeMessages(threadId: string): Message[] {
  const rand = mulberry32(202 + Number(threadId.replace('t-', '')))
  const base = Date.UTC(2024, 3, 30, 9, 0, 0)
  const participants = makeParticipants()
  const customer = participants.find(p => p.role === 'customer' && threadId.endsWith(p.id === 'u1' ? '1' : p.id === 'u2' ? '2' : '')) || participants[0]
  const provider = participants.find(p => p.role === 'provider')!
  const msgs: Message[] = []
  for (let i = 0; i < 18; i++) {
    const sender = i % 2 === 0 ? customer : provider
    const t = new Date(base + i * 15 * 60_000).toISOString()
    msgs.push({
      id: `m-${threadId}-${i}`,
      threadId,
      senderId: sender.id,
      senderName: sender.name,
      senderAvatarUrl: sender.avatarUrl,
      kind: 'text',
      text: i % 5 === 0 ? 'D’accord, merci!' : i % 3 === 0 ? 'Je peux 16h.' : 'Bonjour!'
        ,
      createdAt: t,
      status: rand() > 0.8 ? 'read' : rand() > 0.5 ? 'delivered' : 'sent',
    })
  }
  return msgs
}

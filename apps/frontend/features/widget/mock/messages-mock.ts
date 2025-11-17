export type WidgetParticipant = {
  id: string
  name: string
  avatarUrl?: string
}

export type WidgetMessage = {
  id: string
  threadId: string
  senderId: string
  text: string
  createdAt: string
}

export type WidgetThread = {
  id: string
  title: string
  participantIds: string[]
}

export const participants: Record<string, WidgetParticipant> = {
  me: { id: 'me', name: 'Moi' },
  p1: { id: 'p1', name: 'Prestataire 1', avatarUrl: 'https://i.pravatar.cc/80?img=11' },
  p2: { id: 'p2', name: 'Prestataire 2', avatarUrl: 'https://i.pravatar.cc/80?img=22' },
  p3: { id: 'p3', name: 'Prestataire 3', avatarUrl: 'https://i.pravatar.cc/80?img=33' },
}

export const threads: WidgetThread[] = [
  { id: 't-1001', title: 'Plomberie salle de bain', participantIds: ['me', 'p1'] },
  { id: 't-1002', title: 'Installation clim', participantIds: ['me', 'p2'] },
  { id: 't-1003', title: 'Peinture salon', participantIds: ['me', 'p3'] },
]

export const messagesByThread: Record<string, WidgetMessage[]> = {
  't-1001': [
    { id: 'm1', threadId: 't-1001', senderId: 'p1', text: 'Bonjour, je peux passer demain matin.', createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
    { id: 'm2', threadId: 't-1001', senderId: 'me', text: 'Parfait, merci.', createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString() },
  ],
  't-1002': [
    { id: 'm1', threadId: 't-1002', senderId: 'p2', text: 'De quel modèle s’agit-il ?', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  ],
  't-1003': [
    { id: 'm1', threadId: 't-1003', senderId: 'me', text: 'Quand êtes-vous disponible ?', createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
  ],
}
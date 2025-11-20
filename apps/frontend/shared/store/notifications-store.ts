import { create } from 'zustand'
import type { Notification } from '@domofix/shared-types'

interface NotificationsState {
  notifications: Notification[]
  unreadCount: number
  setAll: (list: Notification[]) => void
  add: (n: Notification) => void
  markRead: (id: string, readAt?: string | null) => void
  markAllRead: () => void
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  setAll: (list) => set({
    notifications: list,
    unreadCount: list.filter((n) => !n.readAt).length,
  }),
  add: (n) => set((state) => {
    const exists = state.notifications.some((x) => x.id === n.id)
    const notifications = exists ? state.notifications : [n, ...state.notifications]
    const unreadCount = notifications.filter((x) => !x.readAt).length
    return { notifications, unreadCount }
  }),
  markRead: (id, readAt = new Date().toISOString()) => set((state) => {
    const notifications = state.notifications.map((n) => (n.id === id ? { ...n, readAt } : n))
    const unreadCount = notifications.filter((x) => !x.readAt).length
    return { notifications, unreadCount }
  }),
  markAllRead: () => set((state) => {
    const notifications = state.notifications.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() }))
    return { notifications, unreadCount: 0 }
  }),
}))
import { create } from 'zustand'
import type { Notification } from '@domofix/shared-types'

interface NotificationsStore {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  isOpen: boolean

  // Actions
  setNotifications: (notifications: Notification[]) => void
  addNotification: (notification: Notification) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  setLoading: (loading: boolean) => void
  setOpen: (open: boolean) => void
  toggleOpen: () => void
}

export const useNotificationsStore = create<NotificationsStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isOpen: false,

  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.readAt).length,
    }),

  addNotification: (notification) =>
    set((state) => {
      // Prevent duplicates
      const exists = state.notifications.some((n) => n.id === notification.id)
      if (exists) return state

      return {
        notifications: [notification, ...state.notifications],
        unreadCount: !notification.readAt ? state.unreadCount + 1 : state.unreadCount,
      }
    }),

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, readAt: new Date().toISOString() } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, readAt: new Date().toISOString() })),
      unreadCount: 0,
    })),

  removeNotification: (id) =>
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id)
      const wasUnread = notification && !notification.readAt

      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      }
    }),

  setLoading: (loading) => set({ isLoading: loading }),

  setOpen: (open) => set({ isOpen: open }),

  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
}))

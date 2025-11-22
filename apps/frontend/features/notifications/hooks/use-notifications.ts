"use client"

import { useNotificationsStore } from '../store/notifications-store'
import { listNotifications, markNotificationRead, markAllNotificationsRead } from '../services/notifications-service'

export function useNotifications() {
  const {
    notifications,
    unreadCount,
    isLoading,
    isOpen,
    setNotifications,
    markAsRead,
    markAllAsRead,
    setLoading,
    setOpen,
    toggleOpen,
  } = useNotificationsStore()

  async function loadNotifications() {
    try {
      setLoading(true)
      const response = await listNotifications(50)
      setNotifications(response.data || [])
    } catch (error) {
      console.error('[Notifications] Failed to load notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkAsRead(id: string) {
    try {
      await markNotificationRead(id)
      markAsRead(id)
    } catch (error) {
      console.error('[Notifications] Failed to mark as read:', error)
    }
  }

  async function handleMarkAllAsRead() {
    try {
      await markAllNotificationsRead()
      markAllAsRead()
    } catch (error) {
      console.error('[Notifications] Failed to mark all as read:', error)
    }
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    isOpen,
    setOpen,
    toggleOpen,
    loadNotifications,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
  }
}

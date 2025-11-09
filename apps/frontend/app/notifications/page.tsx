"use client"

import { useEffect, useState } from 'react'
import { useNotificationsStore } from '@/shared/store/notifications-store'
import NotificationItem from '@/features/notifications/components/notification-item'
import { listNotifications, markNotificationRead, markAllNotificationsRead } from '@/features/notifications/services/notifications-service'
import { useAuth } from '@/features/auth/components/providers/auth-provider'
import apiClient from '@/shared/utils/api'
import NotificationToolbar from '@/features/notifications/components/notification-toolbar'
import { Bell } from 'lucide-react'

export default function NotificationsPage() {
  const { notifications, setAll, markRead } = useNotificationsStore()
  const unreadCount = useNotificationsStore((s) => s.unreadCount)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        // Wait until a token exists to avoid intermittent 401
        const hasToken = apiClient.isAuthenticated()
        if (!hasToken || !isAuthenticated) {
          setLoading(false)
          return
        }
        const { data } = await listNotifications(50)
        setAll(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Échec du chargement des notifications')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [setAll, isAuthenticated])

  const handleMarkRead = async (id: string) => {
    try {
      const n = await markNotificationRead(id)
      markRead(n.id, n.readAt || undefined)
    } catch {}
  }

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsRead()
      // Optimistic update
      useNotificationsStore.getState().markAllRead()
    } catch {}
  }

  // Rendering moved into NotificationItem component; local formatting helpers removed to avoid TS indexing issues.

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="rounded-xl bg-gradient-to-r from-primary-50 to-indigo-50 p-4 mb-6 border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white shadow flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-600">Retrouvez vos mises à jour en temps réel et vos alertes importantes.</p>
          </div>
        </div>
      </div>
      <NotificationToolbar unreadCount={unreadCount} filter={filter} onChangeFilter={setFilter} onMarkAll={handleMarkAll} />
      {error && (
        <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-red-800 text-sm">{error}</div>
      )}
      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 animate-pulse">
                <div className="h-3 w-40 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-64 bg-gray-200 rounded mb-1" />
                <div className="h-3 w-52 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : !isAuthenticated ? (
          <p className="text-gray-600">Veuillez vous connecter pour voir vos notifications.</p>
        ) : notifications.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-800 font-medium">Aucune notification pour le moment</p>
            <p className="text-sm text-gray-600">Vos mises à jour apparaîtront ici dès qu’elles seront disponibles.</p>
          </div>
        ) : (
          notifications
            .filter((n) => (filter === 'unread' ? !n.readAt : true))
            .map((n) => (
              <NotificationItem key={n.id} notification={n} onMarkRead={handleMarkRead} />
            ))
        )}
      </div>
    </section>
  )
}
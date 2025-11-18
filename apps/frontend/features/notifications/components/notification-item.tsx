"use client"

import React from 'react'
import { CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react'
import type { Notification } from '@domofix/shared-types'

interface NotificationItemProps {
  notification: Notification
  onMarkRead?: (id: string) => void
}

function categoryLabel(cat?: string | null): string {
  const map: Record<string, string> = {
    plumber: 'plomberie',
    barber: 'coiffure',
    cleaner: 'nettoyage',
    tutor: 'cours',
    delivery: 'livraison',
    electrician: 'électricité',
    carpenter: 'menuiserie',
    painter: 'peinture',
    gardener: 'jardinage',
    other: 'service',
  }
  if (!cat) return 'service'
  return map[cat.toLowerCase()] || cat
}

function deriveDisplayId(n: Notification): string | null {
  try {
    const data = (n?.data ?? {}) as any
    if (typeof data?.displayId === 'string') return data.displayId
    const reqId: string | null = typeof data?.requestId === 'string' ? data.requestId : null
    const msg = String((n as any)?.message ?? '')
    const found = reqId || (msg.match(/[0-9a-f]{24}/i)?.[0] ?? null)
    if (!found) return null
    const short = found.slice(-6).toUpperCase()
    return `R-${short}`
  } catch {
    return null
  }
}

function formatMessage(n: Notification): string {
  const data = (n?.data ?? {}) as any
  const displayId = deriveDisplayId(n)
  const cat = typeof data?.category === 'string' ? data.category : null
  const catLabel = categoryLabel(cat)

  if (displayId && typeof (n as any)?.type === 'string') {
    const t = String((n as any).type)
    if (t === 'request.created') return `Votre demande de ${catLabel} ${displayId} a été créée.`
    if (t === 'request.completed') return `Votre demande de ${catLabel} ${displayId} est désormais close.`
    if (t === 'system.message') return `Votre demande de ${catLabel} ${displayId} expirera bientôt.`
    if (t === 'request.accepted') return `Votre demande de ${catLabel} ${displayId} a été acceptée.`
  }

  const msg = String((n as any)?.message ?? '')
  if (!displayId) return msg
  try {
    const requestId = typeof data?.requestId === 'string' ? data.requestId : null
    if (requestId) {
      const re = new RegExp(`#?${requestId}`, 'gi')
      return msg.replace(re, displayId)
    }
    return msg.replace(/#?[0-9a-f]{24}/gi, displayId)
  } catch {
    return msg
  }
}

export default function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const displayId = deriveDisplayId(notification)

  const stripeClass =
    notification.severity === 'success'
      ? 'bg-green-600'
      : notification.severity === 'error'
      ? 'bg-red-600'
      : notification.severity === 'warning'
      ? 'bg-yellow-600'
      : 'bg-blue-600'

  const titleClass =
    notification.severity === 'success'
      ? 'text-green-700'
      : notification.severity === 'error'
      ? 'text-red-700'
      : notification.severity === 'warning'
      ? 'text-yellow-700'
      : 'text-blue-700'

  const Icon = notification.severity === 'success'
    ? CheckCircle2
    : notification.severity === 'error'
    ? XCircle
    : notification.severity === 'warning'
    ? AlertTriangle
    : Info

  return (
    <div className={`rounded-xl border p-4 shadow-sm transition hover:shadow-md ${!notification.readAt ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-start gap-3">
        <div className={`w-1 self-stretch rounded ${stripeClass}`} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Icon className={`${titleClass} w-4 h-4`} />
            <p className={`text-sm font-semibold ${titleClass}`}>{notification.title}</p>
            {!notification.readAt && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] leading-none">Nouveau</span>
            )}
          </div>
          <p className="text-sm text-gray-800">{formatMessage(notification)}</p>
          {displayId && (
            <p className="mt-1 text-xs text-gray-600">
              Référence:{' '}
              <span className="font-mono tracking-wide px-1.5 py-0.5 rounded bg-gray-100 text-gray-800">{displayId}</span>
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
        </div>
        {!notification.readAt && onMarkRead && (
          <button
            onClick={() => onMarkRead(notification.id)}
            className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
          >
            Marquer comme lu
          </button>
        )}
      </div>
    </div>
  )
}
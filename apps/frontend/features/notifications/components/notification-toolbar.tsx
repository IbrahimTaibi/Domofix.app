"use client"

import React from 'react'
import { Bell, CheckCircle2 } from 'lucide-react'

interface NotificationToolbarProps {
  unreadCount: number
  filter: 'all' | 'unread'
  onChangeFilter: (f: 'all' | 'unread') => void
  onMarkAll: () => void
}

export default function NotificationToolbar({ unreadCount, filter, onChangeFilter, onMarkAll }: NotificationToolbarProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      {/* Left side: unread counter and filters */}
      <div className="flex w-full md:w-auto items-center gap-3 justify-between md:justify-start">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <Bell className="w-5 h-5 text-primary-600" />
          <span className="md:text-sm text-xs text-gray-600">
            <span className="hidden md:inline">Non lues:</span>
            <span className="inline md:hidden">Non lus:</span>
            <span className="font-semibold text-gray-900 ml-1">{unreadCount}</span>
          </span>
        </div>
        <div className="flex items-center rounded-lg bg-gray-100 p-1 md:text-sm text-xs w-full md:w-auto justify-between">
          <button
            type="button"
            onClick={() => onChangeFilter('all')}
            className={`md:px-3 px-2 md:py-1 py-0.5 rounded-md whitespace-nowrap flex-1 text-center ${filter === 'all' ? 'bg-white shadow text-gray-900' : 'text-gray-700 hover:text-gray-900'}`}
          >
            Tout
          </button>
          <button
            type="button"
            onClick={() => onChangeFilter('unread')}
            className={`md:px-3 px-2 md:py-1 py-0.5 rounded-md whitespace-nowrap flex-1 text-center ${filter === 'unread' ? 'bg-white shadow text-gray-900' : 'text-gray-700 hover:text-gray-900'}`}
          >
            <span className="hidden md:inline">Non lues</span>
            <span className="inline md:hidden">Non lus</span>
          </button>
        </div>
      </div>

      {/* Right side: mark all read (full row on mobile) */}
      <button
        type="button"
        onClick={onMarkAll}
        className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded bg-primary-600 text-white hover:bg-primary-700 w-full md:w-auto justify-center"
      >
        <CheckCircle2 className="w-4 h-4" />
        Tout marquer comme lu
      </button>
    </div>
  )
}
"use client"

import React from 'react'
import { ClipboardList, RefreshCw } from 'lucide-react'
import HistoryFilters from './history-filters'

interface HistoryToolbarProps {
  status?: string
  onChangeStatus: (s?: any) => void
  onRefresh: () => void
}

export default function HistoryToolbar({ status, onChangeStatus, onRefresh }: HistoryToolbarProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      {/* Left: filters */}
      <div className="flex items-center gap-3">
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow">
          <ClipboardList className="w-4 h-4 text-primary-600" />
        </div>
        <HistoryFilters status={status as any} onChangeStatus={onChangeStatus} />
      </div>
      {/* Right: refresh */}
      <button
        type="button"
        onClick={onRefresh}
        className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded bg-primary-600 text-white hover:bg-primary-700 w-full md:w-auto justify-center"
      >
        <RefreshCw className="w-4 h-4" />
        Rafraîchir
      </button>
    </div>
  )
}
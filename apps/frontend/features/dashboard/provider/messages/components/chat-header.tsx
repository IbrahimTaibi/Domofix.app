"use client"
import React from 'react'
import type { Participant } from '../../messages/types'

interface Props {
  participant?: Participant | null
}

export default function ChatHeader({ participant }: Props) {
  const name = participant?.name || 'Client'
  const avatar = participant?.avatarUrl || ''
  return (
    <div className="flex items-center justify-between p-3 border-b bg-white">
      <div className="flex items-center gap-3">
        {avatar ? (
          <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div aria-hidden className="w-10 h-10 rounded-full bg-gray-200" />
        )}
        <div>
          <p className="text-sm font-semibold text-gray-900">{name}</p>
          <p className="text-xs text-gray-500">En ligne</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs">Infos</button>
      </div>
    </div>
  )
}

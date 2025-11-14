"use client"
import React from 'react'
import type { Participant, Message } from '../../messages/types'

interface Props {
  participant: Participant
  messages: Message[]
}

export default function DetailsPanel({ participant, messages }: Props) {
  const images = messages.filter(m => m.kind === 'image').slice(0, 6)
  const files = messages.filter(m => m.kind === 'file').slice(0, 6)
  return (
    <aside className="hidden lg:block w-80 border-l bg-white">
      <div className="p-4 border-b flex items-center gap-3">
        <img src={participant.avatarUrl} alt={participant.name} className="w-12 h-12 rounded-full object-cover" />
        <div>
          <p className="text-sm font-semibold text-gray-900">{participant.name}</p>
          <p className="text-xs text-gray-500">Client</p>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm font-semibold text-gray-900 mb-2">Médias</p>
        <div className="grid grid-cols-3 gap-2">
          {images.length === 0 ? <p className="text-xs text-gray-500 col-span-3">Aucun média partagé</p> : images.map(img => (
            <img key={img.id} src={img.imageUrl!} alt="media" className="w-full h-20 object-cover rounded" />
          ))}
        </div>
        <p className="text-sm font-semibold text-gray-900 mt-4 mb-2">Fichiers</p>
        <ul className="space-y-1">
          {files.length === 0 ? <p className="text-xs text-gray-500">Aucun fichier partagé</p> : files.map(f => (
            <li key={f.id} className="text-xs text-gray-700">{f.file!.name}</li>
          ))}
        </ul>
      </div>
    </aside>
  )
}


"use client"
import React, { useState } from 'react'

interface Props {
  onSend: (text: string) => void
}

export default function ChatComposer({ onSend }: Props) {
  const [value, setValue] = useState('')
  const send = () => {
    const text = value.trim()
    if (!text) return
    onSend(text)
    setValue('')
  }
  return (
    <div className="border-t p-3 bg-white flex items-center gap-2">
      <button className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm">😊</button>
      <button className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm">📎</button>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
        placeholder="Écrire un message..."
        className="flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      <button onClick={send} className="px-3 py-2 rounded bg-primary-600 text-white hover:bg-primary-700 text-sm">Envoyer</button>
    </div>
  )
}


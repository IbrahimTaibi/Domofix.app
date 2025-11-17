"use client"

import React, { useState } from 'react'
import { Send, Paperclip, Smile } from 'lucide-react'

interface ChatComposerProps {
  onSend: (text: string) => void
}

export default function ChatComposer({ onSend }: ChatComposerProps) {
  const [text, setText] = useState('')

  const handleSend = () => {
    if (text.trim()) {
      onSend(text)
      setText('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="w-full" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}>
      <div className="flex items-end gap-2 p-3 w-full">
        <button
          type="button"
          aria-label="Ajouter une pièce jointe"
          className="flex-shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 text-gray-600"
        >
          <Paperclip className="h-5 w-5" />
        </button>

        <div className="flex-1 min-w-0 flex items-end gap-2 rounded-lg border bg-gray-50 px-3 py-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tapez votre message..."
            rows={1}
            className="flex-1 min-w-0 bg-transparent text-sm text-gray-900 placeholder-gray-500 resize-none focus:outline-none"
            style={{ maxHeight: '100px' }}
          />
          <button
            type="button"
            aria-label="Ajouter un emoji"
            className="flex-shrink-0 inline-flex h-6 w-6 items-center justify-center text-gray-600 hover:text-gray-900"
          >
            <Smile className="h-5 w-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim()}
          aria-label="Envoyer"
          className="flex-shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-white hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
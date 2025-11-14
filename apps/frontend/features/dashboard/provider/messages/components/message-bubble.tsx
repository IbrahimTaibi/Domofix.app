"use client"
import React from 'react'
import type { Message } from '../../messages/types'

export default function MessageBubble({ message, isMe }: { message: Message; isMe: boolean }) {
  const bubble = isMe ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-900'
  const align = isMe ? 'justify-end' : 'justify-start'
  const radius = isMe ? 'rounded-tl-xl rounded-tr-xl rounded-bl-xl' : 'rounded-tl-xl rounded-tr-xl rounded-br-xl'
  return (
    <div className={`flex ${align} py-1`}> 
      <div className={`max-w-[80%] px-3 py-2 ${bubble} ${radius} shadow-sm`}> 
        {message.kind === 'text' && <p className="text-sm whitespace-pre-wrap">{message.text}</p>}
        {message.kind === 'image' && <img src={message.imageUrl!} alt="image" className="rounded-md" />}
        {message.kind === 'file' && (
          <a href={message.file!.url} className="text-sm underline">
            {message.file!.name} ({Math.round(message.file!.size / 1024)} KB)
          </a>
        )}
        <div className={`text-[11px] mt-1 ${isMe ? 'text-white/80' : 'text-gray-600'}`}>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
    </div>
  )
}

"use client"
import React, { useRef } from "react"
import { Bell } from "lucide-react"
import { useNotifications } from "@/features/notifications/hooks/use-notifications"
import NotificationPanel from "@/features/notifications/components/notification-panel"

interface NotificationButtonProps {
  ariaLabel?: string
}

export function NotificationButton({ ariaLabel = "Notifications" }: NotificationButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { unreadCount, isOpen, toggleOpen, setOpen } = useNotifications()

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        className={`relative inline-flex w-10 h-10 md:w-12 md:h-12 aspect-square items-center justify-center rounded-full bg-white border text-gray-800 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 p-0 leading-none transition-colors ${
          isOpen ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
        }`}
        aria-label={ariaLabel}
      >
        <Bell className={`w-5 h-5 md:w-6 md:h-6 transition-colors ${isOpen ? 'text-primary-600' : ''}`} aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationPanel
        isOpen={isOpen}
        onClose={() => setOpen(false)}
        anchorRef={buttonRef}
      />
    </div>
  )
}

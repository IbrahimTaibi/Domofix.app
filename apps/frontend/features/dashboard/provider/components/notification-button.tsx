import React from "react"
import { Bell } from "lucide-react"

interface NotificationButtonProps {
  ariaLabel?: string
}

export function NotificationButton({ ariaLabel = "Notifications" }: NotificationButtonProps) {
  return (
    <button
      type="button"
      className="inline-flex w-10 h-10 md:w-12 md:h-12 aspect-square items-center justify-center rounded-full bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 p-0 leading-none"
      aria-label={ariaLabel}
    >
      <Bell className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
    </button>
  )
}
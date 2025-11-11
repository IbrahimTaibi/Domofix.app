import React from "react"
import { Menu } from "lucide-react"

interface MobileSidebarToggleProps {
  onToggle?: () => void
}

export function MobileSidebarToggle({ onToggle }: MobileSidebarToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      aria-label="Open navigation"
    >
      <Menu className="w-5 h-5" aria-hidden="true" />
    </button>
  )
}
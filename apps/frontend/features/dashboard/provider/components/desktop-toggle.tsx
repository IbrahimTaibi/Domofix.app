import React from "react"
import { Menu } from "lucide-react"

interface DesktopSidebarToggleProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function DesktopSidebarToggle({ collapsed, onToggle }: DesktopSidebarToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="hidden md:inline-flex items-center justify-center w-12 h-12 rounded-lg border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      <Menu className="w-6 h-6" aria-hidden="true" />
    </button>
  )
}
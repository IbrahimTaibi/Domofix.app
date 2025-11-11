"use client"

import React, { useState } from "react"
import ProviderHeader from "@/features/dashboard/provider/components/header"
import ProviderSidebar from "@/features/dashboard/provider/components/sidebar"

export default function ProviderDashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const contentMarginClass = sidebarCollapsed ? "lg:ml-16" : "lg:ml-64 xl:ml-72"
  const sidebarWidthClass = sidebarCollapsed ? "w-16" : "w-64 xl:w-72"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop fixed sidebar from very top */}
      <aside className={`hidden lg:block fixed top-0 left-0 h-screen ${sidebarWidthClass} bg-white border-r border-gray-200 z-30 transition-all duration-300 ease-in-out`}>
        <ProviderSidebar collapsed={sidebarCollapsed} />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow">
            <ProviderSidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Content column shifted to the right of the sidebar */}
      <div className={`min-h-screen ${contentMarginClass} transition-all duration-300 ease-in-out`}>
        <ProviderHeader
          collapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          onToggleDesktop={() => setSidebarCollapsed((v) => !v)}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <main>
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
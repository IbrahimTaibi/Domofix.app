"use client"

import React, { useMemo } from "react"
import { usePathname } from "next/navigation"
import { useProfile } from "@/features/profile/hooks"
import { pageMetaForPath } from "@/features/dashboard/provider/utils/page-title"
import { MobileSidebarToggle } from "@/features/dashboard/provider/components/mobile-toggle"
import { DesktopSidebarToggle } from "@/features/dashboard/provider/components/desktop-toggle"
import { DashboardTitle } from "@/features/dashboard/provider/components/title"
import { HeaderSearch } from "@/features/dashboard/provider/components/search"
import { NotificationButton } from "@/features/dashboard/provider/components/notification-button"
import { AvatarButton } from "@/features/dashboard/provider/components/avatar-button"

interface HeaderProps {
  onToggleSidebar?: () => void
  collapsed?: boolean
  onToggleDesktop?: () => void
}

export default function ProviderHeader({ onToggleSidebar, collapsed = false, onToggleDesktop }: HeaderProps) {
  const pathname = usePathname()
  const { user, initials, displayName } = useProfile()

  const pageMeta = useMemo(() => pageMetaForPath(pathname), [pathname])

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white pl-1 pr-4 py-4 md:py-5 lg:py-4 shadow-sm md:pl-2 md:pr-5">
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-4">
          <MobileSidebarToggle onToggle={onToggleSidebar} />
          <DesktopSidebarToggle collapsed={collapsed} onToggle={onToggleDesktop} />
          <DashboardTitle
            title={pageMeta.title}
            subtitle={pageMeta.subtitle}
          />
        </div>

        <div className="flex items-center gap-4 md:gap-5">
          <HeaderSearch />
          <NotificationButton />
          <AvatarButton imageUrl={user?.avatar || null} alt={displayName || 'Avatar'} initials={initials || ''} />
        </div>
      </div>
    </header>
  )
}
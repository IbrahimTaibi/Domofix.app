"use client"

import React from "react"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Users,
  HelpCircle,
  User,
  CreditCard,
  List,
  Briefcase,
  ClipboardList,
} from "lucide-react"
import { SidebarMenuSections, type SidebarMenuSection } from "@/features/dashboard/provider/components/sidebar-menu-sections"

interface SidebarProps {
  collapsed?: boolean
  onClose?: () => void
}

const sections: SidebarMenuSection[] = [
  {
    id: "main",
    title: "Menu principal",
    items: [
      { href: "/dashboard/provider", label: "Tableau de bord", icon: LayoutDashboard },
      { href: "/dashboard/provider/requests", label: "Demandes", icon: ClipboardList },
      { href: "/dashboard/provider/orders", label: "Commandes", icon: List },
      { href: "/dashboard/provider/services", label: "Mes services", icon: Briefcase },
      { href: "/dashboard/provider/messages", label: "Messages", icon: MessageSquare },
      {
        href: "/dashboard/provider/billing",
        label: "Facturation",
        icon: CreditCard,
        badge: "Pro",
        children: [
          { href: "/dashboard/provider/billing/revenus", label: "Revenus", icon: CreditCard },
          { href: "/dashboard/provider/billing/devis", label: "Devis", icon: FileText },
        ],
      },
      { href: "/dashboard/provider/team", label: "Équipe", icon: Users, badge: "Pro" },
    ],
  },
  {
    id: "settings",
    title: "Paramètres & Support",
    items: [
      { href: "/dashboard/provider/settings/profile", label: "Profil", icon: User },
      { href: "/dashboard/provider/support/help", label: "Centre d'aide", icon: HelpCircle },
    ],
  },
]

export default function ProviderSidebar({ collapsed, onClose }: SidebarProps) {
  const pathname = usePathname()
  const headerJustify = collapsed ? 'justify-center' : 'justify-between md:justify-start'

  return (
    <nav className="h-full bg-white border-r border-gray-100 shadow-sm" aria-label="Provider navigation">
      <div className={`h-16 md:h-[5rem] px-5 flex items-center ${headerJustify} sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b border-gray-100`}>
        {collapsed ? (
          <span aria-label="Domofix" className="text-3xl font-bold bg-gradient-to-br from-primary-600 to-primary-700 bg-clip-text text-transparent leading-none transition-all duration-300 ease-in-out">
            D
          </span>
        ) : (
          <span aria-label="Domofix" className="text-3xl md:text-4xl font-bold tracking-tight leading-tight transition-all duration-300 ease-in-out">
            <span className="bg-gradient-to-br from-primary-600 to-primary-700 bg-clip-text text-transparent">D</span>
            <span className="font-normal text-gray-600">omofix</span>
          </span>
        )}
        <button
          type="button"
          onClick={onClose}
          className="md:hidden inline-flex items-center px-3 py-2 rounded-lg bg-gray-50 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label="Close navigation"
        >
          Fermer
        </button>
      </div>
      <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] overflow-y-auto scrollbar-light">
        <SidebarMenuSections sections={sections} collapsed={collapsed} activePath={pathname} />
      </div>
    </nav>
  )
}

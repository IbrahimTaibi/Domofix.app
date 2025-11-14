"use client"

import React from "react"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Search,
  History,
  MessageSquare,
  FileText,
  Boxes,
  Users,
  LifeBuoy,
  Bug,
  HelpCircle,
  Settings,
  User,
  Sliders,
  CreditCard,
  MapPin,
  AlertTriangle,
  UserPlus,
  Shield,
  Clock,
  List,
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
      {
        href: "/dashboard/provider/requests",
        label: "Demandes",
        icon: Search,
        children: [
          { href: "/dashboard/provider/requests/all", label: "Toutes les demandes", icon: List },
          { href: "/dashboard/provider/requests/nearby", label: "À proximité", icon: MapPin },
          { href: "/dashboard/provider/requests/urgent", label: "Urgentes", icon: AlertTriangle, badge: "Pro" },
          { href: "/dashboard/provider/requests/in-progress", label: "En cours", icon: Clock },
          { href: "/dashboard/provider/requests/candidatures", label: "Mes candidatures", icon: UserPlus },
        ],
      },
      {
        href: "/dashboard/provider/orders",
        label: "Commandes",
        icon: List,
        children: [
          { href: "/dashboard/provider/orders/actives", label: "Actives", icon: List },
          { href: "/dashboard/provider/orders/terminees", label: "Terminées", icon: History },
        ],
      },
      { href: "/dashboard/provider/messages", label: "Messages", icon: MessageSquare },
      {
        href: "/dashboard/provider/billing",
        label: "Facturation",
        icon: CreditCard,
        children: [
          { href: "/dashboard/provider/billing/revenus", label: "Revenus", icon: CreditCard, badge: "Pro" },
          { href: "/dashboard/provider/billing/virements", label: "Virements", icon: CreditCard, badge: "Pro" },
          { href: "/dashboard/provider/billing/devis", label: "Devis", icon: FileText, badge: "Pro" },
          { href: "/dashboard/provider/billing/transactions", label: "Transactions", icon: History, badge: "Pro" },
          { href: "/dashboard/provider/billing/fiscalite", label: "Documents fiscaux", icon: FileText, badge: "Pro" },
        ],
      },
      { href: "/dashboard/provider/stock", label: "Stock", icon: Boxes, badge: "Pro" },
      { href: "/dashboard/provider/team", label: "Équipe", icon: Users, badge: "Pro" },
    ],
  },
  {
    id: "support",
    title: "Support",
    items: [
      { href: "/dashboard/provider/support/assistance", label: "Assistance", icon: LifeBuoy },
      { href: "/dashboard/provider/support/bug", label: "Signaler un bug", icon: Bug },
      { href: "/dashboard/provider/support/help", label: "Centre d’aide", icon: HelpCircle },
    ],
  },
  {
    id: "settings",
    title: "Paramètres",
    items: [
      { href: "/dashboard/provider/settings/profile", label: "Profil", icon: User },
      { href: "/dashboard/provider/settings/preferences", label: "Préférences", icon: Sliders },
    ],
  },
]

export default function ProviderSidebar({ collapsed, onClose }: SidebarProps) {
  const pathname = usePathname()
  const headerJustify = collapsed ? 'justify-center' : 'justify-between md:justify-start'

  return (
    <nav className="h-full bg-white border-r border-gray-200" aria-label="Provider navigation">
      <div className={`h-16 md:h-[5rem] px-4 flex items-center ${headerJustify} sticky top-0 bg-white z-10`}>
        {collapsed ? (
          <span aria-label="Domofix" className="text-3xl font-extrabold text-primary-600 leading-none transition-all duration-300 ease-in-out">
            D
          </span>
        ) : (
          <span aria-label="Domofix" className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight transition-all duration-300 ease-in-out">
            <span className="text-primary-600">D</span>
            <span className="font-light text-gray-500">omofix</span>
          </span>
        )}
        <button
          type="button"
          onClick={onClose}
          className="md:hidden inline-flex items-center px-2.5 py-1.5 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
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

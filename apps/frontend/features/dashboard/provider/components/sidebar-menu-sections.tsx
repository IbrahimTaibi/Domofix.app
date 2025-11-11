import React, { useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, ChevronRight } from "lucide-react"
import { SidebarMenu, type SidebarMenuItem } from "@/features/dashboard/provider/components/sidebar-menu"

export interface SidebarMenuSection {
  id: string
  title?: string
  items: SidebarMenuItem[]
}

interface SidebarMenuSectionsProps {
  sections: SidebarMenuSection[]
  collapsed?: boolean
  activePath?: string
}

export function SidebarMenuSections({ sections, collapsed = false, activePath }: SidebarMenuSectionsProps) {
  const initialOpen = useMemo(() => {
    const state: Record<string, boolean> = {}
    sections.forEach((s) => { state[s.id] = true })
    return state
  }, [sections])

  const [open, setOpen] = useState<Record<string, boolean>>(initialOpen)

  const toggle = (id: string) => setOpen((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <div className="py-2">
      {sections.map((section) => {
        const isOpen = open[section.id] ?? true
        return (
          <div key={section.id} className="mb-2">
            {!collapsed && section.title && (
              <button
                type="button"
                onClick={() => toggle(section.id)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] uppercase tracking-wide text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                aria-expanded={isOpen}
              >
                <span>{section.title}</span>
                {isOpen ? (
                  <ChevronDown className="w-3 h-3" aria-hidden="true" />
                ) : (
                  <ChevronRight className="w-3 h-3" aria-hidden="true" />
                )}
              </button>
            )}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key={`${section.id}-items`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <SidebarMenu items={section.items} collapsed={collapsed} activePath={activePath} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
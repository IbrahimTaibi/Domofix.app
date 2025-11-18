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
    <div className="py-3">
      {sections.map((section, index) => {
        const isOpen = open[section.id] ?? true
        return (
          <div key={section.id} className={index > 0 ? "mt-6" : ""}>
            {!collapsed && section.title && (
              <div className="px-3 mb-2">
                <button
                  type="button"
                  onClick={() => toggle(section.id)}
                  className="w-full flex items-center justify-between py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-700 transition-colors group"
                  aria-expanded={isOpen}
                >
                  <span className="group-hover:translate-x-0.5 transition-transform duration-200">{section.title}</span>
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded transition-colors group-hover:bg-gray-100">
                    {isOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200" aria-hidden="true" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 transition-transform duration-200" aria-hidden="true" />
                    )}
                  </span>
                </button>
                {index > 0 && <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mt-2" />}
              </div>
            )}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key={`${section.id}-items`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
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
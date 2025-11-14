import React, { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ProBadge } from "@/shared/components";
import { ChevronDown, ChevronRight } from "lucide-react";

export interface SidebarMenuItem {
  href: string;
  label: string;
  // icon is a React component (e.g., from lucide-react)
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children?: SidebarMenuItem[];
  badge?: string;
}

interface SidebarMenuProps {
  items: SidebarMenuItem[];
  collapsed?: boolean;
  activePath?: string;
  className?: string;
}

export function SidebarMenu({
  items,
  collapsed = false,
  activePath,
  className,
}: SidebarMenuProps) {
  const initialOpen = useMemo(() => {
    const state: Record<string, boolean> = {};
    items.forEach((it) => {
      if (it.children?.length) state[`${it.href}-${it.label}`] = true;
    });
    return state;
  }, [items]);

  const [open, setOpen] = useState<Record<string, boolean>>(initialOpen);
  const toggle = (key: string) =>
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <ul className={className ?? "space-y-2 px-3 py-3"}>
      {items.map((item) => {
        const { href, label, icon: Icon, children } = item;
        const active = activePath === href;
        const key = `${href}-${label}`;
        const isOpen = open[key] ?? true;

        return (
          <li key={key}>
            <div
              className={`group flex items-center ${collapsed ? "justify-center" : "justify-between"} gap-2 ${
                active
                  ? "rounded-md bg-primary-50 border-l-2 border-primary-200"
                  : "rounded-md hover:bg-primary-50 hover:border-l-2 hover:border-primary-200"
              }`}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                title={collapsed ? label : undefined}
                className={`flex items-center justify-between px-3 py-3 flex-1 transition-colors duration-200 ${
                  active ? "text-primary-800" : ""
                }`}>
                <span className="flex items-center gap-2">
                  <Icon
                    className={`w-4 h-4 ${active ? "text-primary-700" : "text-gray-700"} group-hover:text-primary-700`}
                    aria-hidden="true"
                  />
                  {!collapsed && (
                    <span
                      className={`text-[15px] ${active ? "text-primary-800" : "text-gray-900"} group-hover:text-primary-700`}>
                      {label}
                    </span>
                  )}
                </span>
                {!collapsed && item.badge === "Pro" && <ProBadge size="sm" />}
              </Link>
              {!collapsed && children?.length ? (
                <button
                  type="button"
                  onClick={() => toggle(key)}
                  aria-label={isOpen ? "Réduire" : "Développer"}
                  className={`inline-flex items-center justify-center w-6 h-6 rounded ${
                    active ? "text-primary-700" : "text-gray-600"
                  } group-hover:text-primary-700`}>
                  {isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                </button>
              ) : null}
            </div>

            {!collapsed && children?.length ? (
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.ul
                    key={`${key}-children`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="mt-1.5 pl-6 space-y-1.5">
                    {children.map((child) => {
                      const cKey = `${key}-${child.href}-${child.label}`;
                      const cActive = activePath === child.href;
                      return (
                        <li key={cKey}>
                          <Link
                            href={child.href}
                            aria-current={cActive ? "page" : undefined}
                            className={`group flex items-center justify-between px-3 py-2.5 transition-colors duration-200 ${
                              cActive
                                ? "rounded-md bg-primary-50 border-l-2 border-primary-200"
                                : "rounded-md hover:bg-primary-50 hover:border-l-2 hover:border-primary-200"
                            }`}>
                            <span className="flex items-center gap-2">
                              <child.icon
                                className={`w-4 h-4 ${cActive ? "text-primary-700" : "text-gray-600"} group-hover:text-primary-700`}
                              />
                              <span
                                className={`text-sm ${cActive ? "text-primary-800" : "text-gray-800"} group-hover:text-primary-700`}>
                                {child.label}
                              </span>
                            </span>
                            {child.badge === "Pro" && <ProBadge size="sm" />}
                          </Link>
                        </li>
                      );
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

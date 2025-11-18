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
    <ul className={className ?? "space-y-1.5 px-3 py-2"}>
      {items.map((item) => {
        const { href, label, icon: Icon, children } = item;
        const active = activePath === href;
        const key = `${href}-${label}`;
        const isOpen = open[key] ?? true;

        return (
          <li key={key}>
            <div
              className={`group flex items-center ${collapsed ? "justify-center" : "justify-between"} gap-2 rounded-lg transition-all duration-200 ${
                active
                  ? "bg-primary-50 border-l-[3px] border-primary-600 shadow-sm"
                  : "hover:bg-gray-50 hover:border-l-[3px] hover:border-primary-200 hover:shadow-sm"
              }`}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                title={collapsed ? label : undefined}
                className={`flex items-center justify-between px-3 py-3 flex-1 transition-all duration-200 ${
                  collapsed ? "" : "group-hover:scale-[1.01]"
                } ${active ? "text-primary-800" : ""}`}>
                <span className="flex items-center gap-3">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                    active
                      ? "bg-primary-100 text-primary-700"
                      : "bg-gray-100 text-gray-600 group-hover:bg-primary-50 group-hover:text-primary-600"
                  }`}>
                    <Icon
                      className="w-4 h-4"
                      aria-hidden="true"
                    />
                  </span>
                  {!collapsed && (
                    <span
                      className={`text-[15px] font-medium transition-colors duration-200 ${
                        active ? "text-gray-900" : "text-gray-700 group-hover:text-gray-900"
                      }`}>
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
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 ${
                    active ? "text-primary-600" : "text-gray-500 hover:text-primary-600 hover:bg-primary-50"
                  }`}>
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 transition-transform duration-200" aria-hidden="true" />
                  ) : (
                    <ChevronRight className="w-4 h-4 transition-transform duration-200" aria-hidden="true" />
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
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="mt-2 pl-6 space-y-1">
                    {children.map((child) => {
                      const cKey = `${key}-${child.href}-${child.label}`;
                      const cActive = activePath === child.href;
                      return (
                        <li key={cKey}>
                          <Link
                            href={child.href}
                            aria-current={cActive ? "page" : undefined}
                            className={`group flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 hover:scale-[1.01] ${
                              cActive
                                ? "bg-primary-50 border-l-[3px] border-primary-500 shadow-sm"
                                : "hover:bg-gray-50 hover:border-l-[3px] hover:border-primary-200 hover:shadow-sm"
                            }`}>
                            <span className="flex items-center gap-2.5">
                              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-md transition-all duration-200 ${
                                cActive
                                  ? "bg-primary-100 text-primary-600"
                                  : "bg-gray-50 text-gray-500 group-hover:bg-primary-50 group-hover:text-primary-500"
                              }`}>
                                <child.icon className="w-3.5 h-3.5" />
                              </span>
                              <span
                                className={`text-sm font-medium transition-colors duration-200 ${
                                  cActive ? "text-gray-900" : "text-gray-600 group-hover:text-gray-900"
                                }`}>
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

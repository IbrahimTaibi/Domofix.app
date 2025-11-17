"use client";

import React from "react";
import { useWidgetStore } from "@/features/widget/store/widget-store";
import { Home, MessageSquare, HelpCircle } from "lucide-react";

export default function BottomNav() {
  const tab = useWidgetStore((s) => s.tab);
  const setTab = useWidgetStore((s) => s.setTab);
  return (
    <nav
      aria-label="Navigation widget"
      className="border-t bg-white"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div
        role="tablist"
        aria-orientation="horizontal"
        className="grid grid-cols-3">
        <button
          role="tab"
          aria-selected={tab === "home"}
          onClick={() => setTab("home")}
          className={`flex flex-col items-center justify-center py-2 text-xs ${tab === "home" ? "text-primary-700" : "text-gray-700"} focus:outline-none focus:ring-2 focus:ring-primary-500`}>
          <Home className="h-5 w-5" />
          Acceuil
        </button>
        <button
          role="tab"
          aria-selected={tab === "messages"}
          onClick={() => setTab("messages")}
          className={`flex flex-col items-center justify-center py-2 text-xs ${tab === "messages" ? "text-primary-700" : "text-gray-700"} focus:outline-none focus:ring-2 focus:ring-primary-500`}>
          <MessageSquare className="h-5 w-5" />
          Messages
        </button>
        <button
          role="tab"
          aria-selected={tab === "help"}
          onClick={() => setTab("help")}
          className={`flex flex-col items-center justify-center py-2 text-xs ${tab === "help" ? "text-primary-700" : "text-gray-700"} focus:outline-none focus:ring-2 focus:ring-primary-500`}>
          <HelpCircle className="h-5 w-5" />
          Help
        </button>
      </div>
    </nav>
  );
}

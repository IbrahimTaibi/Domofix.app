"use client";

import Link from "next/link";
import { useEffect } from "react";
import { LayoutGrid, History, Plus, MessageSquare, Bell } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function SecondaryNavbar() {
  const { isAuthenticated, user } = useAuth();
  // Height of the secondary navbar used by layout padding
  // We expose it as a CSS variable so the main content can account for it on desktop
  const secondaryHeight = "3rem"; // 48px
  const mobileHeight = "3.5rem"; // 56px

  // Set CSS variables at :root when the secondary navbar is mounted
  useEffect(() => {
    document.documentElement.style.setProperty("--secondary-navbar-height", secondaryHeight);
    document.documentElement.style.setProperty("--secondary-navbar-mobile-height", mobileHeight);

    return () => {
      document.documentElement.style.removeProperty("--secondary-navbar-height");
      document.documentElement.style.removeProperty("--secondary-navbar-mobile-height");
    };
  }, []);

  return (
    <>
      {/* Desktop secondary navbar (text-only) */}
      <nav
        className="hidden md:block fixed w-full z-40 bg-white border-b border-gray-200"
        style={{
          top: "calc(var(--navbar-height, 4rem))",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-12 flex items-center justify-center">
            <div className="flex items-center space-x-8">
              <Link
                href={isAuthenticated && user && user.role !== "provider" ? "/profile" : "/dashboard"}
                className="px-2 text-gray-700 hover:text-primary-600 transition-colors text-sm font-medium"
              >
                {isAuthenticated && user && user.role !== "provider" ? "Profil" : "Dashboard"}
              </Link>
              <Link href="/historique" className="px-2 text-gray-700 hover:text-primary-600 transition-colors text-sm font-medium">
                Historique
              </Link>
              <Link
                href="/demander-un-service"
                className="px-2 text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 transition-all text-sm font-semibold"
              >
                Demander un service
              </Link>
              <Link href="/messages" className="px-2 text-gray-700 hover:text-primary-600 transition-colors text-sm font-medium">
                Messages
              </Link>
              <Link href="/notifications" className="px-2 text-gray-700 hover:text-primary-600 transition-colors text-sm font-medium">
                Notifications
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile bottom navigation (icons-only) */}
      <nav
        className="md:hidden fixed bottom-0 w-full z-40 bg-white border-t border-gray-200"
      >
        <div className="max-w-7xl mx-auto relative">
          <div className="h-14 grid grid-cols-5">
            <Link href="/dashboard" aria-label="Dashboard" className="flex items-center justify-center text-gray-700 hover:text-primary-600 transition-colors">
              <LayoutGrid className="w-5 h-5" />
            </Link>
            <Link href="/historique" aria-label="Historique" className="flex items-center justify-center text-gray-700 hover:text-primary-600 transition-colors">
              <History className="w-5 h-5" />
            </Link>
            {/* Center floating action button */}
            <div className="relative">
              <Link
                href="/demander-un-service"
                aria-label="Demander un service"
                className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary-600 hover:bg-primary-700 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white transition active:scale-95 z-10"
              >
                <Plus className="w-6 h-6" />
              </Link>
            </div>
            <Link href="/messages" aria-label="Messages" className="flex items-center justify-center text-gray-700 hover:text-primary-600 transition-colors">
              <MessageSquare className="w-5 h-5" />
            </Link>
            <Link href="/notifications" aria-label="Notifications" className="flex items-center justify-center text-gray-700 hover:text-primary-600 transition-colors">
              <Bell className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
"use client";

import React from "react";
import Link from "next/link";
import {
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Info,
  MessageCircle,
  Sparkles,
} from "lucide-react";

export default function HomeScreen() {
  return (
    <section aria-labelledby="widget-home-title" className="min-h-full pb-20">
      {/* Hero Section with Gradient */}
      <div className="relative px-6 pt-8 pb-12 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-500 to-indigo-600 -z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)] -z-10" />

        {/* Logo/Brand */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-4 shadow-lg">
          <Sparkles className="w-8 h-8 text-white" />
        </div>

        <h1
          id="widget-home-title"
          className="text-4xl font-bold text-white mb-3 tracking-tight"
          aria-label="Domofix">
          Domofix
        </h1>
        <p className="text-white/90 text-base font-medium max-w-[280px] mx-auto">
          Simplifiez vos services, en toute confiance
        </p>
      </div>

      <div className="px-4 space-y-4 -mt-6">
        {/* Quick Action Card */}
        <Link href="/contact" className="block" aria-label="Contact us">
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-white via-blue-50 to-primary-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-primary-200">
            <div className="relative px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 shadow-md">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-gray-900 font-semibold text-base">
                      Envoyez un message
                    </div>
                    <div className="text-gray-600 text-xs">
                      Nous sommes là pour vous
                    </div>
                  </div>
                </div>
                <ChevronRight
                  className="h-5 w-5 text-primary-600 group-hover:translate-x-1 transition-transform"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </Link>

        {/* Policy Info Card */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 flex-shrink-0 mt-0.5">
              <Info className="h-4 w-4 text-blue-600" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">
                Règles de contact
              </h2>
              <ul className="space-y-2 text-xs text-gray-700 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>
                    Vous pouvez contacter uniquement les prestataires que vous
                    avez approuvés
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>
                    Le chat se ferme automatiquement quand la commande est{" "}
                    <span className="font-semibold">terminée</span>,{" "}
                    <span className="font-semibold">annulée</span> ou{" "}
                    <span className="font-semibold">clôturée</span>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

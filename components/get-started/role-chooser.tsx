"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Briefcase, User, Sparkles, ShieldCheck, Star, CheckCircle2 } from "lucide-react";

type Role = "customer" | "provider" | null;

export function RoleChooser() {
  const [selected, setSelected] = useState<Role>(null);

  const cards = [
    {
      key: "customer" as const,
      href: "/get-started/customer",
      title: "Je veux réserver des services",
      description:
        "Comparez les prestataires, voyez des prix transparents et réservez en quelques minutes.",
      icon: User,
      badge: "Clients",
      highlight: "Rapide, transparent, fiable",
    },
    {
      key: "provider" as const,
      href: "/get-started/provider",
      title: "Je suis prestataire",
      description:
        "Profitez d'1 mois gratuit et gérez votre travail depuis un tableau de bord centralisé.",
      icon: Briefcase,
      badge: "Prestataires",
      highlight: "1 mois gratuit · centralisez votre travail",
    },
  ];

  return (
    <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Subtle animated background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.12, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.08, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-100 rounded-full blur-3xl"
        />
      </div>

      <div className="relative max-w-5xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold mb-4"
          >
            <Sparkles className="w-4 h-4" />
            Choisissez votre parcours
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-3"
          >
            Comment souhaitez-vous commencer ?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="text-gray-600 max-w-2xl mx-auto"
          >
            Choisissez l’option qui vous convient. Vous pourrez toujours changer plus tard.
          </motion.p>

          {/* Trust bar */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500"
          >
            <div className="inline-flex items-center gap-1.5"><Star className="w-4 h-4 text-primary-600" /> Note moyenne 4,9</div>
            <span className="hidden sm:inline-block">•</span>
            <div className="inline-flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-primary-600" /> Prestataires vérifiés</div>
            <span className="hidden sm:inline-block">•</span>
            <div className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-primary-600" /> Pas de frais cachés</div>
          </motion.div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            const isSelected = selected === card.key;
            return (
              <motion.button
                key={card.key}
                type="button"
                onClick={() => setSelected(card.key)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.05 + 0.1 }}
                className={`text-left relative rounded-2xl border p-6 sm:p-8 shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                ${isSelected ? "border-primary-400 ring-1 ring-primary-300 bg-white" : "border-gray-200 bg-white hover:shadow-md hover:border-primary-300"}`}
                aria-pressed={isSelected}
              >
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-primary-400 to-primary-600 opacity-0 blur-xl transition-opacity pointer-events-none" style={{ opacity: isSelected ? 0.12 : 0 }} />

                <div className="relative">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 ${isSelected ? "bg-primary-100 text-primary-700" : "bg-gray-50 text-gray-700"}`}>
                    {card.badge}
                  </div>

                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? "bg-primary-100" : "bg-primary-50"}`}>
                      <Icon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900 mb-1">{card.title}</h2>
                          <p className="text-gray-600 text-sm">{card.description}</p>
                        </div>
                        <ArrowRight className={`flex-shrink-0 w-5 h-5 mt-1 transition-transform ${isSelected ? "text-primary-600 translate-x-0.5" : "text-gray-400 group-hover:translate-x-0.5"}`} />
                      </div>
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-4"
                          >
                            <div className="text-xs text-primary-700 bg-primary-50 inline-flex items-center px-2.5 py-1 rounded-md">
                              {card.highlight}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Dynamic details panel */}
        <AnimatePresence mode="wait">
          {selected && (
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3 }}
              className="mt-8 rounded-2xl border border-primary-200/60 bg-gradient-to-br from-white to-primary-50/40 p-6 sm:p-8"
            >
              {selected === "customer" ? (
                <div className="grid sm:grid-cols-2 gap-6 items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Pourquoi les clients choisissent Tawa</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary-600" /> Tarifs transparents, sans surprise</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary-600" /> Avis vérifiés et prestataires de confiance</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary-600" /> Réservation en minutes, replanification flexible</li>
                    </ul>
                  </div>
                  <div className="sm:justify-self-end">
                    <Link href="/get-started/customer" className="inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 shadow-sm">
                      Continuer en tant que client <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-6 items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Pourquoi les prestataires rejoignent Tawa</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary-600" /> 1 mois gratuit, sans carte bancaire</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary-600" /> Tableau de bord centralisé pour réservations et revenus</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary-600" /> Atteignez plus de clients dans votre zone</li>
                    </ul>
                  </div>
                  <div className="sm:justify-self-end">
                    <Link href="/get-started/provider" className="inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 shadow-sm">
                      Continuer en tant que prestataire <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Default summaries when no selection */}
        {!selected && (
          <div className="mt-8 grid sm:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="rounded-xl border border-gray-200 p-4 bg-white">
              <h3 className="font-semibold text-gray-900 mb-2">Pour les clients</h3>
              <p>Trouvez rapidement le bon prestataire avec des tarifs transparents et des avis.</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-4 bg-white">
              <h3 className="font-semibold text-gray-900 mb-2">Pour les prestataires</h3>
              <p>Développez votre activité avec un tableau de bord centralisé et un premier mois offert.</p>
            </div>
          </div>
        )}

        
      </div>
    </section>
  );
}



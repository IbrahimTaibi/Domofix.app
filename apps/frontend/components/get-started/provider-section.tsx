"use client";

import Link from "next/link";
import { Button } from "@/components/ui";
import { motion } from "framer-motion";
import {
  Calendar,
  LayoutDashboard,
  TrendingUp,
  Users,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BarChart3,
  Clock,
  DollarSign,
  Play,
} from "lucide-react";

const features = [
  {
    icon: LayoutDashboard,
    title: "Centralized Dashboard",
    description: "Manage all your bookings, schedule, and earnings in one place",
  },
  {
    icon: Users,
    title: "Reach More Customers",
    description: "Connect with thousands of customers in your neighborhood",
  },
  {
    icon: BarChart3,
    title: "Track Performance",
    description: "Monitor your earnings, reviews, and growth metrics",
  },
  {
    icon: Clock,
    title: "Flexible Schedule",
    description: "Set your availability and manage your time your way",
  },
];

const steps = [
  {
    number: 1,
    title: "Sign up for free",
    description: "Create your provider account in minutes",
  },
  {
    number: 2,
    title: "Set up your profile",
    description: "Add services, pricing, and availability",
  },
  {
    number: 3,
    title: "Start receiving bookings",
    description: "Get matched with customers instantly",
  },
  {
    number: 4,
    title: "Manage from dashboard",
    description: "Centralize everything in one powerful dashboard",
  },
];

export function GetStartedProviderSection() {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header with Free Offer */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-700 text-white px-4 py-2 rounded-full mb-6 shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-bold">OFFRE LIMITÉE</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Développez votre activité avec <span className="text-primary-600">Tawa</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Devenez prestataire et profitez d’<strong>1 mois entièrement gratuit</strong>. Accédez à un puissant tableau de bord pour centraliser et gérer votre activité au même endroit.
          </p>
        </motion.div>

        {/* Free Offer Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-400 to-primary-600 rounded-3xl blur-xl opacity-30" />
            <div className="relative rounded-3xl border-2 border-primary-200 bg-gradient-to-br from-primary-50 to-white p-8 sm:p-12 shadow-2xl">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-1.5 rounded-full mb-4 text-sm font-semibold">
                    <DollarSign className="w-4 h-4" />
                    <span>1 MOIS GRATUIT</span>
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                    Commencez aujourd’hui, payez plus tard
                  </h3>
                  <p className="text-lg text-gray-600 mb-6">
                    Accédez à l’intégralité de la plateforme et à toutes les fonctionnalités pendant 30 jours, sans frais. Aucune carte bancaire requise.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-3 text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-primary-600 flex-shrink-0" />
                      <span>Accès complet à la plateforme</span>
                    </li>
                    <li className="flex items-center gap-3 text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-primary-600 flex-shrink-0" />
                      <span>Toutes les fonctionnalités du tableau de bord</span>
                    </li>
                    <li className="flex items-center gap-3 text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-primary-600 flex-shrink-0" />
                      <span>Aucun frais caché</span>
                    </li>
                  </ul>
                  <Link href="/register/provider">
                    <Button
                      variant="primary"
                      size="lg"
                      className="group text-base font-semibold"
                    >
                      Obtenir mon mois gratuit
                      <ArrowRight className="ml-2 h-5 w-5 inline-block transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>

                <div className="relative">
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900">Ce que votre tableau de bord vous apporte</h4>
                      <p className="text-sm text-gray-600">Des outils concrets pour centraliser votre travail — même hors Tawa</p>
                    </div>

                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900">Documents et devis centralisés</div>
                          <p className="text-sm text-gray-600">Stockez vos devis, contrats et photos de chantiers au même endroit.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900">Facturation simple</div>
                          <p className="text-sm text-gray-600">Créez, envoyez et suivez vos factures, avec rappels d’impayés.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900">Suivi du stock</div>
                          <p className="text-sm text-gray-600">Gérez vos consommables et recevez des alertes de réapprovisionnement.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900">Calendrier intelligent</div>
                          <p className="text-sm text-gray-600">Planifiez vos interventions et synchronisez avec votre agenda.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900">Réservations multi‑canales</div>
                          <p className="text-sm text-gray-600">Centralisez les demandes venant de Tawa, téléphone, e‑mail ou réseaux.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900">Vision sur vos revenus</div>
                          <p className="text-sm text-gray-600">Suivez vos performances et anticipez votre trésorerie.</p>
                        </div>
                      </li>
                    </ul>

                    <div className="mt-6">
                      <h5 className="text-sm font-semibold text-gray-900 mb-2">Aperçu vidéo (bientôt)</h5>
                      <div className="relative w-full rounded-xl border border-dashed border-gray-300 bg-gray-50 overflow-hidden" style={{ paddingTop: '56.25%' }}>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                          <div className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center mb-3">
                            <Play className="w-5 h-5 text-gray-500" />
                          </div>
                          <p className="text-sm text-gray-600">Une vidéo de démonstration du tableau de bord sera disponible ici.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
                className="p-6 rounded-xl border border-gray-200 bg-white hover:border-primary-300 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* How to Get Started Steps */}
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Commencez en 4 étapes simples
            </h3>
            <p className="text-gray-600">
              De l’inscription à votre première réservation, nous vous guidons à chaque étape
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6 mb-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4 p-6 rounded-xl border border-gray-200 bg-white hover:border-primary-300 hover:shadow-md transition-all"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-primary-600 text-lg font-bold border-2 border-primary-200">
                  {step.number}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {step.title}
                  </h4>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center bg-gradient-to-br from-primary-50 to-white rounded-2xl border border-primary-200 p-8 sm:p-12"
          >
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Prêt à transformer votre activité ?
            </h3>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Rejoignez des milliers de prestataires qui grandissent avec Tawa. Commencez votre mois gratuit dès aujourd’hui et découvrez la simplicité de gestion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register/provider">
                <Button variant="primary" size="sm" className="group">
                  Commencer gratuitement pendant 30 jours
                  <ArrowRight className="ml-2 h-4 w-4 inline-block transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Vous avez déjà un compte ?
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}


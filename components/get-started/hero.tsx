"use client";

import Link from "next/link";
import { Button } from "@/components/ui";
import { Logo } from "@/components/layout";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Shield,
  Zap,
  Lock,
  ArrowRight,
  UserPlus,
  Calendar,
  CreditCard,
  Search,
} from "lucide-react";

interface GetStartedHeroProps {
  isAuthenticated?: boolean;
  user?: any;
}

const benefits = [
  { icon: Shield, text: "Verified providers" },
  { icon: Zap, text: "Fast booking" },
  { icon: Lock, text: "Secure payments" },
  { icon: CheckCircle2, text: "No hidden fees" },
];

const steps = [
  {
    number: 1,
    title: "Create account",
    description: "Sign up in seconds",
    icon: UserPlus,
  },
  {
    number: 2,
    title: "Choose provider",
    description: "Browse & compare",
    icon: Search,
  },
  {
    number: 3,
    title: "Pick time",
    description: "Select your slot",
    icon: Calendar,
  },
  {
    number: 4,
    title: "Confirm & pay",
    description: "Secure checkout",
    icon: CreditCard,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export function GetStartedHero({ isAuthenticated = false, user }: GetStartedHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/50 via-white to-white">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full blur-3xl opacity-20" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-100 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <motion.div variants={itemVariants}>
            <motion.div
              className="mb-6 inline-flex items-center gap-3"
              whileHover={{ scale: 1.02 }}>
              <Logo size="sm" />
              <span className="text-xs uppercase tracking-widest text-primary-600 font-semibold bg-primary-50 px-3 py-1 rounded-full">
                Commencer
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6 leading-tight">
              {isAuthenticated ? (
                <>
                  Bienvenue {user?.firstName ? user.firstName : 'cher client'},{" "}
                  <span className="text-primary-600">réservez votre service</span>
                </>
              ) : (
                <>
                  Réservez des services de confiance{" "}
                  <span className="text-primary-600">en quelques minutes</span>
                </>
              )}
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-gray-600 text-lg sm:text-xl leading-relaxed max-w-xl mb-8">
              {isAuthenticated ? (
                "Explorez notre sélection de prestataires vérifiés et réservez le service qui vous convient en quelques clics."
              ) : (
                "Rejoignez des milliers d'utilisateurs qui font confiance à Tawa pour comparer les prestataires, voir des prix transparents et planifier instantanément."
              )}
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-3 mb-8">
              {isAuthenticated ? (
                <Link href="/services">
                  <Button
                    variant="primary"
                    size="sm"
                    className="group relative overflow-hidden">
                    Réserver un service
                    <ArrowRight className="ml-2 h-4 w-4 inline-block transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register/customer">
                    <Button
                      variant="primary"
                      size="sm"
                      className="group relative overflow-hidden">
                      Créer un compte
                      <ArrowRight className="ml-2 h-4 w-4 inline-block transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      J'ai déjà un compte
                    </Button>
                  </Link>
                </>
              )}
            </motion.div>

            <motion.ul
              variants={itemVariants}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <motion.li
                    key={index}
                    className="flex items-center gap-3 text-sm sm:text-base text-gray-700"
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 400 }}>
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-primary-600" />
                    </div>
                    <span className="font-medium">{benefit.text}</span>
                  </motion.li>
                );
              })}
            </motion.ul>
          </motion.div>

          {/* Right Column - Interactive Steps Card */}
          <motion.div variants={itemVariants} className="relative lg:pl-8">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-400 to-primary-600 rounded-3xl blur-xl opacity-20" />

              <motion.div
                className="relative rounded-3xl border border-primary-100/50 bg-white/80 backdrop-blur-sm shadow-2xl p-8"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Guide de démarrage rapide
                  </h3>
                  <p className="text-sm text-gray-600">
                    Suivez ces étapes simples pour commencer
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {steps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <motion.div
                        key={step.number}
                        className="group relative rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4 sm:p-4 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                        whileHover={{ y: -4, scale: 1.02 }}>
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-primary-600 text-sm font-bold">
                            {step.number}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <Icon className="w-4 h-4 text-primary-600 flex-shrink-0" />
                              <h4 className="font-semibold text-gray-900 text-sm">
                                {step.title}
                              </h4>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <Link href="/register/customer">
                  <Button variant="primary" size="sm" className="w-full group">
                    Commencer maintenant
                    <ArrowRight className="ml-2 h-4 w-4 inline-block transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

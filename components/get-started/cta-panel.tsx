"use client";

import Link from "next/link";
import { Button } from "@/components/ui";
import { motion } from "framer-motion";
import {
  ArrowRight,
  DollarSign,
  Star,
  Calendar,
  HeadphonesIcon,
} from "lucide-react";

const features = [
  { icon: DollarSign, text: "Transparent pricing" },
  { icon: Star, text: "Trusted reviews" },
  { icon: Calendar, text: "Flexible rescheduling" },
  { icon: HeadphonesIcon, text: "Priority support" },
];

export function GetStartedCTA() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Background glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 rounded-3xl blur-2xl opacity-10" />

          <div className="relative rounded-3xl border border-gray-200/80 bg-gradient-to-br from-white via-white to-primary-50/30 backdrop-blur-sm p-8 sm:p-12 shadow-xl">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-4">
                    Prêt à commencer ?
                  </h2>
                  <p className="text-lg text-gray-600 mb-6">
                    Créez votre compte pour comparer les prestataires, réserver un créneau et payer en toute sécurité. Rejoignez des milliers d’utilisateurs satisfaits.
                  </p>
                </motion.div>

                <motion.ul
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <motion.li
                        key={index}
                        className="flex items-center gap-3 text-sm sm:text-base text-gray-700"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        whileHover={{ x: 4 }}
                      >
                        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                          <Icon className="w-5 h-5 text-primary-600" />
                        </div>
                        <span className="font-medium">{feature.text}</span>
                      </motion.li>
                    );
                  })}
                </motion.ul>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex flex-col gap-4"
              >
                <Link href="/register/customer" className="w-full">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full group text-base py-6"
                  >
                    Créer un compte gratuit
                    <ArrowRight className="ml-2 h-5 w-5 inline-block transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/login" className="w-full">
                  <Button variant="ghost" size="sm" className="w-full text-base py-6">
                    Se connecter à un compte existant
                  </Button>
                </Link>

                <p className="text-xs text-center text-gray-500 mt-2">
                  Aucune carte bancaire requise · Inscription gratuite
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}



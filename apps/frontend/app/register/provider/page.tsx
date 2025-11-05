import type { Metadata } from "next";
import Image from "next/image";
import { ProviderRegistrationForm } from "@/features/auth/components/provider-registration-form";
import { CheckCircle2, Shield, TrendingUp, Clock } from "lucide-react";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Demande prestataire — Domofix",
  description:
    "Soumettez votre demande pour devenir prestataire. Nous vous répondrons rapidement.",
};

export default function ProviderRegisterPage() {
  return (
    <div className="mx-auto pt-8 pb-16">
      <section className="page-content px-4 sm:px-6 lg:px-8 relative">
        <div className="relative z-10 w-full mx-auto max-w-[80rem]">
          <div className="grid lg:grid-cols-12 gap-6 md:gap-8 lg:gap-10 items-center">
          <div className="lg:col-span-6">
            <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 ring-1 ring-primary-100">Prestataires locaux</span>
            <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
              Devenez prestataire sur Domofix
            </h1>
            <p className="mt-3 text-gray-600">
              Rejoignez la plateforme qui connecte des milliers de clients avec des prestataires de confiance. Postulez en quelques minutes et commencez à développer votre activité.
            </p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Plus de visibilité</p>
                  <p className="text-sm text-gray-600">Attirez de nouveaux clients dans votre zone.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Confiance et sécurité</p>
                  <p className="text-sm text-gray-600">Nous validons les profils et documents.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Développement garanti</p>
                  <p className="text-sm text-gray-600">Optimisez vos revenus avec nos outils.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Inscription rapide</p>
                  <p className="text-sm text-gray-600">Demande traitée sous 24–48h.</p>
                </div>
              </div>
            </div>
            <a href="#apply-form" className="mt-6 inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
              Commencer ma demande
            </a>
          </div>
          <div className={`lg:col-span-6 relative mx-auto h-72 w-full max-w-[240px] sm:h-80 sm:max-w-[280px] md:h-80 md:max-w-[320px] lg:h-96 lg:max-w-[360px] transition-transform duration-300 ease-out hover:-translate-y-1 hover:scale-[1.01] will-change-transform ${styles.heroImageEnter}`}>
            <Image
              src="/assets/images/hero.png"
                alt="Prestataire heureux utilisant Domofix"
              fill
              className="object-contain rounded-xl"
              priority
            />
          </div>
        </div>
        </div>
      </section>

      <section id="apply-form" className="mt-12 container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <ProviderRegistrationForm />
      </section>
    </div>
  );
}

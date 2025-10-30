import type { Metadata } from "next";
import { ProviderRegistrationForm } from "@/components/auth/provider-registration-form";

export const metadata: Metadata = {
  title: "Inscription prestataire — Tawa",
  description:
    "Créez votre compte prestataire et démarrez votre premier mois gratuit.",
};

export default function ProviderRegisterPage() {
  return (
    <div className="container mx-auto max-w-4xl pt-8 pb-16 px-4 sm:px-6 lg:px-8">
      <ProviderRegistrationForm />
    </div>
  );
}

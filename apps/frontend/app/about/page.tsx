import { Metadata } from "next";
import { AboutHero, AboutSection, ValueItem, TeamMemberCard } from "@/features/about";
import { CheckCircle2, ShieldCheck, Rocket, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "À propos | Domofix",
  description: "Découvrez Domofix — notre mission, nos valeurs, et notre équipe.",
};

export default function AboutPage() {
  return (
    <main>
      <AboutHero
        title="À propos de Domofix"
        subtitle="Nous simplifions la maintenance immobilière en connectant résidents, prestataires et gestionnaires, avec des workflows fiables et une communication transparente."
        primaryCta={{ label: "Commencer", href: "/get-started" }}
        secondaryCta={{ label: "Nous contacter", href: "/contact" }}
      />

      <AboutSection
        title="Nos valeurs"
        description="Fiabilité, confiance et rapidité — nous voulons que chaque intervention se déroule sans friction."
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
          <ValueItem
            icon={<CheckCircle2 className="h-5 w-5" aria-hidden="true" />}
            title="Fiabilité"
            description="Des workflows prévisibles et des engagements clairs pour que chacun sache à quoi s’attendre."
          />
          <ValueItem
            icon={<ShieldCheck className="h-5 w-5" aria-hidden="true" />}
            title="Confiance"
            description="Prestataires vérifiés et communication transparente entre toutes les parties."
          />
          <ValueItem
            icon={<Rocket className="h-5 w-5" aria-hidden="true" />}
            title="Rapidité"
            description="Routage intelligent et automatisation pour résoudre les problèmes plus vite, de bout en bout."
          />
          <ValueItem
            icon={<Users className="h-5 w-5" aria-hidden="true" />}
            title="Orienté humain"
            description="Des expériences soignées pour les résidents, les prestataires et les gestionnaires."
          />
        </div>
      </AboutSection>

      <AboutSection title="Notre équipe" description="Une petite équipe dédiée qui construit des outils fiables pour la maintenance du quotidien.">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <TeamMemberCard name="Ibrahim Taibi" role="Fondateur" />
          <TeamMemberCard name="Votre nom" role="Produit" />
          <TeamMemberCard name="Partenaire prestataire" role="Opérations" />
        </div>
      </AboutSection>
    </main>
  );
}
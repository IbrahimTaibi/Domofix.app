"use client";

import { Search, BarChart3, Calendar, CheckCircle } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      number: "1",
      title: "Recherchez",
      description: "Trouvez le service dont vous avez besoin.",
      icon: Search,
    },
    {
      number: "2",
      title: "Comparez",
      description: "Comparez les prix et les avis.",
      icon: BarChart3,
    },
    {
      number: "3",
      title: "Réservez",
      description: "Choisissez l’heure et confirmez.",
      icon: Calendar,
    },
    {
      number: "4",
      title: "C’est fait",
      description: "Recevez votre service.",
      icon: CheckCircle,
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-20 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-light text-gray-900 mb-3">
            Comment ça marche
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Réserver des services locaux n’a jamais été aussi simple.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div
                key={index}
                className="text-center transition-transform will-change-transform hover:translate-y-[-2px]">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-[#0D77FF]/40 bg-[#0D77FF]/5 mb-4">
                  <IconComponent className="w-6 h-6 text-[#0D77FF]" />
                </div>
                <div className="text-sm font-medium text-gray-400 mb-2">
                  {step.number}
                </div>
                <h3 className="text-base font-medium text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

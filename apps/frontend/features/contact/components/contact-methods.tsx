import { Mail, Phone, MessageSquare, MapPin } from "lucide-react";

export default function ContactMethods() {
  const methods = [
    {
      icon: Mail,
      title: "Email",
      description: "Envoyez-nous un message et nous vous répondrons rapidement.",
      value: "support@domofix.com",
      href: "mailto:support@domofix.com",
    },
    {
      icon: MessageSquare,
      title: "WhatsApp",
      description: "Discutez avec nous pour une assistance en direct.",
      value: "+33 6 12 34 56 78",
      href: "https://wa.me/33612345678",
    },
    {
      icon: Phone,
      title: "Téléphone",
      description: "Appelez notre équipe du lundi au samedi, 9h–19h.",
      value: "+33 1 23 45 67 89",
      href: "tel:+33123456789",
    },
    {
      icon: MapPin,
      title: "Adresse",
      description: "Passez nous voir sur rendez-vous.",
      value: "Paris, Île-de-France",
      href: "#",
    },
  ];

  return (
    <section id="methods" className="py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-light text-gray-900 mb-3">Moyens de contact</h2>
          <p className="text-gray-600 max-w-xl mx-auto">Choisissez la méthode qui vous convient le mieux.</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {methods.map((m) => {
            const Icon = m.icon;
            return (
              <a
                key={m.title}
                href={m.href}
                target={m.href.startsWith("http") ? "_blank" : undefined}
                rel={m.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group rounded-lg border border-gray-200 p-5 hover:bg-gray-50 transition-all will-change-transform hover:-translate-y-0.5"
              >
                <div className="flex items-start gap-3">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full border-2 border-[#0D77FF]/40 bg-[#0D77FF]/5">
                    <Icon className="w-5 h-5 text-[#0D77FF]" />
                  </div>
                  <div>
                    <div className="text-base font-medium text-gray-900">{m.title}</div>
                    <div className="text-sm text-gray-600">{m.description}</div>
                    <div className="text-sm text-gray-800 mt-1">{m.value}</div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
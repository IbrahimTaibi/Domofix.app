"use client";

import Link from "next/link";
import { Button } from "@/shared/components";
import { useMobile } from "@/shared/hooks";

export default function ContactHero() {
  const isMobile = useMobile();
  return (
    <section className="page-content pb-20 md:pb-24 px-4 sm:px-6 lg:px-8 relative">
      {/* Mobile: simple top gradient */}
      {isMobile && (
        <div
          className="absolute left-0 right-0 top-0 pointer-events-none"
          style={{
            height: "85%",
            background:
              "linear-gradient(to bottom, rgba(237,242,255,1) 0%, rgba(237,242,255,0.85) 18%, rgba(237,242,255,0.7) 36%, rgba(237,242,255,0.5) 58%, rgba(237,242,255,0.25) 85%, rgba(237,242,255,0) 100%)",
          }}
        ></div>
      )}

      {/* Desktop: split background */}
      {!isMobile && (
        <div className="absolute inset-0 grid grid-cols-2">
          <div className="bg-white"></div>
          <div className="relative">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, #edf2ff 0%, #e6eeff 33%, #eaf2ff 66%, #edf2ff 100%)",
                backgroundSize: "200% 200%",
                animation: "bgShift 18s ease-in-out infinite alternate",
              }}
            />
            {/* Soft fade into white on the left edge of animated half */}
            <div className="absolute inset-y-0 left-0 w-56 xl:w-64 bg-gradient-to-l from-transparent to-white/95"></div>
          </div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-6 md:gap-8 lg:gap-10 items-center">
          <div className="lg:col-span-7">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-gray-900 mb-5 sm:mb-6 tracking-tight">
              Contactez-nous
              <span className="block font-normal text-gray-700 mt-2">
                Nous sommes là pour vous aider
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 font-light leading-relaxed max-w-2xl">
              Des questions, des suggestions ou besoin d’assistance ? Notre équipe support vous répond rapidement pour vous offrir la meilleure expérience.
            </p>
            <div className={`flex gap-3 ${isMobile ? 'flex-col' : 'flex-row gap-4'}`}>
              <Link href="#contact-form" className={isMobile ? "flex-1" : "flex-initial"}>
                <Button variant="primary" size="lg" className="w-full">Envoyer un message</Button>
              </Link>
              <Link href="#methods" className={isMobile ? "flex-1" : "flex-initial"}>
                <Button variant="outline" size="lg" className="w-full">Voir les options</Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 w-full min-w-0 mt-8 lg:mt-0">
            <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl ring-1 ring-black/5 p-6">
              <div className="grid grid-cols-1 gap-4">
                {[
                  { title: "Support", desc: "Réponse sous 24h", href: "#contact-form" },
                  { title: "WhatsApp", desc: "+33 6 12 34 56 78", href: "https://wa.me/33612345678" },
                  { title: "Email", desc: "support@domofix.com", href: "mailto:support@domofix.com" },
                  { title: "Disponibilité", desc: "Lun–Sam, 9h–19h" },
                ].map((item) => {
                  const content = (
                    <dl className="rounded-lg border border-gray-200 p-4 bg-white">
                      <dt className="text-sm font-medium text-gray-900">{item.title}</dt>
                      <dd className="text-sm text-gray-600">{item.desc}</dd>
                    </dl>
                  );

                  if (item.href) {
                    const isExternal = item.href.startsWith('http');
                    return (
                      <a
                        key={item.title}
                        href={item.href}
                        aria-label={`${item.title}: ${item.desc}`}
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noopener noreferrer" : undefined}
                        className="block rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {content}
                      </a>
                    );
                  }

                  return (
                    <div key={item.title} className="rounded-lg">
                      {content}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bgShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </section>
  );
}
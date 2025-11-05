"use client";

import Link from "next/link";
import { Button } from "@/shared/components";
import SearchPreview from "@/shared/components/search-preview";
import { CheckCircle2 } from "lucide-react";
import { useMobile } from "@/shared/hooks";

export default function HeroSection() {
  const isMobile = useMobile();
  
  return (
    <section className="page-content pb-20 md:pb-28 lg:pb-32 px-4 sm:px-6 lg:px-8 relative">
      {/* Mobile: simple white background */}
      {isMobile && <div className="absolute inset-0 bg-white"></div>}
      
      {/* Mobile: top gradient that fades as it goes down */}
      {isMobile && (
        <div
          className="absolute left-0 right-0 top-0 pointer-events-none"
          style={{
            height: "85%",
            background:
              "linear-gradient(to bottom, rgba(237,242,255,1) 0%, rgba(237,242,255,0.85) 18%, rgba(237,242,255,0.7) 36%, rgba(237,242,255,0.5) 58%, rgba(237,242,255,0.25) 85%, rgba(237,242,255,0) 100%)",
          }}></div>
      )}
      
      {/* Desktop: split background */}
      {!isMobile && (
        <div className="absolute inset-0 grid grid-cols-2">
          <div className="bg-white"></div>
          <div className="relative">
            <div className="animated-bg absolute inset-0"></div>
            {/* Soft fade into white on the left edge of animated half */}
            <div className="absolute inset-y-0 left-0 w-56 xl:w-64 bg-gradient-to-l from-transparent to-white/95"></div>
          </div>
        </div>
      )}

      <div
        className="relative z-10 w-full mx-auto"
        style={{ maxWidth: "min(80rem, 100%)" }}>
        <div className="grid lg:grid-cols-12 gap-6 md:gap-8 lg:gap-10 items-center">
          {/* Left column: copy and CTAs */}
          <div className="lg:col-span-6 w-full">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-gray-900 mb-5 sm:mb-6 tracking-tight break-words">
              Les services de votre ville
              <span className="block font-normal text-gray-700 mt-2">
                au même endroit
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 font-light leading-relaxed">
              Connectez-vous avec des professionnels de confiance près de chez vous. De
              la plomberie aux cours particuliers,
              <span className="font-normal text-gray-800"> tout ce dont vous avez besoin</span>
              {" "}est à portée de main.
            </p>

            {/* Quick highlights */}
            <ul className={`flex-wrap gap-3 mb-8 sm:mb-10 ${isMobile ? 'hidden' : 'flex'}`}>
              {[
                "Services à domicile",
                "Apprentissage et cours",
                "Santé et bien-être",
              ].map((label) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/80 ring-1 ring-gray-200 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#0D77FF]" />
                  <span className="text-sm text-gray-700">{label}</span>
                </li>
              ))}
            </ul>

            <div className={`flex gap-3 ${isMobile ? 'flex-col' : 'flex-row gap-4'}`}>
              <Link href="/get-started" className={isMobile ? "flex-1" : "flex-initial"}>
                <Button variant="primary" size="lg" className="w-full">
                  Commencer à explorer
                </Button>
              </Link>
              <Link href="#how-it-works" className={isMobile ? "flex-1" : "flex-initial"}>
                <Button variant="outline" size="lg" className="w-full">
                  En savoir plus
                </Button>
              </Link>
            </div>
          </div>

          {/* Right column: glass card with preview */}
          <div className="lg:col-span-6 w-full min-w-0 mt-8 lg:mt-0">
            <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl ring-1 ring-black/5 p-5 sm:p-6 md:p-8">
              <SearchPreview />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animated-bg {
          background: linear-gradient(
            135deg,
            #edf2ff 0%,
            #e6eeff 33%,
            #eaf2ff 66%,
            #edf2ff 100%
          );
          background-size: 200% 200%;
          animation: bgShift 18s ease-in-out infinite alternate;
        }

        @keyframes bgShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </section>
  );
}

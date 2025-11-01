"use client";

import Link from "next/link";
import { Button } from "@/components/ui";
import SearchPreview from "@/components/features/search-preview";

export default function HeroSection() {
  return (
    <section
      className="pt-32 pb-32 px-4 sm:px-6 lg:px-8 relative"
      style={{
        backgroundImage: "url(/assets/images/hero.png)",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}>
      {/* Background image covers entire hero */}
      <div className="absolute inset-0 animated-overlay"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6 tracking-tight">
            Your City's Services
            <span className="block font-normal text-gray-700 mt-2">
              In One Place
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Connect with trusted professionals in your neighborhood. From
            plumbers to tutors, everything you need is just a tap away.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/register">
              <Button variant="primary" size="lg">
                Start Exploring
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </Link>
          </div>

          {/* Search Preview - Clean and Minimal */}
          <SearchPreview />
        </div>
      </div>

      <style jsx>{`
        .animated-overlay {
          background: linear-gradient(
            120deg,
            rgba(237, 242, 255, 0.9) 0%,
            rgba(237, 242, 255, 0.7) 50%,
            rgba(237, 242, 255, 0.85) 100%
          );
          background-size: 200% 200%;
          animation: subtleShift 16s ease-in-out infinite alternate;
        }

        @keyframes subtleShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </section>
  );
}

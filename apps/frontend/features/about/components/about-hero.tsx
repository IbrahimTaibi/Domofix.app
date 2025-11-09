"use client";
import Link from "next/link";
import { Button } from "@/shared/components";
import { Building2 } from "lucide-react";

type AboutHeroProps = {
  title: string;
  subtitle?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

export function AboutHero({ title, subtitle, primaryCta, secondaryCta }: AboutHeroProps) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#0D77FF]/40 bg-[#0D77FF]/5">
          <Building2 className="h-7 w-7 text-[#0D77FF]" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-light text-gray-900 sm:text-4xl">{title}</h1>
        {subtitle ? (
          <p className="mx-auto mt-4 max-w-2xl text-gray-600">{subtitle}</p>
        ) : null}

        {(primaryCta || secondaryCta) && (
          <div className="mt-8 flex items-center justify-center gap-3">
            {primaryCta ? (
              <Link href={primaryCta.href}>
                <Button size="lg">{primaryCta.label}</Button>
              </Link>
            ) : null}
            {secondaryCta ? (
              <Link href={secondaryCta.href}>
                <Button variant="outline" size="lg">{secondaryCta.label}</Button>
              </Link>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
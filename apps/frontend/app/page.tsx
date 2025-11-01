import {
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  StatsSection,
  ProvidersSection,
} from "@/components/sections";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <StatsSection />
      <ProvidersSection />
    </main>
  );
}

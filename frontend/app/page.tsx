import { LandingNav } from "@/components/landing/LandingNav";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Capabilities } from "@/components/landing/Capabilities";
import { Models } from "@/components/landing/Models";
import { Chains } from "@/components/landing/Chains";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">

      {/* <LandingNav /> */}
      <Hero />
      <HowItWorks />
      <Capabilities />
      <Models />
      <Chains />
      <FinalCTA />
      <Footer />
    </main>
  );
}
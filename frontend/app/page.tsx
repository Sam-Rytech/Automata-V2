import { LandingNav } from "@/components/landing/LandingNav";
import { Hero } from "@/components/landing/Hero";
import { Models } from "@/components/landing/Models";
import { X402Banner } from "@/components/landing/X402Banner";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Capabilities } from "@/components/landing/Capabilities";
import { Chains } from "@/components/landing/Chains";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

const getLandingPageComponents = () => [
  <LandingNav key="LandingNav" />, 
  <Hero key="Hero" />, 
  <Models key="Models" />, 
  <X402Banner key="X402Banner" />, 
  <HowItWorks key="HowItWorks" />, 
  <Capabilities key="Capabilities" />, 
  <Chains key="Chains" />, 
  <FinalCTA key="FinalCTA" />, 
  <Footer key="Footer" />
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
      {getLandingPageComponents()}
    </main>
  );
}

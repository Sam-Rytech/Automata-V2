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
  <LandingNav key="nav" />, 
  <Hero key="hero" />, 
  <Models key="models" />, 
  <X402Banner key="x402Banner" />, 
  <HowItWorks key="howItWorks" />, 
  <Capabilities key="capabilities" />, 
  <Chains key="chains" />, 
  <FinalCTA key="finalCTA" />, 
  <Footer key="footer" />
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
      {getLandingPageComponents()}
    </main>
  );
}
import { Button } from "@/components/ui/button";

export function LandingNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glassmorphism bg-[#0F0F1A]/80 border-b border-b-white/5 h-20 px-8 flex items-center justify-between">
      <div className="text-white font-syne font-bold text-2xl tracking-widest">
        AUTOMATA
      </div>
      
      <div className="hidden md:flex items-center gap-12 text-sm uppercase tracking-widest font-mono text-white/70">
        <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
        <a href="#chains" className="hover:text-white transition-colors">Chains</a>
        <a href="#models" className="hover:text-white transition-colors">Models</a>
      </div>

      <div>
        <Button variant="outline" className="text-white border-white/20 hover:border-white/40">
          Launch App
        </Button>
      </div>
    </nav>
  );
}

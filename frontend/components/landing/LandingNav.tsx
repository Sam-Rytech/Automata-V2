'use client';
import { Button } from "@/components/ui/button";

export function LandingNav() {
  return (
    <div className="fixed top-8 left-0 right-0 z-50 flex justify-center px-4">
      <nav className="glassmorphism rounded-xs flex items-center justify-between gap-8 px-8 py-3 w-full md:w-3/4 crosshair-corners relative overflow-hidden">
        {/* Branding */}
        <div className="flex items-center cursor-pointer">
          <span className="font-mono text-2xl font-black text-white tracking-tighter uppercase">
            Automata
          </span>
        </div>

        {/* Action */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="text-white border-white/20 tech-button bg-transparent hover:bg-white/5 font-syne text-base uppercase tracking-wider h-11 px-8 relative"
          >
            <span className="tech-corners-extra" />
            Launch App
          </Button>
        </div>
      </nav>
    </div>
  );
}

'use client';
import { Button } from "@/components/ui/button";

export function LandingNav() {
  return (
    <div className="fixed top-8 left-0 right-0 z-50 flex justify-center px-4">
      <nav className="glassmorphism rounded-xs flex items-center justify-between gap-8 px-8 py-3 w-full md:w-3/4 crosshair-corners relative overflow-hidden">
        {/* Branding */}
        <div className="flex items-center cursor-pointer">
          <span className="text-white font-syne font-bold text-lg md:text-xl tracking-[0.3em] uppercase">
            Automata
          </span>
        </div>

        {/* Action */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            className="text-white border-white/20 tech-button bg-transparent hover:bg-white/5 font-mono text-xs md:text-sm uppercase tracking-widest h-10 px-6 md:px-8 relative"
          >
            <span className="tech-corners-extra" />
            Launch App
          </Button>
        </div>
      </nav>
    </div>
  );
}

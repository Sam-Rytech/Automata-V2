'use client';

import { Button } from "@/components/ui/button";
import DarkVeil from '../DarkVeil';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';

export function FinalCTA() {
  const router = useRouter();
  const { login, authenticated, ready } = usePrivy();

  const handleLaunch = () => {
    if (!ready) return;
    if (authenticated) {
      router.push('/build');
    } else {
      localStorage.setItem('postLoginRedirect', '/build');
      login();
    }
  };

  return (
    <section className="relative min-h-[80vh] flex flex-col justify-center py-40 px-4 bg-[var(--bg-primary)] overflow-hidden border-t border-[var(--border-subtle)]">
      
      {/* --- BACKGROUND LAYERS --- */}
      {/* 1. Dot Grid */}
      <div className="absolute inset-0 bg-dot-grid opacity-80 pointer-events-none z-0" />

      {/* 2. DarkVeil Aurora */}
      <div className="absolute bottom-0 left-0 w-full h-[50vh] pointer-events-none z-0">
        <div
          className="absolute inset-0"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 50%, black 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 50%, black 100%)'
          }}
        >
          <DarkVeil
            hueShift={291}
            noiseIntensity={0}
            scanlineIntensity={0.25}
            speed={0.7}
            scanlineFrequency={0}
            warpAmount={0.8}
          />
        </div>
      </div>

      {/* --- FOREGROUND CONTENT --- */}
      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
        <h2 className="font-syne text-[5rem] md:text-[8rem] font-bold text-white leading-[0.85] uppercase mb-16 tracking-tighter drop-shadow-xl">
          Your money.<br />
          Your agent.<br />
          Every chain.
        </h2>
        
        <Button size="lg" className="w-[280px]" onClick={handleLaunch}>
          Launch Automata
        </Button>
      </div>
    </section>
  );
}

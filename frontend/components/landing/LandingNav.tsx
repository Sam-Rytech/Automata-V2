'use client';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { useEffect } from 'react';

export function LandingNav() {
  const router = useRouter();
  const { login, authenticated, ready } = usePrivy();

  // Once Privy finishes authenticating, redirect to /build
  useEffect(() => {
    if (ready && authenticated) {
      router.push('/build');
    }
  }, [ready, authenticated, router]);

  const handleLaunch = () => {
    if (authenticated) {
      // Already logged in — go straight to /build
      router.push('/build');
    } else {
      // Open Privy modal — useEffect above handles the redirect on success
      login();
    }
  };

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
            onClick={handleLaunch}
            disabled={!ready}
          >
            <span className="tech-corners-extra" />
            {!ready ? 'Loading...' : 'Launch App'}
          </Button>
        </div>
      </nav>
    </div>
  );
}
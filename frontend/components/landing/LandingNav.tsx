'use client';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useRef } from 'react';

export function LandingNav() {
  const router = useRouter();
  const { login, authenticated, ready } = usePrivy();

  // Track whether the user explicitly clicked "Launch App" in this session.
  // Without this flag, the useEffect fires on every page load for already-
  // authenticated users — causing the logo "back to landing" link to
  // immediately redirect them to /build before they can click anything.
  const loginIntentRef = useRef(false);

  useEffect(() => {
    // Only redirect if the user just went through the login flow here.
    // If they were already authenticated when they loaded the landing page,
    // leave them alone — they're browsing the landing page intentionally.
    if (ready && authenticated && loginIntentRef.current) {
      router.push('/build');
    }
  }, [ready, authenticated, router]);

  const handleLaunch = () => {
    if (authenticated) {
      // Already logged in — go straight to /build immediately
      router.push('/build');
    } else {
      // Mark that login was user-initiated before opening the modal
      loginIntentRef.current = true;
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
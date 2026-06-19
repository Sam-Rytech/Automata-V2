'use client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { useRef, useEffect } from 'react';
import { useMiniPay } from '@/components/providers/MiniPayProvider';

const getRedirectUrl = (isMiniPay: boolean, authenticated: boolean, redirect: string | null) => {
  if (isMiniPay && authenticated) return '/chat';
  if (redirect) return redirect;
  return '/build';
};

const handleRedirect = (router: any, isMiniPay: boolean, authenticated: boolean, redirect: string | null) => {
  const url = getRedirectUrl(isMiniPay, authenticated, redirect);
  router.push(url);
};

const handleLaunch = (router: any, login: any, authenticated: boolean, isMiniPay: boolean, ready: boolean) => {
  if (!ready || isMiniPay) return;
  if (authenticated) {
    router.push('/build');
  } else {
    localStorage.setItem('postLoginRedirect', '/build');
    login();
  }
};

export function LandingNav() {
  const router = useRouter();
  const { login, authenticated, ready } = usePrivy();
  const { isMiniPay } = useMiniPay();

  useEffect(() => {
    if (ready && authenticated) {
      const redirect = localStorage.getItem('postLoginRedirect');
      if (redirect) {
        localStorage.removeItem('postLoginRedirect');
      }
      handleRedirect(router, isMiniPay, authenticated, redirect);
    }
  }, [isMiniPay, ready, authenticated, router]);

  return (
    <div className='fixed top-8 left-0 right-0 z-50 flex justify-center px-4'>
      <nav className='glassmorphism rounded-xs flex items-center justify-between gap-8 px-8 py-3 w-full md:w-3/4 crosshair-corners relative overflow-hidden'>
        {/* Branding */}
        <div className='flex items-center cursor-pointer'>
          <span className='font-mono text-2xl font-black text-white tracking-tighter uppercase'>Automata</span>
        </div>
        {/* Action */}
        <div className='flex items-center gap-4'>
          <Button
            variant='outline'
            className='text-white border-white/20 tech-button bg-transparent hover:bg-white/5 font-syne text-xs sm:text-base uppercase tracking-wider h-9 sm:h-11 px-4 sm:px-8 relative'
            onClick={() => handleLaunch(router, login, authenticated, isMiniPay, ready)}
          >
            <span className='tech-corners-extra' />
            Launch App
          </Button>
        </div>
      </nav>
    </div>
  );
}
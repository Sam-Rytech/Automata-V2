'use client';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * AuthGuard — wrap any page that requires authentication.
 *
 * Usage in any app page:
 *   import { AuthGuard } from '@/components/AuthGuard';
 *
 *   export default function BuildPage() {
 *     return (
 *       <AuthGuard>
 *         <YourPageContent />
 *       </AuthGuard>
 *     );
 *   }
 *
 * While Privy is initialising it shows a blank dark screen (no flash of content).
 * Once ready:
 *   - authenticated  → renders children normally
 *   - not authenticated → redirects to /
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && !authenticated) {
      router.replace('/');
    }
  }, [ready, authenticated, router]);

  // Privy not ready yet — show nothing to avoid flash of protected content
  if (!ready) {
    return (
      <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#E91E8C] border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-[11px] text-white/30 uppercase tracking-widest">
            Authenticating...
          </span>
        </div>
      </div>
    );
  }

  // Authenticated — render the page
  if (authenticated) {
    return <>{children}</>;
  }

  // Not authenticated and redirect is in flight — render nothing
  return null;
}
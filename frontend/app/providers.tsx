'use client';

import { MiniPayProvider } from '@/components/providers/MiniPayProvider';
import { PrivyProvider } from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StellarProvider } from './StellarProvider';
import { WagmiProvider } from '@privy-io/wagmi';
import { base, celo, mainnet } from 'viem/chains';
import { wagmiConfig } from '@/lib/wagmi-config';

const queryClient = new QueryClient();

const getPrivyConfig = () => ({
  loginMethods: ['email', 'google', 'wallet'],
  appearance: {
    theme: 'dark',
    accentColor: '#E91E8C',
  },
  embeddedWallets: {
    ethereum: { createOnLogin: 'all-users' },
  },
  supportedChains: [base, celo, mainnet],
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={getPrivyConfig()}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <StellarProvider>
            <MiniPayProvider>
              {children}
            </MiniPayProvider>
          </StellarProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
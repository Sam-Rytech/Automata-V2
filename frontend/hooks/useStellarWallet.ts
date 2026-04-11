import { useState, useEffect } from 'react';
import { useWallets, useCreateWallet } from '@privy-io/react-auth';
import { toast } from 'sonner';
import {
  isConnected as freighterIsConnected,
  getAddress as freighterGetAddress,
  signTransaction as freighterSignTransaction,
} from '@stellar/freighter-api';
import { submitStellarTx } from '@/lib/api';

// ── Stellar Signing Scope Note ─────────────────────────────────────────────────
// Regular Stellar transfers (XLM, USDC): signTransaction is sufficient.
// Both Freighter and Privy embedded wallets support this path.
//
// Soroban smart contract calls (x402 payments, DeFi): require signAuthEntry.
// Freighter v6 supports signAuthEntry. Privy embedded Stellar wallets do NOT.
//
// Implication: Users without Freighter (Privy embedded fallback) are limited
// to basic transfers only. Any Soroban/x402 feature must gate on freighterAddress
// being present before proceeding.
// ──────────────────────────────────────────────────────────────────────────────

const STELLAR_PASSPHRASE = 'Public Global Stellar Network ; September 2015';

export function useStellarWallet() {
  const { wallets } = useWallets();
  const { createWallet } = useCreateWallet();
  const [freighterAddress, setFreighterAddress] = useState<string | null>(null);

  useEffect(() => {
    freighterIsConnected()
      .then((res) => {
        if (res.isConnected) {
          freighterGetAddress()
            .then((res2) => setFreighterAddress(res2.address))
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (freighterAddress) return;
    const stellarWallet = wallets.find((w: any) => w.chainType === 'stellar');
    if (wallets.length > 0 && !stellarWallet) {
      (createWallet as any)({ chainType: 'stellar' }).catch((err: any) => {
        console.warn('[Automata] Privy Stellar wallet creation failed:', err);
      });
    }
  }, [wallets, freighterAddress]);

  const connectFreighter = async () => {
    try {
      const { isConnected } = await freighterIsConnected();
      if (!isConnected) {
        toast.error('Freighter Not Found', {
          description: 'Install the Freighter extension to use your own Stellar wallet.',
        });
        return;
      }
      const { address } = await freighterGetAddress();
      setFreighterAddress(address);
      toast.success('Freighter Connected', {
        description: `Stellar: ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    } catch (err: any) {
      toast.error('Freighter Error', { description: err.message });
    }
  };

  const signAndSubmitStellar = async (xdr: string): Promise<string> => {
    try {
      const { isConnected } = await freighterIsConnected();
      if (isConnected) {
        const { signedTxXdr } = await freighterSignTransaction(xdr, {
          networkPassphrase: STELLAR_PASSPHRASE,
        });
        return await submitStellarTx(signedTxXdr, '');
      }
    } catch (freighterErr) {
      console.warn('[Stellar] Freighter unavailable, falling back to Privy:', freighterErr);
    }

    const stellarWallet = wallets.find((w: any) => w.chainType === 'stellar');
    const privyWalletId = (stellarWallet as any)?.id ?? null;
    if (!privyWalletId) {
      throw new Error('No Stellar wallet available. Install Freighter or reconnect.');
    }
    return await submitStellarTx(xdr, privyWalletId);
  };

  const privyStellarWallet = wallets.find((w: any) => w.chainType === 'stellar');

  return {
    freighterAddress,
    privyStellarWallet,
    connectFreighter,
    signAndSubmitStellar,
  };
}

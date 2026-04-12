'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { StellarWalletsKit, KitEventType } from '@creit-tech/stellar-wallets-kit';
import { defaultModules } from '@creit-tech/stellar-wallets-kit/modules/utils';
import { Networks } from '@stellar/stellar-sdk';

interface StellarContextType {
  stellarAddress: string | null;
  connectStellar: () => Promise<void>;
  disconnectStellar: () => void;
  signStellarTransaction: (xdr: string) => Promise<string>;
}

const StellarContext = createContext<StellarContextType>({
  stellarAddress: null,
  connectStellar: async () => { },
  disconnectStellar: () => { },
  signStellarTransaction: async () => '',
});

export function useStellar() {
  return useContext(StellarContext);
}

export function StellarProvider({ children }: { children: React.ReactNode }) {
  const [stellarAddress, setStellarAddress] = useState<string | null>(null);

  useEffect(() => {
    // Initialize the singleton once on mount
    StellarWalletsKit.init({ modules: defaultModules() });

    // Restore saved address on page load
    const savedAddress = localStorage.getItem('stellar_address');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedAddress) setStellarAddress(savedAddress);

    // Listen for disconnect events from the kit's built-in UI
    const unsub = StellarWalletsKit.on(KitEventType.DISCONNECT, () => {
      setStellarAddress(null);
      localStorage.removeItem('stellar_address');
    });

    // Listen for address updates
    const unsubState = StellarWalletsKit.on(KitEventType.STATE_UPDATED, (event) => {
      if (event.payload.address) {
        setStellarAddress(event.payload.address);
        localStorage.setItem('stellar_address', event.payload.address);
      }
    });

    return () => {
      unsub();
      unsubState();
    };
  }, []);

  const connectStellar = async () => {
    try {
      const { address } = await StellarWalletsKit.authModal();
      setStellarAddress(address);
      localStorage.setItem('stellar_address', address);
    } catch (error) {
      console.error('Stellar connect error:', error);
    }
  };

  const disconnectStellar = () => {
    try {
      StellarWalletsKit.disconnect();
    } catch (e) {
      // disconnect may throw if already disconnected
    }
    setStellarAddress(null);
    localStorage.removeItem('stellar_address');
  };

  const signStellarTransaction = async (xdr: string): Promise<string> => {
    if (!stellarAddress) throw new Error('No Stellar wallet connected');
    const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, {
      networkPassphrase: Networks.PUBLIC,
      address: stellarAddress,
    });
    return signedTxXdr;
  };

  return (
    <StellarContext.Provider value={{
      stellarAddress,
      connectStellar,
      disconnectStellar,
      signStellarTransaction,
    }}>
      {children}
    </StellarContext.Provider>
  );
}
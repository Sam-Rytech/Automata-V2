'use client';

import { saveHistoryToDb, UnsignedTx } from '@/lib/api';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'https://automata-backend-production.up.railway.app';

const CHAIN_IDS: Record<string, number> = {
  base: 8453,
  celo: 42220,
  ethereum: 1,
};

export function useTransactionExecutor() {
  const executeSequence = async (
    txsToExecute: UnsignedTx[],
    activeWallet: any,
    stellarContext: {
      address: string | null;
      signTransaction: (xdr: string) => Promise<string>;
    },
    sourceContext: {
      type: 'AGENT_EXECUTION' | 'FLOW';
      stepCount: number;
    },
    onBridgeRelayStarted?: () => void
  ): Promise<string> => {
    if (!activeWallet || txsToExecute.length === 0) {
      throw new Error('Missing wallet or transactions.');
    }

    let lastTxHash = '';

    try {
      for (const tx of txsToExecute) {
        if (tx.chainId === 'stellar') {
          // ── Stellar signing path ──────────────────────────────────────────
          if (!stellarContext.address) {
            throw new Error('No Stellar wallet connected. Please connect your Stellar wallet in the sidebar.');
          }
          if (!tx.xdr) {
            throw new Error('No XDR found for Stellar transaction.');
          }

          const signedXdr = await stellarContext.signTransaction(tx.xdr);

          const { Horizon, Transaction, Networks } = await import('@stellar/stellar-sdk');
          const server = new Horizon.Server('https://horizon.stellar.org');
          const horizonResult = await server.submitTransaction(
            new Transaction(signedXdr, Networks.PUBLIC)
          );
          lastTxHash = horizonResult.hash;

        } else {
          // ── EVM signing path ──────────────────────────────────────────────
          const targetChainId = CHAIN_IDS[tx.chainId];
          if (targetChainId) {
            await activeWallet.switchChain(targetChainId);
          }
          const provider = await activeWallet.getEthereumProvider();
          lastTxHash = await provider.request({
            method: 'eth_sendTransaction',
            params: [{
              to: tx.to,
              data: tx.data,
              value: tx.value || '0x0',
              from: activeWallet.address
            }]
          });

          // ── Bridge relay trigger ──────────────────────────────────────────
          const meta = (tx as any).bridgeMeta;
          if (meta?.toChain === 'stellar' && (tx as any).txType === 'burn') {
            const recipientAddr = meta.recipientAddress || stellarContext.address;
            if (recipientAddr) {
              fetch(`${BACKEND_URL}/api/bridge/relay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  burnTxHash: lastTxHash,
                  recipientAddress: recipientAddr,
                  amount: meta.amount,
                }),
              }).catch(err => console.error('[Bridge Relay] Failed to start relay:', err));
              
              if (onBridgeRelayStarted) {
                onBridgeRelayStarted();
              }
            }
          }
        }
      }

      // ── Database History Hookup ───────────────────────────────────────
      try {
        await saveHistoryToDb(
          activeWallet.address,
          lastTxHash,
          sourceContext.type,
          'SUCCESS',
          { steps: sourceContext.stepCount, chainId: txsToExecute[0].chainId }
        );
      } catch (dbErr) {
        console.error('Failed to log history to DB:', dbErr);
      }

      return lastTxHash;

    } catch (error: any) {
      // Log failure to DB before re-throwing to the UI
      try {
        await saveHistoryToDb(activeWallet.address, undefined, sourceContext.type, 'FAILED', { error: error.message });
      } catch (e) { }
      
      throw error; 
    }
  };

  return { executeSequence };
}
